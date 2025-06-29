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
}

const initialState: AdminState = {
  selectedUser: null,
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
  },
});

export const { setSelectedUser, clearSelectedUser } = adminSlice.actions;
export default adminSlice.reducer; 