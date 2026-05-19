import { z } from "zod";

export const forgotPasswordFormSchema = z.object({
  email: z.string().min(1, "El email es obligatorio").email("Introduce un email válido"),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordFormSchema>;
