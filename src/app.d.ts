// src/app.d.ts
declare global {
  namespace App {
    interface Locals {
      user?: {
        code: string | null;
        queueId: number | null;
        id: number;
        name: string;
        email: string | null;
        role: "admin" | "user";
        photo: string;
        createdAt: Date;
      };
      token?: {
        id: number;
        name: string;
        token: string;
        revoked: boolean;
        createdAt: Date;
        creator: {
          id: number;
          name: string;
          email: string | null;
          role: "admin" | "user";
          photo: string;
          createdAt: Date;
          code: string | null;
          queueId: number | null;
        };
      };
    }
  }
}

export {};
