import { z } from "zod";

import { assinaturaSchema, faturaSchema, pagamentoSchema, pagamentoIngressoSchema, updatePagamentoIngressoSchema } from "../schemas/pagamento.schema";

export type CreatePagamentoInput = z.infer<typeof pagamentoSchema>;
export type CreateFaturaInput = z.infer<typeof faturaSchema>;
export type UpdateFaturaInput = Partial<CreateFaturaInput>;
export type CreateAssinaturaInput = z.infer<typeof assinaturaSchema>;
export type UpdateAssinaturaInput = Partial<CreateAssinaturaInput> & { fimEm?: string };
export type CreatePagamentoIngressoInput = z.infer<typeof pagamentoIngressoSchema>;
export type UpdatePagamentoIngressoInput = z.infer<typeof updatePagamentoIngressoSchema>;
