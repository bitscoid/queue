// src/lib/stores/setting.ts
import { writable } from "svelte/store";

export const setting = writable<{
  name?: string;
  description?: string;
  logo?: string | null;
}>({});

export function initSetting(data: {
  appName?: string;
  appDesc?: string;
  appLogo?: string | null;
}) {
  setting.set({
    name: data.appName,
    description: data.appDesc,
    logo: data.appLogo ?? undefined, // null jadi undefined
  });
}
