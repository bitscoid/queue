import type { PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";
import {
  getAllKeys,
  getKeysByUserId,
} from "$lib/server/services/token.service";
import type { ApiToken } from "$lib/types";

export const load: PageServerLoad = async ({ locals }) => {
  const user = locals.user;
  if (!user) throw redirect(302, "/login");

  let tokens =
    user.role === "admin" ? await getAllKeys() : await getKeysByUserId(user.id);

  // Mapping untuk frontend sesuai tipe ApiToken
  const keys: ApiToken[] = tokens.map((t) => ({
    id: t.id,
    name: t.name,
    token: t.token,
    revoked: t.revoked,
    createdBy: t.createdBy,
    createdAt: t.createdAt, // tetap Date
    creator: {
      id: t.creator.id,
      name: t.creator.name,
      email: t.creator.email,
      photo: t.creator.photo ?? "/uploads/placeholder.png",
    },
  }));

  return { keys };
};
