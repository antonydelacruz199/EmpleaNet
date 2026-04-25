import type { ListEmpleosQuery } from "./empleos.schema.js";
import { EmpleosRepository } from "./empleos.repository.js";

export class EmpleosService {
  private readonly empleosRepository = new EmpleosRepository();

  list(query: ListEmpleosQuery) {
    return this.empleosRepository.listFiltrado(query);
  }

  async getById(id: string) {
    return this.empleosRepository.findById(id);
  }
}
