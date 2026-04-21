import { FuentesRepository } from "./fuentes.repository.js";

export class FuentesService {
  private readonly fuentesRepository = new FuentesRepository();

  async list() {
    return this.fuentesRepository.listAll();
  }
}
