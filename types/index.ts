// Definisi Role yang tersedia di aplikasi
export type Role = 'SUPER_ADMIN' | 'ADMIN';

// Struktur Data User
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  joined: string;
  avatar: string;
}

// Struktur Data Menu Sidebar
export interface MenuItem {
  id: string;
  icon: any; 
  label: string;
  allowedRoles?: Role[];
}
