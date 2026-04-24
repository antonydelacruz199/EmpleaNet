import type { ListEmpleosQuery } from "./empleos.schema.js";
import { EmpleosRepository } from "./empleos.repository.js";

export class EmpleosService {
  private readonly empleosRepository = new EmpleosRepository();

  async list(query: ListEmpleosQuery) {
    const empleos = await this.empleosRepository.findAll();
    const q = query.q?.toLowerCase();
    const location = query.location?.toLowerCase();

    return empleos.filter((empleo) => {
      const matchesQuery =
        q === undefined ||
        empleo.title.toLowerCase().includes(q) ||
        Boolean(empleo.company?.toLowerCase().includes(q)) ||
        Boolean(empleo.descripcion?.toLowerCase().includes(q)) ||
        Boolean(empleo.tags?.some((tag) => tag.toLowerCase().includes(q)));

      const matchesLocation =
        location === undefined || empleo.location?.toLowerCase().includes(location);

      return matchesQuery && matchesLocation;
    });
  }

  async getById(id: string) {
    return this.empleosRepository.findById(id);
  }
}
