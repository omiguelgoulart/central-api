import { z } from "zod";

import { setorSchema, updateSetorSchema } from "../schemas/setor.schema";

export type CreateSetorInput = z.infer<typeof setorSchema>;
export type UpdateSetorInput = z.infer<typeof updateSetorSchema>;