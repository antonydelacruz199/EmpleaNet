export type Empleo = {
  id: string;
  title: string;
  company?: string;
  location?: string;
  modalidad?: string;
  tags?: string[];
  descripcion?: string;
  urlOferta?: string;
  salario?: string;
  fechaPublicacion?: string;
};

export type EmpleoDetalle = Empleo;

export type ListadoEmpleos = {
  empleos: Empleo[];
  page: number;
  limit: number;
  total: number;
};
