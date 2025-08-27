// src/lib/stores/setting.ts
import { writable } from "svelte/store";

export const setting = writable<{ name?: string; description?: string; logo?: string }>({});

export function initSetting(data: { appName?: string; appDesc?: string; appLogo?: string }) {
    setting.set({
        name: data.appName,
        description: data.appDesc,
        logo: data.appLogo
    });
}
