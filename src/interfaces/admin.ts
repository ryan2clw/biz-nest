export interface Profile {
  id: number;
  firstName?: string | null;
  lastName?: string | null;
  screenName?: string | null;
  industry?: string | null;
  userId: number;
  role: 'admin' | 'customer' | 'user';
}

export interface User {
  id: number;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  emailVerified?: string | null; // Keep as string for Redux serialization
  profile?: Profile | null;
  // Include convenience fields at the top level
  firstName?: string | null;
  lastName?: string | null;
  screenName?: string | null;
  industry?: string | null;
}

export interface AdminState {
  selectedUser: User | null;
  pageHistory: string[];
  menuOpen: boolean;
} 