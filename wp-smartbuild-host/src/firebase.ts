import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocFromServer,
  writeBatch
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';
import { Site, Contractor, ProjectRequest } from './types';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth();

// Test Connection
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firebase Firestore connected successfully.");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration: Client is offline.");
    }
  }
}
testConnection();

// Firestore Error Handlers
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Initial sites to populate Firestore if it's empty
export const INITIAL_SITES: Site[] = [
  {
    id: 'site-1',
    slug: 'smartbuild',
    title: 'SmartBuild',
    tagline: 'Find help for your build',
    accentColor: 'teal',
    bannerGradient: 'from-emerald-950 via-teal-900 to-emerald-950',
    categories: [
      'House Construction',
      'Home Renovation',
      'Interior Design',
      'Electrical',
      'Plumbing',
      'Architecture'
    ],
    contractors: [
      {
        id: 'c-1',
        name: 'Sok Pisey',
        specialty: 'Civil Engineer',
        experience: 9,
        rating: 4.8,
        reviewsCount: 142,
        location: 'Toul Kork',
        priceRange: '$$$',
        avatarLetters: 'SP',
        avatarColor: 'bg-blue-600 text-white'
      },
      {
        id: 'c-2',
        name: 'Chan Dara',
        specialty: 'Electrician',
        experience: 5,
        rating: 4.6,
        reviewsCount: 88,
        location: 'Sen Sok',
        priceRange: '$$',
        avatarLetters: 'CD',
        avatarColor: 'bg-teal-600 text-white'
      },
      {
        id: 'c-3',
        name: 'Keo Sophea',
        specialty: 'Interior Designer',
        experience: 7,
        rating: 4.9,
        reviewsCount: 112,
        location: 'Boeung Keng Kang 1',
        priceRange: '$$$',
        avatarLetters: 'KS',
        avatarColor: 'bg-purple-600 text-white'
      },
      {
        id: 'c-4',
        name: 'Oum Vandy',
        specialty: 'Plumber',
        experience: 4,
        rating: 4.5,
        reviewsCount: 64,
        location: 'Chroy Changvar',
        priceRange: '$',
        avatarLetters: 'OV',
        avatarColor: 'bg-orange-600 text-white'
      },
      {
        id: 'c-5',
        name: 'Mean Samnang',
        specialty: 'Architect',
        experience: 12,
        rating: 4.9,
        reviewsCount: 195,
        location: 'Daun Penh',
        priceRange: '$$$',
        avatarLetters: 'MS',
        avatarColor: 'bg-emerald-600 text-white'
      }
    ],
    projectRequests: [
      {
        id: 'r-1',
        title: 'Kitchen Renovation',
        description: 'Need a full redesign of our ground floor kitchen, including modern cabinets, tiling, and upgraded electrical sockets.',
        location: 'Toul Kork, Phnom Penh',
        budgetRange: '$1,500 - $3,000',
        timeline: '3 weeks',
        images: ['https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=400&q=80'],
        createdAt: '2026-06-25T14:30:00Z',
        status: 'pending'
      },
      {
        id: 'r-2',
        title: 'Complete Villa Wiring',
        description: 'New construction villa requires full conduit installation, distribution board setup, and socket wiring.',
        location: 'Sen Sok, Phnom Penh',
        budgetRange: '$2,000 - $4,500',
        timeline: '4 weeks',
        images: [],
        createdAt: '2026-06-26T02:15:00Z',
        status: 'pending'
      }
    ]
  }
];

// Helper to seed database if empty
async function seedDatabaseIfEmpty() {
  const sitesCol = collection(db, 'sites');
  try {
    const snapshot = await getDocs(sitesCol);
    if (snapshot.empty) {
      console.log("No sites found in Firestore. Seeding default data...");
      for (const site of INITIAL_SITES) {
        await setDoc(doc(sitesCol, site.id), site);
      }
      console.log("Database seeded successfully.");
    }
  } catch (err) {
    console.error("Error checking or seeding database:", err);
  }
}

// 1. Subscribe to all sites with live real-time synchronization
export function subscribeSites(onUpdate: (sites: Site[]) => void, onError?: (err: Error) => void) {
  const sitesCol = collection(db, 'sites');
  
  let activeUnsubscribe: (() => void) | null = null;
  
  // Seed database first if empty (done in background asynchronously)
  seedDatabaseIfEmpty().then(() => {
    activeUnsubscribe = onSnapshot(sitesCol, (snapshot) => {
      const sites: Site[] = [];
      snapshot.forEach((docSnap) => {
        sites.push(docSnap.data() as Site);
      });
      onUpdate(sites);
    }, (error) => {
      console.error("onSnapshot error:", error);
      if (onError) {
        onError(error);
      } else {
        handleFirestoreError(error, OperationType.GET, 'sites');
      }
    });
  });

  return () => {
    if (activeUnsubscribe) {
      activeUnsubscribe();
    }
  };
}

