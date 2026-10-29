export type Role = "member" | "admin" | "owner";

export type Profile = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: Role;
  created_at: string;
};

export type Match = {
  id: string;
  match_date: string;
  start_time: string;
  end_time: string | null;
  pitch_name: string;
  address: string | null;
  maps_url: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
};

export const isAdminRole = (role: Role | undefined) => role === "admin" || role === "owner";
