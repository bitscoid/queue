import type { User, ApiToken } from "$lib/types";

declare global {
  namespace App {
    interface Locals {
      user?: User;
      token?: ApiToken;
    }
    interface PageData {
      tokens: ApiToken[];
    }
  }
}
export { };
