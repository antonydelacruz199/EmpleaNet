import type { Empleo } from "./empleos.schema.js";

const empleosSeed: Empleo[] = [
  {
    id: "1",
    title: "Desarrollador frontend",
    company: "Acme",
    location: "Remoto",
    tags: ["react", "typescript"],
  },
  {
    id: "2",
    title: "Ingeniero backend",
    company: "Globex",
    location: "Madrid",
    tags: ["nodejs", "postgresql"],
  },
];

export class EmpleosRepository {
  findAll(): Promise<Empleo[]> {
    return Promise.resolve(structuredClone(empleosSeed));
  }

  async findById(id: string): Promise<Empleo | null> {
    const empleos = await this.findAll();
    const empleo = empleos.find((item) => item.id === id);
    return empleo ?? null;
  }
}
