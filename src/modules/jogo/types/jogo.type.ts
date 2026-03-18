import { z } from "zod";
import { jogoSchema, updateJogoSchema } from "../schemas/jogo.schema";

export type CreateJogoInput = z.infer<typeof jogoSchema>;
export type UpdateJogoInput = z.infer<typeof updateJogoSchema>;