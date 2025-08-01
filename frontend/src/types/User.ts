export interface User {
  id?: number;
  name: string;
  email: string;
  username: string;
  password?: string; // Optional for display purposes
  role?: 'admin' | 'user'; // Add role field
  createdAt?: string;
  updatedAt?: string;
}
