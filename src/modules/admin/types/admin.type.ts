import { z } from "zod";

import { adminSchema, updateAdminSchema } from "../schemas/admin.schema";

export type CreateAdminInput = z.infer<typeof adminSchema>;
export type UpdateAdminInput = z.infer<typeof updateAdminSchema>;

export type AdminRole = "SUPER_ADMIN" | "OPERACIONAL" | "PORTARIA";
