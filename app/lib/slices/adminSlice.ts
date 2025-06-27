import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: number;
  firstName?: string | null;
  lastName?: string | null;
  screenName?: string | null;
  image?: string | null;
  email?: string | null;
  emailVerified?: Date | null;
}

interface AdminState {
  currentUser: User | null;
}

const initialState: AdminState = {
  currentUser: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<User | null>) => {
      state.currentUser = action.payload;
    },
    clearCurrentUser: (state) => {
      state.currentUser = null;
    },
  },
});

export const { setCurrentUser, clearCurrentUser } = adminSlice.actions;
export default adminSlice.reducer; 