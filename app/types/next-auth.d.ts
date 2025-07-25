// types/next-auth.d.ts
import NextAuth from "next-auth";
import { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      numberPhone?: string | null;  // ✅ Ajout de numberPhone
      role: UserRole;               // ✅ Ajout de role
    };
  }
  
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    numberPhone?: string | null;    // ✅ Ajout de numberPhone
    role: UserRole;                 // ✅ Ajout de role
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    numberPhone?: string | null;    // ✅ Ajout de numberPhone
    role: UserRole;                 // ✅ Ajout de role
  }
}