export type Empleo = {
  id: string;
  title: string;
  company?: string;
  location?: string;
  tags?: string[];
};

export type EmpleoDetalle = Empleo & {
  descripcion?: string;
  urlOferta?: string;
  salario?: string;
  fechaPublicacion?: string;
};
