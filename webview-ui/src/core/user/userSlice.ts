import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import { User } from '../../../../shared/model';

type UserState = User;

const initialState: UserState = {
  id: '',
  username: '',
  email: ''
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
    }
  }
});

export const { setUser } = userSlice.actions;

export default userSlice.reducer;
