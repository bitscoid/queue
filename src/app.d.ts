// src/app.d.ts
declare global {
  namespace App {
    interface Locals {
      user?: {
        code: unknown;
        queueId: never;
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
        };
      };
    }
  }
}

export {};
