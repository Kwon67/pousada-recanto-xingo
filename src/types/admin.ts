export type AdminAccessEventType = 'login' | 'access' | 'login_failed' | 'logout';

export interface AdminAccessLog {
  id: string;
  username: string;
  event_type: AdminAccessEventType;
  ip: string | null;
  user_agent: string | null;
  path: string | null;
  created_at: string;
}
