import { z } from "zod";

import {
    checkoutConfirmarSchema,
    confirmarPedidoSchema,
    itemCreateSchema,
    itemPatchSchema,
    pedidoCreateSchema,
    pedidoPatchSchema,
    reservaBodySchema,
} from "../schemas/reserva.schema";

export type ReservaBody = z.infer<typeof reservaBodySchema>;
export type PedidoCreateInput = z.infer<typeof pedidoCreateSchema>;
export type PedidoPatchInput = z.infer<typeof pedidoPatchSchema>;
export type ItemCreateInput = z.infer<typeof itemCreateSchema>;
export type ItemPatchInput = z.infer<typeof itemPatchSchema>;
export type ConfirmarPedidoInput = z.infer<typeof confirmarPedidoSchema>;
export type CheckoutConfirmarInput = z.infer<typeof checkoutConfirmarSchema>;
