import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import { User, UserSubscription } from '../../../../shared/model';

type UserState = User & {
  subscription: UserSubscription | null;
};

const initialState: UserState = {
  id: '',
  username: '',
  email: '',
  subscription: null
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.id = action.payload.id;
      state.username = action.payload.username;
      state.email = action.payload.email;
      state.picture = action.payload.picture;
    },
    setUserSubscription: (state, action: PayloadAction<UserSubscription>) => {
      state.subscription = action.payload;
    }
  }
});

export const { setUser, setUserSubscription } = userSlice.actions;

export default userSlice.reducer;
