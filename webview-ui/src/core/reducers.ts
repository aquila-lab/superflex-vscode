import authReducer from './auth/authSlice';
import userReducer from './user/userSlice';
import chatReducer from './chat/chatSlice';
import configReducer from './config/configSlice';

const reducers = {
  auth: authReducer,
  user: userReducer,
  chat: chatReducer,
  config: configReducer
};

export default reducers;
