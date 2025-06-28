// client/src/services/auth.ts
import api from './api';

// Define the shape of our user and auth data
export interface IUser {
  id: string;
  name: string;
  email: string;
}

export interface IAuthResponse {
  token: string;
  user: IUser;
}

// Define the input types for our functions
type RegisterInput = Omit<IUser, 'id'> & { password: string };
type LoginInput = Pick<RegisterInput, 'email' | 'password'>;


export const registerUser = async (userData: RegisterInput): Promise<IAuthResponse> => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const loginUser = async (credentials: LoginInput): Promise<IAuthResponse> => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};