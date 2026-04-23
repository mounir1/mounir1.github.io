/**
 * Enhanced Admin Data Service with CRUD Operations
 * @author Mounir Abderrahmani
 * @description Comprehensive data management service with optimized CRUD operations,
 * batch processing, caching, and error handling for the admin panel
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  limit,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  runTransaction,
  Timestamp,
  type DocumentData,
  type QuerySnapshot,
  type Unsubscribe,
  type FirestoreError,
} from 'firebase/firestore';
import { db, isFirebaseEnabled } from '../firebase';
import type { Project, ProjectInput } from '@/types/project';
import type { Skill, SkillInput } from '@/lib/schema/skillSchema';
import type { Experience, ExperienceInput } from '@/types/experience';

// ============================================================================
// Collection Constants
// ============================================================================

export const COLLECTIONS = {
  PROJECTS: 'projects',
  SKILLS: 'skills',
  EXPERIENCES: 'experiences',
  PORTFOLIO_CONFIG: 'portfolio_config',
  ANALYTICS: 'analytics',
  CONTENT_BLOCKS: 'content_blocks',
  SITE_SETTINGS: 'site_settings',
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];

// ============================================================================
// Cache Types
// ============================================================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface CacheConfig {
  enabled: boolean;
  defaultTTL: number; // in milliseconds
  maxEntries: number;
}

const DEFAULT_CACHE_CONFIG: CacheConfig = {
  enabled: true,
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  maxEntries: 100,
};

// ============================================================================
// Error Types
// ============================================================================

export class DataServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public collection?: string,
    public operation?: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'DataServiceError';
  }
}

export class ValidationError extends DataServiceError {
  constructor(
    message: string,
    public field?: string,
    public value?: unknown
  ) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends DataServiceError {
  constructor(collection: string, id: string) {
    super(`Document not found`, 'NOT_FOUND', collection, 'read', {
      collection,
      id,
    });
    this.name = 'NotFoundError';
  }
}

// ============================================================================
// Operation Result Types
// ============================================================================

export interface OperationResult<T> {
  success: boolean;
  data?: T;
  error?: DataServiceError;
  timestamp: number;
  operation: string;
  collection?: string;
}

export interface BatchOperationResult<T> {
  success: boolean;
  results: Array<{
    id?: string;
    success: boolean;
    data?: T;
    error?: DataServiceError;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
  timestamp: number;
}

// ============================================================================
// Enhanced Firebase Data Service Class
// ============================================================================

class AdminDataService {
  private db: any;
  private isEnabled: boolean;
  private cache: Map<string, CacheEntry<any>>;
  private cacheConfig: CacheConfig;
  private activeSubscriptions: Map<string, Unsubscribe>;
  private retryConfig: {
    maxRetries: number;
    baseDelay: number;
    maxDelay: number;
  };

  constructor() {
    this.db = db;
    this.isEnabled = isFirebaseEnabled && !!db;
    this.cache = new Map();
    this.cacheConfig = DEFAULT_CACHE_CONFIG;
    this.activeSubscriptions = new Map();
    this.retryConfig = {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 10000,
    };

    if (!this.isEnabled) {
      console.warn(
        '🔥 Firebase not enabled - AdminDataService will use mock operations'
      );
    }
  }

  // ============================================================================
  // Cache Management
  // ============================================================================

  private getCacheKey(collection: string, id?: string): string {
    return id ? `${collection}:${id}` : collection;
  }

  private getFromCache<T>(key: string): T | null {
    if (!this.cacheConfig.enabled) return null;

    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  private setCache<T>(key: string, data: T, ttl?: number): void {
    if (!this.cacheConfig.enabled) return;

    // Evict oldest entries if cache is full
    if (this.cache.size >= this.cacheConfig.maxEntries) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.cacheConfig.defaultTTL,
    });
  }

  private invalidateCache(collection: string, id?: string): void {
    const key = this.getCacheKey(collection, id);
    if (id) {
      // Invalidate specific document and collection cache
      this.cache.delete(key);
      this.cache.delete(collection);
    } else {
      // Invalidate entire collection cache
      const prefix = `${collection}:`;
      for (const cacheKey of this.cache.keys()) {
        if (cacheKey.startsWith(prefix)) {
          this.cache.delete(cacheKey);
        }
      }
      this.cache.delete(collection);
    }
  }

  clearCache(): void {
    this.cache.clear();
  }

  // ============================================================================
  // Error Handling
  // ============================================================================

  private handleError(
    error: unknown,
    collection: string,
    operation: string,
    context?: { id?: string; data?: unknown }
  ): DataServiceError {
    console.error(`❌ ${operation} error in ${collection}:`, error);

    if (error instanceof DataServiceError) {
      return error;
    }

    if (error && typeof error === 'object' && 'code' in error) {
      const firebaseError = error as FirestoreError;
      switch (firebaseError.code) {
        case 'not-found':
          return new NotFoundError(
            collection,
            context?.id || 'unknown'
          );
        case 'permission-denied':
          return new DataServiceError(
            'You do not have permission to perform this operation',
            'PERMISSION_DENIED',
            collection,
            operation,
            error
          );
        case 'unavailable':
          return new DataServiceError(
            'Database connection unavailable. Please check your internet connection.',
            'UNAVAILABLE',
            collection,
            operation,
            error
          );
        case 'deadline-exceeded':
          return new DataServiceError(
            'Operation timed out. Please try again.',
            'TIMEOUT',
            collection,
            operation,
            error
          );
        default:
          return new DataServiceError(
            `Database error: ${firebaseError.message}`,
            firebaseError.code,
            collection,
            operation,
            error
          );
      }
    }

    return new DataServiceError(
      error instanceof Error ? error.message : 'Unknown error occurred',
      'UNKNOWN_ERROR',
      collection,
      operation,
      error
    );
  }

  // ============================================================================
  // Retry Logic
  // ============================================================================

  private async withRetry<T>(
    operation: () => Promise<T>,
    context: { collection: string; operation: string }
  ): Promise<T> {
    let lastError: unknown;

    for (let attempt = 0; attempt < this.retryConfig.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        // Don't retry on certain errors
        if (
          error instanceof NotFoundError ||
          error instanceof ValidationError
        ) {
          throw error;
        }

        // Check if error is retryable
        const isRetryable =
          error instanceof DataServiceError &&
          ['UNAVAILABLE', 'TIMEOUT', 'INTERNAL'].includes(error.code);

        if (!isRetryable && attempt === this.retryConfig.maxRetries - 1) {
          break;
        }

        // Exponential backoff
        const delay = Math.min(
          this.retryConfig.baseDelay * Math.pow(2, attempt),
          this.retryConfig.maxDelay
        );

        console.log(
          `🔄 Retrying ${context.operation} on ${context.collection} (attempt ${attempt + 1}/${this.retryConfig.maxRetries}) in ${delay}ms`
        );

        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw this.handleError(lastError, context.collection, context.operation);
  }

  // ============================================================================
  // Validation Helpers
  // ============================================================================

  private validateRequiredFields(
    data: Record<string, unknown>,
    requiredFields: string[],
    collection: string
  ): void {
    const missingFields = requiredFields.filter(
      field =>
        !(field in data) ||
        data[field] === undefined ||
        data[field] === null ||
        (typeof data[field] === 'string' && data[field].trim() === '')
    );

    if (missingFields.length > 0) {
      throw new ValidationError(
        `Missing required fields: ${missingFields.join(', ')}`,
        missingFields[0]
      );
    }
  }

  private sanitizeString(str: string): string {
    return str?.trim() || '';
  }

  // ============================================================================
  // Core CRUD Operations
  // ============================================================================

  /**
   * CREATE - Add a new document
   */
  async create<T extends DocumentData>(
    collectionName: CollectionName | string,
    data: T,
    options?: {
      requiredFields?: string[];
      skipCache?: boolean;
    }
  ): Promise<OperationResult<string>> {
    const timestamp = Date.now();

    try {
      if (!this.isEnabled || !this.db) {
        throw new DataServiceError(
          'Firebase is not configured',
          'FIREBASE_NOT_CONFIGURED',
          collectionName as string,
          'create'
        );
      }

      // Validate required fields
      if (options?.requiredFields) {
        this.validateRequiredFields(
          data,
          options.requiredFields,
          collectionName as string
        );
      }

      const result = await this.withRetry<string>(
        async () => {
          const docRef = await addDoc(
            collection(this.db, collectionName as string),
            {
              ...data,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            }
          );
          return docRef.id;
        },
        { collection: collectionName as string, operation: 'create' }
      );

      // Invalidate collection cache
      if (!options?.skipCache) {
        this.invalidateCache(collectionName as string);
      }

      console.log(
        `✅ Created document in ${collectionName}: ${result}`
      );

      return {
        success: true,
        data: result,
        timestamp,
        operation: 'create',
        collection: collectionName as string,
      };
    } catch (error) {
      const dataServiceError = this.handleError(
        error,
        collectionName as string,
        'create',
        { data }
      );

      return {
        success: false,
        error: dataServiceError,
        timestamp,
        operation: 'create',
        collection: collectionName as string,
      };
    }
  }

  /**
   * READ - Get a single document by ID
   */
  async read<T>(
    collectionName: CollectionName | string,
    docId: string,
    options?: {
      useCache?: boolean;
      requiredFields?: string[];
    }
  ): Promise<OperationResult<T | null>> {
    const timestamp = Date.now();
    const cacheKey = this.getCacheKey(collectionName as string, docId);

    try {
      // Check cache first
      if (options?.useCache !== false) {
        const cached = this.getFromCache<T>(cacheKey);
        if (cached) {
          console.log(`💾 Cache hit for ${cacheKey}`);
          return {
            success: true,
            data: cached,
            timestamp,
            operation: 'read',
            collection: collectionName as string,
          };
        }
      }

      if (!this.isEnabled || !this.db) {
        throw new DataServiceError(
          'Firebase is not configured',
          'FIREBASE_NOT_CONFIGURED',
          collectionName as string,
          'read'
        );
      }

      const result = await this.withRetry<T | null>(
        async () => {
          const docRef = doc(
            this.db,
            collectionName as string,
            docId
          );
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = { id: docSnap.id, ...docSnap.data() } as T;

            // Validate required fields if specified
            if (options?.requiredFields) {
              this.validateRequiredFields(
                data as Record<string, unknown>,
                options.requiredFields,
                collectionName as string
              );
            }

            return data;
          }

          return null;
        },
        { collection: collectionName as string, operation: 'read' }
      );

      if (result === null) {
        return {
          success: false,
          error: new NotFoundError(collectionName as string, docId),
          timestamp,
          operation: 'read',
          collection: collectionName as string,
        };
      }

      // Cache the result
      if (options?.useCache !== false) {
        this.setCache(cacheKey, result);
      }

      return {
        success: true,
        data: result,
        timestamp,
        operation: 'read',
        collection: collectionName as string,
      };
    } catch (error) {
      const dataServiceError = this.handleError(
        error,
        collectionName as string,
        'read',
        { id: docId }
      );

      return {
        success: false,
        error: dataServiceError,
        timestamp,
        operation: 'read',
        collection: collectionName as string,
      };
    }
  }

  /**
   * READ ALL - Get multiple documents with query options
   */
  async readAll<T>(
    collectionName: CollectionName | string,
    options?: {
      orderByField?: string;
      orderDirection?: 'asc' | 'desc';
      limitCount?: number;
      filters?: Array<{
        field: string;
        operator: '==' | '!=' | '<' | '<=' | '>' | '>=' | 'array-contains' | 'array-contains-any' | 'in' | 'not-in';
        value: unknown;
      }>;
      useCache?: boolean;
    }
  ): Promise<OperationResult<T[]>> {
    const timestamp = Date.now();
    const cacheKey = this.getCacheKey(collectionName as string);

    try {
      // Check cache first
      if (options?.useCache !== false) {
        const cached = this.getFromCache<T[]>(cacheKey);
        if (cached) {
          console.log(`💾 Cache hit for ${cacheKey}`);
          return {
            success: true,
            data: cached,
            timestamp,
            operation: 'readAll',
            collection: collectionName as string,
          };
        }
      }

      if (!this.isEnabled || !this.db) {
        throw new DataServiceError(
          'Firebase is not configured',
          'FIREBASE_NOT_CONFIGURED',
          collectionName as string,
          'readAll'
        );
      }

      const result = await this.withRetry<T[]>(
        async () => {
          let q = query(collection(this.db, collectionName as string));

          // Apply filters
          if (options?.filters?.length) {
            options.filters.forEach(({ field, operator, value }) => {
              q = query(q, where(field, operator, value));
            });
          }

          // Apply ordering
          const orderField = options?.orderByField || 'createdAt';
          const orderDir = options?.orderDirection || 'desc';
          q = query(q, orderBy(orderField, orderDir));

          // Apply limit
          if (options?.limitCount) {
            q = query(q, limit(options.limitCount));
          }

          const querySnapshot = await getDocs(q);
          const results: T[] = [];

          querySnapshot.forEach(doc => {
            results.push({ id: doc.id, ...doc.data() } as T);
          });

          return results;
        },
        { collection: collectionName as string, operation: 'readAll' }
      );

      // Cache the result
      if (options?.useCache !== false) {
        this.setCache(cacheKey, result);
      }

      console.log(
        `✅ Read ${result.length} documents from ${collectionName}`
      );

      return {
        success: true,
        data: result,
        timestamp,
        operation: 'readAll',
        collection: collectionName as string,
      };
    } catch (error) {
      const dataServiceError = this.handleError(
        error,
        collectionName as string,
        'readAll'
      );

      return {
        success: false,
        error: dataServiceError,
        timestamp,
        operation: 'readAll',
        collection: collectionName as string,
      };
    }
  }

  /**
   * UPDATE - Update an existing document
   */
  async update<T extends Partial<DocumentData>>(
    collectionName: CollectionName | string,
    docId: string,
    data: T,
    options?: {
      requiredFields?: string[];
      skipCache?: boolean;
      merge?: boolean;
    }
  ): Promise<OperationResult<void>> {
    const timestamp = Date.now();

    try {
      if (!this.isEnabled || !this.db) {
        throw new DataServiceError(
          'Firebase is not configured',
          'FIREBASE_NOT_CONFIGURED',
          collectionName as string,
          'update'
        );
      }

      // Validate required fields if specified
      if (options?.requiredFields) {
        this.validateRequiredFields(
          data,
          options.requiredFields,
          collectionName as string
        );
      }

      await this.withRetry(
        async () => {
          const docRef = doc(
            this.db,
            collectionName as string,
            docId
          );

          // Check if document exists
          const docSnap = await getDoc(docRef);
          if (!docSnap.exists()) {
            throw new NotFoundError(collectionName as string, docId);
          }

          await updateDoc(docRef, {
            ...data,
            updatedAt: serverTimestamp(),
          });
        },
        { collection: collectionName as string, operation: 'update' }
      );

      // Invalidate cache
      if (!options?.skipCache) {
        this.invalidateCache(collectionName as string, docId);
      }

      console.log(
        `✅ Updated document in ${collectionName}: ${docId}`
      );

      return {
        success: true,
        timestamp,
        operation: 'update',
        collection: collectionName as string,
      };
    } catch (error) {
      const dataServiceError = this.handleError(
        error,
        collectionName as string,
        'update',
        { id: docId, data }
      );

      return {
        success: false,
        error: dataServiceError,
        timestamp,
        operation: 'update',
        collection: collectionName as string,
      };
    }
  }

  /**
   * DELETE - Remove a document
   */
  async delete(
    collectionName: CollectionName | string,
    docId: string,
    options?: {
      skipCache?: boolean;
    }
  ): Promise<OperationResult<void>> {
    const timestamp = Date.now();

    try {
      if (!this.isEnabled || !this.db) {
        throw new DataServiceError(
          'Firebase is not configured',
          'FIREBASE_NOT_CONFIGURED',
          collectionName as string,
          'delete'
        );
      }

      await this.withRetry(
        async () => {
          const docRef = doc(
            this.db,
            collectionName as string,
            docId
          );

          // Check if document exists
          const docSnap = await getDoc(docRef);
          if (!docSnap.exists()) {
            throw new NotFoundError(collectionName as string, docId);
          }

          await deleteDoc(docRef);
        },
        { collection: collectionName as string, operation: 'delete' }
      );

      // Invalidate cache
      if (!options?.skipCache) {
        this.invalidateCache(collectionName as string, docId);
      }

      console.log(
        `✅ Deleted document from ${collectionName}: ${docId}`
      );

      return {
        success: true,
        timestamp,
        operation: 'delete',
        collection: collectionName as string,
      };
    } catch (error) {
      const dataServiceError = this.handleError(
        error,
        collectionName as string,
        'delete',
        { id: docId }
      );

      return {
        success: false,
        error: dataServiceError,
        timestamp,
        operation: 'delete',
        collection: collectionName as string,
      };
    }
  }

  // ============================================================================
  // Batch Operations
  // ============================================================================

  /**
   * BATCH CREATE - Create multiple documents in a single transaction
   */
  async batchCreate<T extends DocumentData>(
    collectionName: CollectionName | string,
    items: T[],
    options?: {
      requiredFields?: string[];
    }
  ): Promise<BatchOperationResult<string>> {
    const timestamp = Date.now();

    try {
      if (!this.isEnabled || !this.db) {
        throw new DataServiceError(
          'Firebase is not configured',
          'FIREBASE_NOT_CONFIGURED',
          collectionName as string,
          'batchCreate'
        );
      }

      const results: Array<{
        id?: string;
        success: boolean;
        error?: DataServiceError;
      }> = [];

      const batch = writeBatch(this.db);

      items.forEach((item, index) => {
        try {
          // Validate required fields
          if (options?.requiredFields) {
            this.validateRequiredFields(
              item,
              options.requiredFields,
              collectionName as string
            );
          }

          const docRef = doc(collection(this.db, collectionName as string));
          batch.set(docRef, {
            ...item,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });

          // Store index for later mapping
          (results as any)[index] = { success: true };
        } catch (error) {
          results[index] = {
            success: false,
            error: this.handleError(
              error,
              collectionName as string,
              'batchCreate',
              { data: item }
            ),
          };
        }
      });

      // Commit the batch
      const validBatches = results.filter(r => r.success);
      if (validBatches.length > 0) {
        await batch.commit();
      }

      // Invalidate collection cache
      this.invalidateCache(collectionName as string);

      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      console.log(
        `✅ Batch created ${successful}/${items.length} documents in ${collectionName}`
      );

      return {
        success: failed === 0,
        results: results as any,
        summary: {
          total: items.length,
          successful,
          failed,
        },
        timestamp,
      };
    } catch (error) {
      const dataServiceError = this.handleError(
        error,
        collectionName as string,
        'batchCreate'
      );

      return {
        success: false,
        results: items.map(() => ({
          success: false,
          error: dataServiceError,
        })),
        summary: {
          total: items.length,
          successful: 0,
          failed: items.length,
        },
        timestamp,
      };
    }
  }

  /**
   * BATCH UPDATE - Update multiple documents
   */
  async batchUpdate<T extends Record<string, any>>(
    collectionName: CollectionName | string,
    updates: Array<{ id: string; data: Partial<T> }>,
    options?: {
      requiredFields?: string[];
    }
  ): Promise<BatchOperationResult<void>> {
    const timestamp = Date.now();

    try {
      if (!this.isEnabled || !this.db) {
        throw new DataServiceError(
          'Firebase is not configured',
          'FIREBASE_NOT_CONFIGURED',
          collectionName as string,
          'batchUpdate'
        );
      }

      const results: Array<{
        success: boolean;
        error?: DataServiceError;
      }> = [];

      const batch = writeBatch(this.db);

      updates.forEach(({ id, data }, index) => {
        try {
          // Validate required fields
          if (options?.requiredFields) {
            this.validateRequiredFields(
              data,
              options.requiredFields,
              collectionName as string
            );
          }

          const docRef = doc(
            this.db,
            collectionName as string,
            id
          );
          batch.update(docRef, {
            ...data,
            updatedAt: serverTimestamp(),
          });

          results[index] = { success: true };
        } catch (error) {
          results[index] = {
            success: false,
            error: this.handleError(
              error,
              collectionName as string,
              'batchUpdate',
              { id, data }
            ),
          };
        }
      });

      // Commit the batch
      const validBatches = results.filter(r => r.success);
      if (validBatches.length > 0) {
        await batch.commit();
      }

      // Invalidate collection cache
      this.invalidateCache(collectionName as string);

      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      console.log(
        `✅ Batch updated ${successful}/${updates.length} documents in ${collectionName}`
      );

      return {
        success: failed === 0,
        results: results as any,
        summary: {
          total: updates.length,
          successful,
          failed,
        },
        timestamp,
      };
    } catch (error) {
      const dataServiceError = this.handleError(
        error,
        collectionName as string,
        'batchUpdate'
      );

      return {
        success: false,
        results: updates.map(() => ({
          success: false,
          error: dataServiceError,
        })),
        summary: {
          total: updates.length,
          successful: 0,
          failed: updates.length,
        },
        timestamp,
      };
    }
  }

  /**
   * BATCH DELETE - Delete multiple documents
   */
  async batchDelete(
    collectionName: CollectionName | string,
    ids: string[]
  ): Promise<BatchOperationResult<void>> {
    const timestamp = Date.now();

    try {
      if (!this.isEnabled || !this.db) {
        throw new DataServiceError(
          'Firebase is not configured',
          'FIREBASE_NOT_CONFIGURED',
          collectionName as string,
          'batchDelete'
        );
      }

      const results: Array<{
        success: boolean;
        error?: DataServiceError;
      }> = [];

      const batch = writeBatch(this.db);

      ids.forEach((id, index) => {
        try {
          const docRef = doc(
            this.db,
            collectionName as string,
            id
          );
          batch.delete(docRef);
          results[index] = { success: true };
        } catch (error) {
          results[index] = {
            success: false,
            error: this.handleError(
              error,
              collectionName as string,
              'batchDelete',
              { id }
            ),
          };
        }
      });

      // Commit the batch (max 500 operations per batch)
      const validBatches = results.filter(r => r.success);
      if (validBatches.length > 0) {
        await batch.commit();
      }

      // Invalidate collection cache
      this.invalidateCache(collectionName as string);

      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      console.log(
        `✅ Batch deleted ${successful}/${ids.length} documents from ${collectionName}`
      );

      return {
        success: failed === 0,
        results: results as any,
        summary: {
          total: ids.length,
          successful,
          failed,
        },
        timestamp,
      };
    } catch (error) {
      const dataServiceError = this.handleError(
        error,
        collectionName as string,
        'batchDelete'
      );

      return {
        success: false,
        results: ids.map(() => ({
          success: false,
          error: dataServiceError,
        })),
        summary: {
          total: ids.length,
          successful: 0,
          failed: ids.length,
        },
        timestamp,
      };
    }
  }

  // ============================================================================
  // Transaction Operations
  // ============================================================================

  /**
   * Run a transaction with retry logic
   */
  async runTransaction<T>(
    updateFunction: (transaction: any) => Promise<T>,
    options?: {
      maxAttempts?: number;
    }
  ): Promise<OperationResult<T>> {
    const timestamp = Date.now();

    try {
      if (!this.isEnabled || !this.db) {
        throw new DataServiceError(
          'Firebase is not configured',
          'FIREBASE_NOT_CONFIGURED',
          'transaction',
          'runTransaction'
        );
      }

      const result = await runTransaction(this.db, updateFunction, {
        maxAttempts: options?.maxAttempts || 5,
      });

      // Clear all caches after transaction
      this.clearCache();

      return {
        success: true,
        data: result,
        timestamp,
        operation: 'transaction',
      };
    } catch (error) {
      const dataServiceError = this.handleError(
        error,
        'transaction',
        'runTransaction'
      );

      return {
        success: false,
        error: dataServiceError,
        timestamp,
        operation: 'transaction',
      };
    }
  }

  // ============================================================================
  // Real-time Subscriptions
  // ============================================================================

  /**
   * Subscribe to real-time updates for a collection
   */
  subscribe<T>(
    collectionName: CollectionName | string,
    callback: (data: T[]) => void,
    options?: {
      orderByField?: string;
      orderDirection?: 'asc' | 'desc';
      filters?: Array<{
        field: string;
        operator: '==' | '!=' | '<' | '<=' | '>' | '>=' | 'array-contains';
        value: unknown;
      }>;
    }
  ): Unsubscribe {
    if (!this.isEnabled || !this.db) {
      console.warn('Firebase not enabled - subscription not active');
      return () => {};
    }

    const subscriptionKey = `${collectionName}:${JSON.stringify(options || {})}`;

    // Unsubscribe from existing subscription if any
    this.unsubscribe(collectionName as string);

    let q = query(collection(this.db, collectionName as string));

    // Apply filters
    if (options?.filters?.length) {
      options.filters.forEach(({ field, operator, value }) => {
        q = query(q, where(field, operator, value));
      });
    }

    // Apply ordering
    const orderField = options?.orderByField || 'createdAt';
    const orderDir = options?.orderDirection || 'desc';
    q = query(q, orderBy(orderField, orderDir));

    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        const results: T[] = [];
        snapshot.forEach(doc => {
          results.push({ id: doc.id, ...doc.data() } as T);
        });
        callback(results);
      },
      error => {
        console.error(
          `❌ Subscription error for ${collectionName}:`,
          error
        );
        callback([]);
      }
    );

    this.activeSubscriptions.set(subscriptionKey, unsubscribe);

    console.log(
      `📡 Subscribed to real-time updates for ${collectionName}`
    );

    return () => this.unsubscribe(subscriptionKey);
  }

  /**
   * Unsubscribe from a collection
   */
  unsubscribe(subscriptionKey: string): void {
    const unsubscribe = this.activeSubscriptions.get(subscriptionKey);
    if (unsubscribe) {
      unsubscribe();
      this.activeSubscriptions.delete(subscriptionKey);
      console.log(`🔕 Unsubscribed from ${subscriptionKey}`);
    }
  }

  /**
   * Unsubscribe from all collections
   */
  unsubscribeAll(): void {
    this.activeSubscriptions.forEach((unsubscribe, key) => {
      unsubscribe();
    });
    this.activeSubscriptions.clear();
    console.log('🔕 Unsubscribed from all collections');
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  /**
   * Get collection statistics
   */
  async getCollectionStats(
    collectionName: CollectionName | string
  ): Promise<OperationResult<{ count: number; lastUpdated?: number }>> {
    const timestamp = Date.now();

    try {
      const result = await this.readAll<DocumentData>(collectionName, {
        limitCount: 1,
        orderByField: 'updatedAt',
        orderDirection: 'desc',
      });

      if (!result.success) {
        return result as any;
      }

      // Get count by querying with limit 0 (Firestore doesn't have count())
      const q = query(
        collection(this.db, collectionName as string),
        limit(1)
      );
      const snapshot = await getDocs(q);

      return {
        success: true,
        data: {
          count: snapshot.size,
          lastUpdated: result.data?.[0]?.updatedAt,
        },
        timestamp,
        operation: 'getCollectionStats',
        collection: collectionName as string,
      };
    } catch (error) {
      const dataServiceError = this.handleError(
        error,
        collectionName as string,
        'getCollectionStats'
      );

      return {
        success: false,
        error: dataServiceError,
        timestamp,
        operation: 'getCollectionStats',
        collection: collectionName as string,
      };
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    if (!this.isEnabled || !this.db) {
      return false;
    }

    try {
      const testQuery = query(
        collection(this.db, COLLECTIONS.PORTFOLIO_CONFIG),
        limit(1)
      );
      await getDocs(testQuery);
      return true;
    } catch (error) {
      console.error('❌ Firebase health check failed:', error);
      return false;
    }
  }

  /**
   * Get connection status
   */
  get isConnected(): boolean {
    return this.isEnabled;
  }

  /**
   * Configure cache settings
   */
  configureCache(config: Partial<CacheConfig>): void {
    this.cacheConfig = { ...this.cacheConfig, ...config };
    console.log('📦 Cache configuration updated:', this.cacheConfig);
  }

  /**
   * Configure retry settings
   */
  configureRetry(config: {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
  }): void {
    this.retryConfig = { ...this.retryConfig, ...config };
    console.log('🔄 Retry configuration updated:', this.retryConfig);
  }
}

// ============================================================================
// Specialized Service Classes
// ============================================================================

export class ProjectService extends AdminDataService {
  private readonly COLLECTION = COLLECTIONS.PROJECTS;
  private readonly REQUIRED_FIELDS = ['title', 'description', 'category'];

  async createProject(
    projectData: ProjectInput
  ): Promise<OperationResult<string>> {
    return this.create(this.COLLECTION, projectData, {
      requiredFields: this.REQUIRED_FIELDS,
    });
  }

  async getProject(id: string): Promise<OperationResult<Project | null>> {
    return this.read<Project>(this.COLLECTION, id, { useCache: true });
  }

  async getAllProjects(
    options?: {
      featuredOnly?: boolean;
      category?: string;
      status?: string;
      limitCount?: number;
    }
  ): Promise<OperationResult<Project[]>> {
    const filters: any[] = [];

    if (options?.featuredOnly) {
      filters.push({ field: 'featured', operator: '==', value: true });
    }

    if (options?.category) {
      filters.push({ field: 'category', operator: '==', value: options.category });
    }

    if (options?.status) {
      filters.push({ field: 'status', operator: '==', value: options.status });
    }

    return this.readAll<Project>(this.COLLECTION, {
      orderByField: 'priority',
      orderDirection: 'desc',
      filters: filters.length > 0 ? filters : undefined,
      limitCount: options?.limitCount,
      useCache: true,
    });
  }

  async updateProject(
    id: string,
    data: Partial<ProjectInput>
  ): Promise<OperationResult<void>> {
    return this.update(this.COLLECTION, id, data);
  }

  async deleteProject(id: string): Promise<OperationResult<void>> {
    return this.delete(this.COLLECTION, id);
  }

  async bulkDeleteProjects(ids: string[]): Promise<BatchOperationResult<void>> {
    return this.batchDelete(this.COLLECTION, ids);
  }

  async bulkUpdateProjects(
    updates: Array<{ id: string; data: Partial<ProjectInput> }>
  ): Promise<BatchOperationResult<void>> {
    return this.batchUpdate(this.COLLECTION, updates);
  }

  subscribeToProjects(
    callback: (projects: Project[]) => void
  ): Unsubscribe {
    return this.subscribe<Project>(this.COLLECTION, callback, {
      orderByField: 'priority',
      orderDirection: 'desc',
    });
  }
}

export class SkillService extends AdminDataService {
  private readonly COLLECTION = COLLECTIONS.SKILLS;
  private readonly REQUIRED_FIELDS = ['name', 'category', 'level'];

  async createSkill(
    skillData: SkillInput
  ): Promise<OperationResult<string>> {
    return this.create(this.COLLECTION, skillData, {
      requiredFields: this.REQUIRED_FIELDS,
    });
  }

  async getSkill(id: string): Promise<OperationResult<Skill | null>> {
    return this.read<Skill>(this.COLLECTION, id, { useCache: true });
  }

  async getAllSkills(
    options?: {
      category?: string;
      featuredOnly?: boolean;
      limitCount?: number;
    }
  ): Promise<OperationResult<Skill[]>> {
    const filters: any[] = [];

    if (options?.category) {
      filters.push({ field: 'category', operator: '==', value: options.category });
    }

    if (options?.featuredOnly) {
      filters.push({ field: 'featured', operator: '==', value: true });
    }

    return this.readAll<Skill>(this.COLLECTION, {
      orderByField: 'priority',
      orderDirection: 'desc',
      filters: filters.length > 0 ? filters : undefined,
      limitCount: options?.limitCount,
      useCache: true,
    });
  }

  async updateSkill(
    id: string,
    data: Partial<SkillInput>
  ): Promise<OperationResult<void>> {
    return this.update(this.COLLECTION, id, data);
  }

  async deleteSkill(id: string): Promise<OperationResult<void>> {
    return this.delete(this.COLLECTION, id);
  }

  async bulkDeleteSkills(ids: string[]): Promise<BatchOperationResult<void>> {
    return this.batchDelete(this.COLLECTION, ids);
  }

  async bulkUpdateSkills(
    updates: Array<{ id: string; data: Partial<SkillInput> }>
  ): Promise<BatchOperationResult<void>> {
    return this.batchUpdate(this.COLLECTION, updates);
  }

  subscribeToSkills(callback: (skills: Skill[]) => void): Unsubscribe {
    return this.subscribe<Skill>(this.COLLECTION, callback, {
      orderByField: 'priority',
      orderDirection: 'desc',
    });
  }
}

export class ExperienceService extends AdminDataService {
  private readonly COLLECTION = COLLECTIONS.EXPERIENCES;
  private readonly REQUIRED_FIELDS = ['title', 'company', 'startDate'];

  async createExperience(
    experienceData: ExperienceInput
  ): Promise<OperationResult<string>> {
    return this.create(this.COLLECTION, experienceData, {
      requiredFields: this.REQUIRED_FIELDS,
    });
  }

  async getExperience(
    id: string
  ): Promise<OperationResult<Experience | null>> {
    return this.read<Experience>(this.COLLECTION, id, { useCache: true });
  }

  async getAllExperiences(
    options?: {
      limitCount?: number;
    }
  ): Promise<OperationResult<Experience[]>> {
    return this.readAll<Experience>(this.COLLECTION, {
      orderByField: 'startDate',
      orderDirection: 'desc',
      limitCount: options?.limitCount,
      useCache: true,
    });
  }

  async updateExperience(
    id: string,
    data: Partial<ExperienceInput>
  ): Promise<OperationResult<void>> {
    return this.update(this.COLLECTION, id, data);
  }

  async deleteExperience(id: string): Promise<OperationResult<void>> {
    return this.delete(this.COLLECTION, id);
  }

  async bulkDeleteExperiences(
    ids: string[]
  ): Promise<BatchOperationResult<void>> {
    return this.batchDelete(this.COLLECTION, ids);
  }

  subscribeToExperiences(
    callback: (experiences: Experience[]) => void
  ): Unsubscribe {
    return this.subscribe<Experience>(this.COLLECTION, callback, {
      orderByField: 'startDate',
      orderDirection: 'desc',
    });
  }
}

// ============================================================================
// Service Instances (Singleton)
// ============================================================================

export const adminDataService = new AdminDataService();
export const projectService = new ProjectService();
export const skillService = new SkillService();
export const experienceService = new ExperienceService();

// Export default instance
export default adminDataService;
