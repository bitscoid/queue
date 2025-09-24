import { json } from "@sveltejs/kit";
import {
  getAllKeys,
  createKey,
  getKeysByUserId,
} from "$lib/server/services/token.service";
import { requireAnyRole, isAdmin } from "$lib/server/auth";
import type { RequestHandler } from "./$types";
import { tokenSchema } from "$lib/validations/token";

export const GET: RequestHandler = async (event) => {
  requireAnyRole(event);

  const user = event.locals.user;
  let tokens;

  if (isAdmin(event)) {
    tokens = await getAllKeys();
  } else {
    if (!user) {
      throw new Error("User is required");
    }
    tokens = await getKeysByUserId(user.id);
  }

  return json(tokens);
};

export const POST: RequestHandler = async (event) => {
  requireAnyRole(event);

  const user = event.locals.user;
  const body = await event.request.json();

  if (!user) {
    return json({ error: "User is required" }, { status: 401 });
  }

  // ✅ Validasi dengan Zod
  const parsed = tokenSchema.safeParse({
    ...body,
    createdBy: user.id, // tambahkan relasi user
  });

  if (!parsed.success) {
    return json(
      {
        message: "Validasi gagal",
        errors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  try {
    const newKey = await createKey(parsed.data);
    return json(newKey);
  } catch (err) {
    console.error(err);
    return json({ error: "Gagal membuat token" }, { status: 500 });
  }
};
