import { z } from "zod";

export const registerFormSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "El usuario debe tener al menos 3 caracteres")
    .max(32, "El usuario es demasiado largo"),
  email: z.string().trim().min(1, "El email es obligatorio").email("Introduce un email válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export type RegisterFormValues = z.infer<typeof registerFormSchema>;
