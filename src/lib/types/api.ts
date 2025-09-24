// types/api.ts

import type {
  User,
  Queue,
  Ticket,
  DailySequence,
  Setting,
  ApiToken,
  ApiResponse,
} from "./index";

/*
|--------------------------------------------------------------------------
| AUTH
|--------------------------------------------------------------------------
*/

// ✅ Login
export interface LoginRequest {
  email: string;
  password: string;
}
export type LoginResponse = ApiResponse<{
  user: User;
  token: string;
}>;

// ✅ Register
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}
export type RegisterResponse = ApiResponse<{
  user: User;
  token: string;
}>;

// ✅ Profile (me)
export type ProfileResponse = ApiResponse<User>;

/*
|--------------------------------------------------------------------------
| USER MANAGEMENT
|--------------------------------------------------------------------------
*/
export type GetUsersResponse = ApiResponse<User[]>;
export type GetUserResponse = ApiResponse<User>;
export type CreateUserRequest = Omit<
  User,
  "id" | "createdAt" | "updatedAt" | "tokens" | "tickets" | "queue"
>;
export type UpdateUserRequest = Partial<CreateUserRequest>;
export type DeleteUserResponse = ApiResponse<null>;

/*
|--------------------------------------------------------------------------
| QUEUES
|--------------------------------------------------------------------------
*/
export type GetQueuesResponse = ApiResponse<Queue[]>;
export type GetQueueResponse = ApiResponse<Queue>;
export interface CreateQueueRequest {
  code: string;
  name: string;
  ticketPrefix: string;
}
export type CreateQueueResponse = ApiResponse<Queue>;
export type UpdateQueueRequest = Partial<CreateQueueRequest>;
export type DeleteQueueResponse = ApiResponse<null>;

/*
|--------------------------------------------------------------------------
| TICKETS
|--------------------------------------------------------------------------
*/

// Ambil tiket baru
export interface CreateTicketRequest {
  queueId: number;
}
export type CreateTicketResponse = ApiResponse<Ticket>;

// Ambil tiket berikutnya (dipanggil di loket)
export interface NextTicketRequest {
  queueId: number;
  userId: number; // user loket
}
export type NextTicketResponse = ApiResponse<Ticket | null>;

// Update status tiket
export interface UpdateTicketStatusRequest {
  ticketId: number;
  status: "CALLED" | "SERVING" | "SKIPPED" | "COMPLETED" | "CANCELLED";
}
export type UpdateTicketStatusResponse = ApiResponse<Ticket>;

// List tiket hari ini
export type GetTodayTicketsResponse = ApiResponse<Ticket[]>;

/*
|--------------------------------------------------------------------------
| Sequence
|--------------------------------------------------------------------------
*/
export interface SequencesResponse {
  success: boolean;
  message: string;
  data?: (DailySequence & {
    queue: { id: number; code: string; name: string; ticketPrefix: string };
  })[];
}

/*
|--------------------------------------------------------------------------
| SETTINGS
|--------------------------------------------------------------------------
*/
export type GetSettingResponse = ApiResponse<Setting>;
export type UpdateSettingRequest = Partial<Setting>;
export type UpdateSettingResponse = ApiResponse<Setting>;

/*
|--------------------------------------------------------------------------
| API TOKENS
|--------------------------------------------------------------------------
*/
export interface CreateApiTokenRequest {
  name: string;
}
export type CreateApiTokenResponse = ApiResponse<ApiToken>;
export type GetApiTokensResponse = ApiResponse<ApiToken[]>;
export type RevokeApiTokenResponse = ApiResponse<null>;
