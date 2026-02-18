import { z } from "zod"

export const createEntrySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  personId: z.string().min(1),
  hours: z.number().min(0.5).max(10),
  projectId: z.string().min(1),
  projectPlanId: z.string().min(1),
  detailId: z.string().optional(),
  tipoDeHoras: z.enum([
    "Horas normales",
    "Horas extras",
    "Feriado",
    "Fallecimiento familiar",
    "Falta justificada",
    "ART",
    "Lluvia",
    "Vacaciones",
    "Suspension",
    "Casamiento",
    "Ausente",
    "Certificado Medico",
  ]),
  comments: z.string().max(500).optional(),
})

export const createEntriesSchema = z.object({
  entries: z.array(createEntrySchema).min(1).max(50),
})
