import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthState, AuthUser } from "./authTypes";
import {
  setAuthTokens,
  setStoredUser,
  clearAuthSession,
  getAuthToken,
  getRefreshToken,
  getStoredUser,
} from "@/lib/auth/token";

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
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
      action: PayloadAction<{ user: AuthUser; token: string; refreshToken?: string }>
    ) => {
      const { user, token, refreshToken } = action.payload;
      state.user = user;
      state.token = token;
      if (refreshToken) {
        state.refreshToken = refreshToken;
      }
      state.isAuthenticated = true;
      state.error = null;
      state.isInitialized = true;

      setAuthTokens(token, refreshToken);
      setStoredUser(user);
    },
    setTokens: (
      state,
      action: PayloadAction<{ token: string; refreshToken?: string }>
    ) => {
      const { token, refreshToken } = action.payload;
      state.token = token;
      if (refreshToken) {
        state.refreshToken = refreshToken;
      }
      state.isAuthenticated = !!token;
      setAuthTokens(token, refreshToken);
    },
    setUser: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload;
      setStoredUser(action.payload);
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.isAuthenticated = !!action.payload;
      setAuthTokens(action.payload);
    },
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setAuthError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    hydrateAuth: (state) => {
      const token = getAuthToken();
      const refreshToken = getRefreshToken();
      const user = getStoredUser<AuthUser>();

      if (token && user) {
        state.token = token;
        state.refreshToken = refreshToken || null;
        state.user = user;
        state.isAuthenticated = true;
      } else {
        state.token = null;
        state.refreshToken = null;
        state.user = null;
        state.isAuthenticated = false;
        clearAuthSession();
      }
      state.isInitialized = true;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      state.isInitialized = true;

      clearAuthSession();
    },
  },
});

export const {
  setCredentials,
  setTokens,
  setUser,
  setToken,
  setAuthLoading,
  setAuthError,
  hydrateAuth,
  logout,
} = authSlice.actions;

export default authSlice.reducer;

