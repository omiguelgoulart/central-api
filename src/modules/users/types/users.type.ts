import { z } from "zod";

import { usuarioSchema, updateUsuarioSchema} from "../schemas/users.schema";

export type CreateUsuarioInput = z.infer<typeof usuarioSchema>;
export type UpdateUsuarioInput = z.infer<typeof updateUsuarioSchema>;
