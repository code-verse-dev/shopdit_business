import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  isAdmin?: boolean;
  [key: string]: any;
}

export interface BusinessProfile {
  _id: string;
  businessName?: string;
  businessType?: string;
  [key: string]: any;
}

interface AuthState {
  user: User | null;
  token: string | null;
  businessProfiles: BusinessProfile[];
}

const initialState: AuthState = {
  user: null,
  token: null,
  businessProfiles: [],
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        user: User;
        token: string;
        businessProfiles?: BusinessProfile[];
      }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.businessProfiles = action.payload.businessProfiles ?? [];
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.businessProfiles = [];
    },
    setActiveProfile: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.activeProfile = action.payload;
      }
    },
  },
});

export const { setCredentials, logout, setActiveProfile } = authSlice.actions;
export default authSlice.reducer;
