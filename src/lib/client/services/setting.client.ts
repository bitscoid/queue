// src/lib/client/services/setting.client.ts
import { fetcher } from "$lib/client/utils/fetcher";

export interface Setting {
    logo: string | null;
    name: string;
    description: string;
}

export async function getSetting(): Promise<Setting> {
    return fetcher<Setting>("/api/settings");
}
