import { z } from "zod";

// Zod schema to validate service form inputs
export const ServiceFormSchema = z.object({
    name: z
        .string()
        .min(3, { message: "Nome deve ter pelo menos 3 letras." })
        .max(80, { message: "Nome pode ter no máximo 80 letras." }),
    duration: z
        .coerce.number()
        .min(10, { message: "Duração deve ter pelo menos 10 minutos." })
        .max(240, { message: "Duração não pode exceder 4 horas." }),
    priceCents: z
        .coerce.number()
        .min(0, { message: "Preço não pode ser negativo." }),
    online: z.boolean().default(true),
});
