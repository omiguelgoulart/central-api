import { z } from "zod";

import { ingressoSchema, updateIngressoSchema, createIngressoComPagamentoSchema } from "../schemas/ingresso.schema";

export type CreateIngressoInput = z.infer<typeof ingressoSchema>;
export type UpdateIngressoInput = z.infer<typeof updateIngressoSchema>;
export type CreateIngressoComPagamentoInput = z.infer<typeof createIngressoComPagamentoSchema>;

export type IngressoStatus = "VALIDO" | "USADO" | "CANCELADO" | "EXPIRADO" | "ESTORNADO";
