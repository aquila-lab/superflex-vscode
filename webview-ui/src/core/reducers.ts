import authReducer from './auth/authSlice';
import userReducer from './user/userSlice';

const reducers = {
  auth: authReducer,
  user: userReducer
};

export default reducers;
