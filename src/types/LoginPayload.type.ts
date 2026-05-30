export interface LoginPayload {
  email: string;
  name?: string; // Optional depending on if you want to verify it
  password?: string;
}
