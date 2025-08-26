// src/routes/sequences/+page.ts
import type { PageLoad } from "./$types";
import type { SequencesResponse } from "$lib/types/api";

export const load: PageLoad = async ({ fetch }) => {
    const res = await fetch("/api/sequences");
    const data: SequencesResponse = await res.json();

    return {
        sequences: data.data ?? [],
    };
};
