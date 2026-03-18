import { z } from "zod";
import { jogoSetorSchema, updateJogoSetorSchema } from "../schemas/jogoSetor.schema";

export type CreateJogoSetorInput = z.infer<typeof jogoSetorSchema>;
export type UpdateJogoSetorInput = z.infer<typeof updateJogoSetorSchema>;

export type TipoSetor = "ARQUIBANCADA" | "CADEIRA" | "CAMAROTE" | "VISITANTE" | "ACESSIVEL";    