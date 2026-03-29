import { z } from "zod";

import { criarClienteSchema, pagamentoUnionSchema } from "../schemas/asaas.schema";

export type CriarClienteInput = z.infer<typeof criarClienteSchema>;
export type CriarPagamentoInput = z.infer<typeof pagamentoUnionSchema>;
