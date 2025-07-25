import bcrypt from "bcryptjs";
import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/app/libs/prismadb";

// ✅ Configuration automatique des URLs selon l'environnement
const getBaseUrl = () => {
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3001';
  }
  
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }
  
  // Fallback pour production
  return 'https://flexiihouse.onrender.com';
};

console.log("🔍 Environment:", process.env.NODE_ENV);
console.log("🔍 Base URL utilisée:", getBaseUrl());
console.log("🔍 NEXTAUTH_URL env:", process.env.NEXTAUTH_URL);

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        login: { label: "Email or Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("🔍 Authorize appelé avec:", { login: credentials?.login });
        
        if (!credentials?.login || !credentials?.password) {
          throw new Error("Missing login or password");
        }

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

        console.log("🔍 User authentifié:", { id: user.id, email: user.email });

        return {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          numberPhone: user.numberPhone,
          role: user.role,
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
    maxAge: 30 * 24 * 60 * 60,
  },
  
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        console.log("🔍 JWT callback - user:", user.id);
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.numberPhone = user.numberPhone;
        token.role = user.role;
        token.image = user.image;
      }
      return token;
    },
    
    async session({ session, token }) {
      if (token) {
        console.log("🔍 Session callback - token ID:", token.id);
        (session.user as any).id = token.id as string;
        (session.user as any).email = token.email as string;
        (session.user as any).name = token.name as string;
        (session.user as any).numberPhone = token.numberPhone as string;
        (session.user as any).role = token.role;
        (session.user as any).image = token.image as string;
      }
      return session;
    },
  },
  
  // ✅ Configuration cookies adaptée à l'environnement
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' 
        ? `__Secure-next-auth.session-token`
        : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        // ✅ Domain automatique selon l'environnement
        domain: process.env.NODE_ENV === 'production' 
          ? '.onrender.com'  // Pour Render
          : undefined        // Localhost
      }
    }
  },
  
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);