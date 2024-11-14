import { v4 as uuidv4 } from 'uuid';
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import { FilePayload, InitChatState } from '../../../../shared/protocol';
import { Message, MessageType, Role, TextContent, TextDelta } from '../../../../shared/model';

const defaultMessageContent: TextContent = {
  type: MessageType.Text,
  text: "Welcome to Superflex! I'm here to help turn your ideas into reality in seconds. Let’s work together and get things done—tell me what you'd like to build today!"
};

const defaultMessages: Message[] = [
  {
    id: uuidv4(),
    threadID: uuidv4(),
    role: Role.Assistant,
    content: defaultMessageContent,
    feedback: 'none',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

type ChatState = {
  init: InitChatState;
  messages: Message[];
  isMessageStreaming: boolean;
  isMessageProcessing: boolean;
  isProjectSyncing: boolean;
  files: FilePayload[];
  selectedFiles: FilePayload[];
};

const initialState: ChatState = {
  init: {
    isInitialized: false,
    isFigmaAuthenticated: false
  },
  messages: defaultMessages,
  isMessageStreaming: false,
  isMessageProcessing: false,
  isProjectSyncing: false,
  files: [],
  selectedFiles: []
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setInitState: (state, action: PayloadAction<Partial<InitChatState>>) => {
      state.init = { ...state.init, ...action.payload };
    },
    addMessages: (state, action: PayloadAction<Message[]>) => {
      const lastMessage = state.messages[state.messages.length - 1];

      // If the last message is a text delta, replace it with the new messages
      if (lastMessage.content.type === MessageType.TextDelta) {
        state.messages = [...state.messages.slice(0, -1), ...action.payload];
        return;
      }

      state.messages = [...state.messages, ...action.payload];
    },
    clearMessages(state) {
      state.messages = defaultMessages;
    },
    updateMessageTextDelta: (state, action: PayloadAction<TextDelta>) => {
      const lastMessage = state.messages[state.messages.length - 1];
      if (lastMessage.content.type !== MessageType.TextDelta) {
        state.messages = [
          ...state.messages,
          {
            id: uuidv4(),
            threadID: uuidv4(),
            role: Role.Assistant,
            content: {
              type: MessageType.TextDelta,
              value: action.payload.value
            },
            feedback: 'none',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ];
        return;
      }

      lastMessage.content.value += action.payload.value;
    },
    setIsMessageStreaming: (state, action: PayloadAction<boolean>) => {
      state.isMessageStreaming = action.payload;
    },
    setIsMessageProcessing: (state, action: PayloadAction<boolean>) => {
      state.isMessageProcessing = action.payload;
    },
    setIsProjectSyncing: (state, action: PayloadAction<boolean>) => {
      state.isProjectSyncing = action.payload;
    },
    setProjectFiles: (state, action: PayloadAction<FilePayload[]>) => {
      state.files = action.payload;
    },
    setSelectedFiles: (state, action: PayloadAction<FilePayload[]>) => {
      state.selectedFiles = action.payload;
    },
    addSelectedFile: (state, action: PayloadAction<FilePayload>) => {
      if (action.payload.isCurrentOpenFile) {
        state.selectedFiles = [
          action.payload,
          ...state.selectedFiles.filter((f) => !f.isCurrentOpenFile && f.relativePath !== action.payload.relativePath)
        ];
        return;
      }
      if (state.selectedFiles.find((f) => f.relativePath === action.payload.relativePath)) {
        return;
      }

      state.selectedFiles = [...state.selectedFiles, action.payload];
    },
    removeSelectedFile: (state, action: PayloadAction<FilePayload>) => {
      state.selectedFiles = state.selectedFiles.filter((file) => file.relativePath !== action.payload.relativePath);
    }
  }
});

export const {
  setInitState,
  addMessages,
  clearMessages,
  updateMessageTextDelta,
  setIsMessageStreaming,
  setIsMessageProcessing,
  setIsProjectSyncing,
  setProjectFiles,
  setSelectedFiles,
  addSelectedFile,
  removeSelectedFile
} = chatSlice.actions;

export default chatSlice.reducer;
