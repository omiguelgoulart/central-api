import { z } from "zod";

import { ingressoSchema, updateIngressoSchema } from "../schemas/ingresso.schema";

export type CreateIngressoInput = z.infer<typeof ingressoSchema>;
export type UpdateIngressoInput = z.infer<typeof updateIngressoSchema>;

export type IngressoStatus = "VALIDO" | "USADO" | "CANCELADO";
