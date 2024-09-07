import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

type AuthState = {
  loggedIn: boolean;
};

const initialState: AuthState = {
  loggedIn: false
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoggedIn(state, action: PayloadAction<boolean>) {
      state.loggedIn = action.payload;
    }
  }
});

export const { setLoggedIn } = authSlice.actions;

export default authSlice.reducer;
