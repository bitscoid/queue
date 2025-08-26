import { getSetting } from "$lib/server/services/setting.service";

export async function load(event) {
  const user = event.locals.user;
  const setting = await getSetting();
  return { setting, user };
}
