import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  onSnapshot,
  Query,
  DocumentData,
} from 'firebase/firestore';
import { db, isFirebaseEnabled } from '@/lib/firebase';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

interface UseFirestoreCollectionOptions<T> {
  collectionName: string;
  firebaseQuery?: Query;
  initialData: T[];
  dataValidator: (item: any) => item is T;
  entityName: string;
}

export function useFirestoreCollection<T extends { id: string }>({
  collectionName,
  firebaseQuery,
  initialData,
  dataValidator,
  entityName,
}: UseFirestoreCollectionOptions<T>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isOnline = useOnlineStatus();

  const setupListener = useCallback(() => {
    let unsubscribe: (() => void) | undefined;
    let retryTimeout: NodeJS.Timeout;
    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 2000;

    if (!isFirebaseEnabled || !db || !isOnline) {
      console.log(
        `Using local ${entityName} data - Firebase disabled or offline`
      );
      const localData = initialData.map((item, index) => ({
        ...item,
        id: `local-${entityName}-${index}`,
      })) as T[];
      setData(localData);
      setLoading(false);
      setError(null);
      return () => {};
    }

    try {
      const q = firebaseQuery || query(collection(db, collectionName));

      unsubscribe = onSnapshot(
        q,
        snapshot => {
          try {
            const items = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
            })) as any[];
            const validItems = items.filter(dataValidator);
            setData(validItems);
            setLoading(false);
            setError(null);
            retryCount = 0;
            console.log(
              `✅ Loaded ${validItems.length} ${entityName}s from Firebase`
            );
          } catch (processingError) {
            console.error(
              `Error processing Firebase ${entityName} data:`,
              processingError
            );
            setError(`Error processing ${entityName} data`);
          }
        },
        err => {
          console.error(`Firebase listener error for ${entityName}s:`, err);
          const errorMessage =
            err instanceof Error ? err.message : 'Unknown error';

          if (
            retryCount < maxRetries &&
            (errorMessage.includes('network') ||
              errorMessage.includes('unavailable'))
          ) {
            retryCount++;
            console.log(
              `🔄 Retrying Firebase connection for ${entityName}s (attempt ${retryCount}/${maxRetries})`
            );
            retryTimeout = setTimeout(
              () => setupListener(),
              retryDelay * retryCount
            );
            return;
          }

          setError(
            `Failed to load ${entityName}s. Showing local data instead.`
          );
          const fallbackData = initialData.map((item, index) => ({
            ...item,
            id: `fallback-${entityName}-${index}`,
          })) as T[];
          setData(fallbackData);
          setLoading(false);
        }
      );
    } catch (setupError) {
      console.error(
        `Error setting up Firebase listener for ${entityName}s:`,
        setupError
      );
      setError('Failed to initialize data connection');
    }

    return () => {
      if (unsubscribe) unsubscribe();
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [
    isOnline,
    collectionName,
    firebaseQuery,
    initialData,
    dataValidator,
    entityName,
  ]);

  useEffect(() => {
    return setupListener();
  }, [setupListener]);

  return { data, loading, error, refetch: setupListener };
}
