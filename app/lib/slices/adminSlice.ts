import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Profile {
  id: number;
  firstName?: string | null;
  lastName?: string | null;
  screenName?: string | null;
  industry?: string | null;
  userId: number;
}

export interface User {
  id: number;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  emailVerified?: string | null;
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
}

const initialState: AdminState = {
  selectedUser: null,
  pageHistory: [],
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
  },
});

export const { setSelectedUser, clearSelectedUser, pushPage, popPage } = adminSlice.actions;
export default adminSlice.reducer; 