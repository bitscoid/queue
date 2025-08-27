// types/index.ts

/*
|--------------------------------------------------------------------------
| ENUMS
|--------------------------------------------------------------------------
*/
export type TicketStatus =
  | "PENDING"
  | "CALLED"
  | "SERVING"
  | "SKIPPED"
  | "COMPLETED"
  | "CANCELLED";

/*
|--------------------------------------------------------------------------
| MODELS
|--------------------------------------------------------------------------
*/

// ✅ User
export interface User {
  id: number;
  code?: string | null; // misal D-01, K-01, S-01
  name: string;
  email?: string | null;
  password: string;
  role: "admin" | "user";
  photo: string; // default "/uploads/placeholder.png"
  queueId?: number | null;
  createdAt: Date;
  updatedAt: Date;

  // relations
  queue?: Queue;
  tickets?: Ticket[];
  tokens?: ApiToken[];
}

// ✅ Queue / Layanan
export interface Queue {
  id: number;
  code: string; // mis: "DESAINER", "KASIR", "PENGAMBILAN"
  name: string;
  ticketPrefix: string; // mis. "RZD", "RZK", "RZS"
  createdAt: Date;
  updatedAt: Date;

  // relations
  users?: User[];
  tickets?: Ticket[];
  sequences?: DailySequence[];
}

// ✅ Ticket / Nomor Antrian
export interface Ticket {
  id: number;
  queueId: number;
  seqNumber: number; // nomor urut per queue per hari
  fullNumber: string; // mis. RZD-001
  status: TicketStatus;
  date: Date;
  createdAt: Date;
  updatedAt: Date;

  servedByUserId?: number | null;

  // relations
  queue?: Queue;
  servedByUser?: User;
}

// ✅ Ticket versi untuk ditampilkan di UI (sudah "diratakan")
export interface TicketDisplay {
  id: number;
  fullNumber: string;
  status: TicketStatus;
  date: string;       // selalu string (ISO format) supaya aman
  createdAt: string;
  updatedAt: string;

  queueId: number;
  queueName: string;  // diturunkan dari relation Queue
  seqNumber: number;

  servedById?: number | null;
  servedByName: string; // diturunkan dari relation User
}

// ✅ Daily Sequence
export interface DailySequence {
  id: number;
  queueId: number;
  date: Date; // startOfDay
  nextSeq: number;
  updatedAt: Date;

  // relations
  queue?: Queue;
}

// ✅ Setting
export interface Setting {
  id: number; // default 1
  name: string;
  description: string;
  logo?: string | null;
}

// ✅ ApiToken
export interface ApiToken {
  id: number;
  name: string;
  token: string;
  createdAt: Date;
  revoked: boolean;

  createdBy: number;

  // relations
  creator?: User;
}

/*
|--------------------------------------------------------------------------
| AUTH / FORM TYPES
|--------------------------------------------------------------------------
*/

// ✅ Form data untuk Login dan Register
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
}

// ✅ Standar response API
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}
