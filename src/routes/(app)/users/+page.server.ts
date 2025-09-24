// src/routes/(app)/users/+page.server.ts
import type { PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";
import { getAllUsers, getUserById } from "$lib/server/services/user.service";
import type { User } from "$lib/client/stores/user.store";

export const load: PageServerLoad = async (event) => {
  const user = event.locals.user;
  if (!user) {
    throw redirect(302, "/login");
  }

  const isAdmin = user.role === "admin";
  let users: User[] = [];

  if (isAdmin) {
    const all = await getAllUsers();
    users = all.map((u) => ({
      ...u,
      role: u.role as "admin" | "user", // 👈 cast ke union type
      createdAt: u.createdAt.toISOString(),
      updatedAt: u.updatedAt.toISOString(),
      photo: u.photo ?? "/uploads/placeholder.png",
    }));
  } else {
    const self = await getUserById(user.id);
    if (self) {
      users = [
        {
          ...self,
          role: self.role as "admin" | "user", // 👈 cast ke union type
          createdAt: self.createdAt.toISOString(),
          updatedAt: self.updatedAt.toISOString(),
          photo: self.photo ?? "/uploads/placeholder.png",
        },
      ];
    }
  }

  return {
    users,
    isAdmin,
    currentUserId: user.id,
  };
};
