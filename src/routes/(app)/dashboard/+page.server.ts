// src/routes/(app)/dashboard/+page.server.ts
import { getAllItems } from "$lib/server/services/item.service";
import { getAllUsers } from "$lib/server/services/user.service";
import { getAllKeys } from "$lib/server/services/token.service";
import { redirect } from "@sveltejs/kit";

export async function load({ locals }) {
  if (!locals.user) throw redirect(302, "/login");

  const [items, users, tokens] = await Promise.all([
    getAllItems(),
    getAllUsers(),
    getAllKeys(),
  ]);

  return {
    user: locals.user,
    items,
    users,
    tokens,
  };
}
