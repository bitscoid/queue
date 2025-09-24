// src/lib/validations/dailySequence.ts
import { z } from "zod";

export const dailySequenceSchema = z.object({
  id: z.number(),
  queueId: z.number(),
  seqNumber: z.number(),
  date: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type DailySequence = z.infer<typeof dailySequenceSchema>;
export const dailySequenceArraySchema = z.array(dailySequenceSchema);
