export type Perfil = {
  id: string;
  name: string;
  email: string;
  skills: string[];
  location?: string;
};

export type UpdatePerfilInput = {
  name: string;
  location?: string;
  skills: string[];
};
