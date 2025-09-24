// src/lib/client/services/user.service.ts
import { fetcher } from "$lib/client/utils/fetcher";
import { userSchema, userUpdateSchema } from "$lib/validations/user";
import type { UserFormSchema, UserUpdateSchema } from "$lib/validations/user";

// Create user
export async function createUser(form: FormData): Promise<UserFormSchema> {
  return fetcher<UserFormSchema>(
    "/api/users",
    {
      method: "POST",
      body: form,
    },
    userSchema,
  );
}

// Update user
export async function updateUser(
  id: number,
  form: FormData,
): Promise<UserUpdateSchema> {
  return fetcher<UserUpdateSchema>(
    `/api/users/${id}`,
    {
      method: "PUT",
      body: form,
    },
    userUpdateSchema,
  );
}

// Delete user
export async function deleteUser(id: number): Promise<boolean> {
  try {
    await fetcher<null>(`/api/users/${id}`, { method: "DELETE" });
    return true;
  } catch {
    return false;
  }
}

// Get user
export async function getUser(id: number): Promise<UserFormSchema> {
  return fetcher<UserFormSchema>(`/api/users/${id}`, {}, userSchema);
}
