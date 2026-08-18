import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthState, AuthUser } from "./authTypes";
import {
  setAuthToken,
  setStoredUser,
  clearAuthSession,
  getAuthToken,
  getStoredUser,
} from "@/lib/auth/token";

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: AuthUser; token: string }>
    ) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      state.error = null;
      state.isInitialized = true;

      setAuthToken(token);
      setStoredUser(user);
    },
    setUser: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload;
      setStoredUser(action.payload);
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.isAuthenticated = !!action.payload;
      setAuthToken(action.payload);
    },
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setAuthError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    hydrateAuth: (state) => {
      const token = getAuthToken();
      const user = getStoredUser<AuthUser>();

      if (token) {
        state.token = token;
        state.isAuthenticated = true;
        if (user) {
          state.user = user;
        }
      } else {
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
      }
      state.isInitialized = true;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.isInitialized = true;

      clearAuthSession();
    },
  },
});

export const {
  setCredentials,
  setUser,
  setToken,
  setAuthLoading,
  setAuthError,
  hydrateAuth,
  logout,
} = authSlice.actions;

export default authSlice.reducer;
