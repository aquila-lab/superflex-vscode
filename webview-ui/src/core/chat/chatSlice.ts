import { v4 as uuidv4 } from 'uuid';
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import { FilePayload, InitChatState } from '../../../../shared/protocol';
import { Message, MessageType, Role, TextContent } from '../../../../shared/model';

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
    },
    setProjectFiles: (state, action: PayloadAction<FilePayload[]>) => {
      state.files = action.payload;
    },
    setSelectedFiles: (state, action: PayloadAction<FilePayload[]>) => {
      state.selectedFiles = action.payload;
    },
    addSelectedFile: (state, action) => {
      const file = action.payload;

      // Check if file is already in selectedFiles by matching id or unique identifier
      const existingFileIndex = state.selectedFiles.findIndex((f) => f.id === file.id);

      if (existingFileIndex !== -1) {
        // File already exists, so update selections instead of adding a new entry
        state.selectedFiles[existingFileIndex] = {
          ...state.selectedFiles[existingFileIndex],
          // Merge any additional fields if necessary, such as code selections
          ...file
        };
      } else {
        // If file doesn't exist, add it to the selectedFiles array
        state.selectedFiles.push(file);
      }
    },
    removeSelectedFile: (state, action: PayloadAction<string>) => {
      state.selectedFiles = state.selectedFiles.filter((file) => file.id !== action.payload);
    }
  }
});

export const {
  setInitState,
  addMessages,
  clearMessages,
  setIsMessageProcessing,
  setIsProjectSyncing,
  setProjectFiles,
  setSelectedFiles,
  addSelectedFile,
  removeSelectedFile
} = chatSlice.actions;

export default chatSlice.reducer;
