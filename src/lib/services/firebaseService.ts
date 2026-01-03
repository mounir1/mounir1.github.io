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
    onSnapshot,
    Timestamp,
    writeBatch,
    Firestore
} from "firebase/firestore";
import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject,
    FirebaseStorage
} from "firebase/storage";
import { db, storage, isFirebaseEnabled } from "../firebase";
import { ProjectInput } from "@/hooks/useProjects";
import { initialProjects } from "@/data/initial-projects";

const COLLECTION_NAME = "projects";

export const firebaseService = {
    /**
     * Get all projects from Firestore
     */
    async getProjects(): Promise<ProjectInput[]> {
        if (!isFirebaseEnabled || !db) {
            console.warn("Firebase is not enabled, returning initial projects");
            return initialProjects;
        }

        try {
            const q = query(collection(db!, COLLECTION_NAME), orderBy("priority", "desc"));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                // If no projects exist, seed with initial data
                console.log("No projects found in Firestore, seeding initial data...");
                await this.seedProjects();
                return initialProjects;
            }

            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as unknown as ProjectInput[];
        } catch (error) {
            console.error("Error fetching projects:", error);
            throw error;
        }
    },

    /**
     * Subscribe to real-time project updates
     */
    subscribeToProjects(callback: (projects: ProjectInput[]) => void): () => void {
        if (!isFirebaseEnabled || !db) {
            console.warn("Firebase is not enabled, returning initial projects immediately");
            callback(initialProjects);
            return () => { };
        }

        const q = query(collection(db, COLLECTION_NAME), orderBy("priority", "desc"));

        return onSnapshot(q, (snapshot) => {
            const projects = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as unknown as ProjectInput[];
            callback(projects);
        }, (error) => {
            console.error("Error in projects subscription:", error);
            // Fallback to initial projects on error
            callback(initialProjects);
        });
    },

    /**
     * Get a single project by ID
     */
    async getProject(id: string): Promise<ProjectInput | null> {
        if (!isFirebaseEnabled || !db) return null;

        try {
            const docRef = doc(db!, COLLECTION_NAME, id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() } as unknown as ProjectInput;
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error fetching project:", error);
            throw error;
        }
    },

    /**
     * Create a new project
     */
    async createProject(project: Omit<ProjectInput, "id">): Promise<string> {
        if (!isFirebaseEnabled || !db) throw new Error("Firebase is not enabled");

        try {
            const docRef = await addDoc(collection(db!, COLLECTION_NAME), {
                ...project,
                createdAt: Date.now(),
                updatedAt: Date.now()
            });
            return docRef.id;
        } catch (error) {
            console.error("Error creating project:", error);
            throw error;
        }
    },

    /**
     * Update an existing project
     */
    async updateProject(id: string, updates: Partial<ProjectInput>): Promise<void> {
        if (!isFirebaseEnabled || !db) throw new Error("Firebase is not enabled");

        try {
            const docRef = doc(db!, COLLECTION_NAME, id);
            await updateDoc(docRef, {
                ...updates,
                updatedAt: Date.now()
            });
        } catch (error) {
            console.error("Error updating project:", error);
            throw error;
        }
    },

    /**
     * Delete a project
     */
    async deleteProject(id: string): Promise<void> {
        if (!isFirebaseEnabled || !db) throw new Error("Firebase is not enabled");

        try {
            await deleteDoc(doc(db!, COLLECTION_NAME, id));
        } catch (error) {
            console.error("Error deleting project:", error);
            throw error;
        }
    },

    /**
     * Upload an image to Firebase Storage
     */
    async uploadImage(file: File, path: string = "projects"): Promise<string> {
        if (!isFirebaseEnabled || !storage) throw new Error("Firebase Storage is not enabled");

        try {
            const storageRef = ref(storage!, `${path}/${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            return downloadURL;
        } catch (error) {
            console.error("Error uploading image:", error);
            throw error;
        }
    },

    /**
     * Seed Firestore with initial projects
     */
    async seedProjects(): Promise<void> {
        if (!isFirebaseEnabled || !db) return;

        const batch = writeBatch(db!);

        initialProjects.forEach((project) => {
            const docRef = doc(collection(db!, COLLECTION_NAME));
            // Remove id from project if it exists in initialProjects to let Firestore generate one
            // or use the existing id if we want to preserve it.
            // Here we let Firestore generate new IDs for seeded data to avoid conflicts
            const { id, ...projectData } = project as any;

            batch.set(docRef, {
                ...projectData,
                createdAt: Date.now(),
                updatedAt: Date.now()
            });
        });

        await batch.commit();
        console.log("Seeding completed");
    }
};
