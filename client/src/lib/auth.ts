// Simple auth context for demo purposes
// In a real app, this would integrate with Supabase Auth

export interface AuthUser {
  id: string;
  username: string;
  firstName?: string;
  lastName: string;
  email?: string;
}

// Mock current user for demo
export const getCurrentUser = (): AuthUser => {
  return {
    id: "demo-user-id",
    username: "demo",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com"
  };
};

export const getUserInitials = (user: AuthUser): string => {
  const first = user.firstName?.[0] || user.username[0];
  const last = user.lastName?.[0] || "";
  return (first + last).toUpperCase();
};
