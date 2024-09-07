import authReducer from './auth/authSlice';
import userReducer from './user/userSlice';
import chatReducer from './chat/chatSlice';

const reducers = {
  auth: authReducer,
  user: userReducer,
  chat: chatReducer
};

export default reducers;
