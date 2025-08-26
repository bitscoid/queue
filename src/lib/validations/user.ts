import { z } from "zod";

export const userSchema = z.object({
    code: z
        .string()
        .regex(/^[A-Z]-\d{2}$/, "Format kode tidak valid, contoh: D-01")
        .optional()
        .nullable(),
    name: z.string().min(1, "Nama wajib diisi"),
    email: z
        .string()
        .email("Email tidak valid")
        .optional()
        .nullable(),
    password: z.string().min(6, "Minimal 6 karakter"),
    role: z.enum(["admin", "user"]).default("user"),
    photo: z
        .union([
            z.string().startsWith("/uploads/"),
            z.string().url(),
            z.literal(""),
        ])
        .default("/uploads/placeholder.png"),
    queueId: z.number().optional().nullable(),
});

// Untuk update → semua partial
export const userUpdateSchema = userSchema
    .partial()
    .extend({
        password: z.preprocess(
            (val) =>
                typeof val === "string" && val.trim() === "" ? undefined : val,
            z.string().min(6, "Minimal 6 karakter").optional()
        ),
    });

export type UserFormSchema = z.infer<typeof userSchema>;
export type UserUpdateSchema = z.infer<typeof userUpdateSchema>;