// 2. Create a new directory site
export async function createSite(title: string, slug: string, tagline: string): Promise<Site> {
  const siteId = `site-${Date.now()}`;
  const normalizedSlug = slug.toLowerCase().replace(/[^a-z0-9-_]/g, '');
  
  const newSite: Site = {
    id: siteId,
    slug: normalizedSlug,
    title,
    tagline: tagline || "My Premium Directory",
    accentColor: "teal",
    bannerGradient: "from-emerald-950 via-teal-900 to-emerald-950",
    categories: [
      'House Construction',
      'Home Renovation',
      'Interior Design',
      'Electrical',
      'Plumbing',
      'Architecture'
    ],
    contractors: [],
    projectRequests: []
  };

  try {
    const docRef = doc(db, 'sites', siteId);
    await setDoc(docRef, newSite);
    return newSite;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `sites/${siteId}`);
    throw error;
  }
}

// 3. Update an existing site (or its configurations)
export async function updateSite(updatedSite: Site): Promise<Site> {
  const cleanSite = {
    ...updatedSite,
    slug: updatedSite.slug.toLowerCase().replace(/[^a-z0-9-_]/g, '')
  };
  
  try {
    const docRef = doc(db, 'sites', cleanSite.id);
    await setDoc(docRef, cleanSite);
    return cleanSite;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `sites/${cleanSite.id}`);
    throw error;
  }
}

// 4. Delete a site
export async function deleteSite(siteId: string): Promise<void> {
  try {
    const docRef = doc(db, 'sites', siteId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `sites/${siteId}`);
    throw error;
  }
}

// 5. Add a contractor directly inside a site
export async function addContractor(siteId: string, contractorData: Omit<Contractor, 'id' | 'rating' | 'reviewsCount'>): Promise<Contractor> {
  try {
    const siteDocRef = doc(db, 'sites', siteId);
    const siteDoc = await getDoc(siteDocRef);
    if (!siteDoc.exists()) {
      throw new Error("Site not found");
    }
    
    const siteData = siteDoc.data() as Site;
    const newContractor: Contractor = {
      id: `c-${Date.now()}`,
      name: contractorData.name,
      specialty: contractorData.specialty,
      experience: Number(contractorData.experience) || 1,
      rating: 5.0,
      reviewsCount: 1,
      location: contractorData.location,
      priceRange: contractorData.priceRange || "$$",
      avatarLetters: contractorData.avatarLetters || contractorData.name.substring(0, 2).toUpperCase(),
      avatarColor: contractorData.avatarColor || "bg-teal-600 text-white"
    };

    const updatedContractors = [...(siteData.contractors || []), newContractor];
    await updateDoc(siteDocRef, { contractors: updatedContractors });
    return newContractor;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `sites/${siteId}`);
    throw error;
  }
}

// 6. Submit a project request (leads form submission) on a site
export async function addProjectRequest(siteSlug: string, reqData: Omit<ProjectRequest, 'id' | 'createdAt' | 'status'>): Promise<ProjectRequest> {
  try {
    // Find site by slug first
    const sitesCol = collection(db, 'sites');
    const snapshot = await getDocs(sitesCol);
    let targetSiteDoc: any = null;
    let targetSiteData: Site | null = null;
    
    snapshot.forEach((d) => {
      const data = d.data() as Site;
      if (data.slug === siteSlug) {
        targetSiteDoc = d.ref;
        targetSiteData = data;
      }
    });

    if (!targetSiteDoc || !targetSiteData) {
      throw new Error("Site not found for the slug: " + siteSlug);
    }

    const newRequest: ProjectRequest = {
      id: `r-${Date.now()}`,
      title: reqData.title,
      description: reqData.description,
      location: reqData.location,
      budgetRange: reqData.budgetRange || "$500 - $1,000",
      timeline: reqData.timeline || "2 weeks",
      images: reqData.images || [],
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    const updatedRequests = [newRequest, ...(targetSiteData.projectRequests || [])];
    await updateDoc(targetSiteDoc, { projectRequests: updatedRequests });
    return newRequest;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `sites/by-slug/${siteSlug}`);
    throw error;
  }
}

// 7. Restore database backup
export async function restoreBackup(data: any[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    
    // First retrieve and delete all current documents in sites
    const sitesCol = collection(db, 'sites');
    const snapshot = await getDocs(sitesCol);
    snapshot.forEach((d) => {
      batch.delete(d.ref);
    });

    // Write all backup documents
    for (const site of data) {
      if (site.id) {
        const docRef = doc(db, 'sites', site.id);
        batch.set(docRef, site);
      }
    }

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'sites/restore');
    throw error;
  }
}

