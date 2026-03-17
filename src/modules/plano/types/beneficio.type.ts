import { z } from "zod";
import { beneficioSchema, updateBeneficioSchema } from "../schema/beneficio.schema";

export type CreateBeneficioInput = z.infer<typeof beneficioSchema>;
export type UpdateBeneficioInput = z.infer<typeof updateBeneficioSchema>;