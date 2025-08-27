// src/routes/(app)/dashboard/+page.server.ts
import { getAllUsers } from "$lib/server/services/user.service";
import { getAllKeys } from "$lib/server/services/token.service";
import { redirect } from "@sveltejs/kit";

export async function load({ locals }) {
  if (!locals.user) throw redirect(302, "/login");

  const [users, tokens] = await Promise.all([
    getAllUsers(),
    getAllKeys(),
  ]);

  return {
    user: locals.user,
    users,
    tokens,
  };
}
