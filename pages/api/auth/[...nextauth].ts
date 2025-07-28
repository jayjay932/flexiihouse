import bcrypt from "bcryptjs";
import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/app/libs/prismadb";

// ⚠️ Important pour Vercel
export const runtime = 'nodejs';

export const authOptions: AuthOptions = {
  // 🚫 RETIREZ PrismaAdapter pour les credentials
  // adapter: PrismaAdapter(prisma), 
  
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        login: { label: "Email or Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.login || !credentials?.password) {
          throw new Error("Missing login or password");
        }
        
        // Vérifie si c'est un email ou un numéro
        const isEmail = credentials.login.includes("@");
        const user = await prisma.user.findFirst({
          where: isEmail
            ? { email: credentials.login }
            : { numberPhone: credentials.login },
        });

        if (!user || !user.hashedPassword) {
          throw new Error("Invalid credentials");
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials");
        }

        // ✅ Retourner l'objet user complet
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  
  pages: {
    signIn: "/",
  },
  
  debug: process.env.NODE_ENV === "development",
  
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  
  // ✅ Callbacks essentiels pour JWT
  callbacks: {
    async jwt({ token, user }) {
      // Lors de la connexion, stocker les infos user dans le token
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
      }
      return token;
    },
    
    async session({ session, token }) {
      // Transférer les infos du token vers la session
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.image as string;
      }
      return session;
    },
  },
  
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);