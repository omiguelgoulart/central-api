import { z } from "zod";
import { planoSchema, updatePlanoSchema } from "../schema/plano.schema";

export type CreatePlanoInput = z.infer<typeof planoSchema>;
export type UpdatePlanoInput = z.infer<typeof updatePlanoSchema>;

export type PeriodicidadePlano =
  | "MENSAL"
  | "TRIMESTRAL"
  | "SEMESTRAL"
  | "ANUAL";