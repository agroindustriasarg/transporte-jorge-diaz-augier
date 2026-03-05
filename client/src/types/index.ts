export interface User {
  id: string;
  usuario: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: 'ADMIN' | 'GERENTE' | 'OPERARIO' | 'VISOR';
}

export interface AuthResponse {
  user: User;
  token: string;
}
