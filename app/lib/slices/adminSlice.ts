import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Profile {
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

interface AdminState {
  selectedUser: User | null;
  pageHistory: string[];
  menuOpen: boolean;
}

const initialState: AdminState = {
  selectedUser: null,
  pageHistory: [],
  menuOpen: false,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setSelectedUser: (state, action: PayloadAction<User | null>) => {
      state.selectedUser = action.payload;
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
    pushPage: (state, action: PayloadAction<string>) => {
      state.pageHistory.push(action.payload);
    },
    popPage: (state) => {
      state.pageHistory.pop();
    },
    toggleMenu: (state) => {
      state.menuOpen = !state.menuOpen;
    },
    closeMenu: (state) => {
      state.menuOpen = false;
    },
  },
});

export const { setSelectedUser, clearSelectedUser, pushPage, popPage, toggleMenu, closeMenu } = adminSlice.actions;
export default adminSlice.reducer; 