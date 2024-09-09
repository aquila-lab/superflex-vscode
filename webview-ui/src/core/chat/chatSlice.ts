import { v4 as uuidv4 } from 'uuid';
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import { InitState } from '../../../../shared/protocol';
import { ChatMessage } from '../message/ChatMessage.model';
import { MessageType, Role } from '../../../../shared/model';

const defaultMessages: ChatMessage[] = [
  {
    id: uuidv4(),
    role: Role.Assistant,
    type: MessageType.Text,
    content:
      "Welcome to Superflex! I'm here to help turn your ideas into reality in seconds. Let’s work together and get things done—tell me what you'd like to build today!"
  }
];

type ChatState = {
  init: InitState;
  messages: ChatMessage[];
  isMessageProcessing: boolean;
  isProjectSyncing: boolean;
};

const initialState: ChatState = {
  init: {
    isInitialized: false,
    isFigmaAuthenticated: false
  },
  messages: defaultMessages,
  isMessageProcessing: false,
  isProjectSyncing: false
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setInitState: (state, action: PayloadAction<Partial<InitState>>) => {
      state.init = { ...state.init, ...action.payload };
    },
    addMessages: (state, action: PayloadAction<ChatMessage[]>) => {
      state.messages = [...state.messages, ...action.payload];
    },
    clearMessages(state) {
      state.messages = defaultMessages;
    },
    setIsMessageProcessing: (state, action: PayloadAction<boolean>) => {
      state.isMessageProcessing = action.payload;
    },
    setIsProjectSyncing: (state, action: PayloadAction<boolean>) => {
      state.isProjectSyncing = action.payload;
    }
  }
});

export const { setInitState, addMessages, clearMessages, setIsMessageProcessing, setIsProjectSyncing } =
  chatSlice.actions;

export default chatSlice.reducer;
