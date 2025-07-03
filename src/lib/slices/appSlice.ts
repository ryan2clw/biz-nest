import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User, AppState } from '../../interfaces/app';

const initialState: AppState = {
  selectedUser: null,
  pageHistory: [],
  menuOpen: false,
  theme: 'dark',
};

const appSlice = createSlice({
  name: 'app',
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
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
    },
  },
});

export const { setSelectedUser, clearSelectedUser, pushPage, popPage, toggleMenu, closeMenu, setTheme, toggleTheme } = appSlice.actions;
export default appSlice.reducer; 