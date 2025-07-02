import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User, AdminState } from '../../interfaces/admin';

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