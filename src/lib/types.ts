// frontend/src/lib/types.ts
export interface Task {
  id: number | string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  dueDate?: Date | string;  // Keep for compatibility with frontend usage
  due_date?: Date | string; // For API response compatibility
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  tags?: string;
  is_recurring?: boolean;
  recurring_rule?: string | null;
}

export interface User {
  id: string;
  email: string;
  name: string;
  authenticated: boolean;
}

export interface Session {
  user: User | null;
  token: string | null;
  expiresAt?: Date;
}

export interface TaskFormValues {
  title: string;
  description?: string;
  dueDate?: Date | null;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  tags?: string;
  is_recurring?: boolean;
  recurring_rule?: string | null;
}