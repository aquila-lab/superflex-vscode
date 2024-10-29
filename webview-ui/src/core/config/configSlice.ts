import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

type ConfigState = {
  allowAnonymousTelemetry: boolean;
};

const initialState: ConfigState = {
  allowAnonymousTelemetry: false
};

const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    setConfig: (state, action: PayloadAction<ConfigState>) => {
      state.allowAnonymousTelemetry = action.payload.allowAnonymousTelemetry;
    }
  }
});

export const { setConfig } = configSlice.actions;

export default configSlice.reducer;
