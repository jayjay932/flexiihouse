import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/app/libs/prismadb";

const normalizeEmail = (e?: string) => (e ? e.trim().toLowerCase() : "");
const normalizePhone = (n?: string) => (n ? n.trim().replace(/[^\d+]/g, "") : "");

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        login: { label: "Email ou Téléphone", type: "text" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        const rawLogin = String(credentials?.login ?? "");
        const password = String(credentials?.password ?? "");
        if (!rawLogin || !password) return null;

        const looksEmail = rawLogin.includes("@");
        const email = looksEmail ? normalizeEmail(rawLogin) : undefined;
        const numberPhone = !looksEmail ? normalizePhone(rawLogin) : undefined;

        const user = await prisma.user.findFirst({
          where: {
            OR: [
              email ? { email } : undefined,
              numberPhone ? { numberPhone } : undefined,
            ].filter(Boolean) as any,
          },
        });

        if (!user || !user.hashedPassword) return null;

        const ok = await bcrypt.compare(password, user.hashedPassword);
        if (!ok) return null;

        return {
          id: user.id,
          name: user.name || "",
          email: user.email || undefined,
          image: user.image || undefined,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.name = user.name;
        token.email = user.email ?? undefined;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.name = (token.name as string) || session.user.name;
        session.user.email = (token.email as string) || session.user.email;
      }
      return session;
    },
  },
};

export default NextAuth(authOptions); // ✅ Pages Router = export default
