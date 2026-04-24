export type Empleo = {
  id: string;
  title: string;
  company?: string;
  location?: string;
  tags?: string[];
  descripcion?: string;
  urlOferta?: string;
  salario?: string;
  fechaPublicacion?: string;
};

export type EmpleoDetalle = Empleo;
