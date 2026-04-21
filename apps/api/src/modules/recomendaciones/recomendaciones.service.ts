import type { RecomendacionesQuery } from "./recomendaciones.schema.js";
import { RecomendacionesRepository } from "./recomendaciones.repository.js";

export class RecomendacionesService {
  private readonly recomendacionesRepository = new RecomendacionesRepository();

  async list(query: RecomendacionesQuery) {
    const skills = query.skills
      .split(",")
      .map((skill) => skill.trim().toLowerCase())
      .filter(Boolean);

    const jobs = await this.recomendacionesRepository.findCandidateJobs();
    return jobs.filter((job) => {
      const tags = job.tags?.map((tag) => tag.toLowerCase()) ?? [];
      return skills.some((skill) => tags.some((tag) => tag.includes(skill)));
    });
  }
}
