// client/src/services/file.ts
import api from './api';

// Define the shape of the file data we expect from the backend
export interface IUserFile {
  _id: string;
  originalName: string;
  size: number;
  uniqueId: string;
  createdAt: string; // Dates are typically strings in JSON
   groupId: string; // <-- ADDED
}

/**
 * Fetches the file history for the authenticated user.
 * The JWT token is automatically added by the axios interceptor in api.ts.
 */
export const getMyFiles = async (): Promise<IUserFile[]> => {
  const response = await api.get('/files/my-files');
  return response.data;
};
