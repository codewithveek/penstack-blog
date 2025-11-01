import { TPermissions, UserInsert } from "@/types";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role_id: number;
      auth_type: UserInsert["auth_type"];
      username: string;
      avatar: string;
      email: string;
      name: string;
      image?: string;
      permissions: TPermissions[];
    };
  }

  interface User {
    id: string;
    role_id: number;
    auth_type: UserInsert["auth_type"];
    username: string;
    avatar: string;
    name: string;
    image?: string;
    permissions: TPermissions[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role_id: number;
    auth_type: UserInsert["auth_type"];
    username: string;
    avatar: string;
    name: string;
    image?: string;
    permissions: TPermissions[];
  }
}
