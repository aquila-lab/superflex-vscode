import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import { ChatMessage } from '../message/ChatMessage.model';

type ChatState = {
  messages: ChatMessage[];
};

const initialState: ChatState = {
  messages: []
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessages: (state, action: PayloadAction<ChatMessage[]>) => {
      state.messages = [...state.messages, ...action.payload];
    }
  }
});

export const { addMessages } = chatSlice.actions;

export default chatSlice.reducer;
