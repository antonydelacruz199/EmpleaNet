import { EmpleosRepository } from "../empleos/empleos.repository.js";

export class RecomendacionesRepository {
  private readonly empleosRepository = new EmpleosRepository();

  async findCandidateJobs() {
    return this.empleosRepository.findAll();
  }
}
