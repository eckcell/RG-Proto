import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

console.log("DEBUG: auth.ts module loaded");
console.log("DEBUG: NEXTAUTH_SECRET defined:", !!process.env.NEXTAUTH_SECRET);
console.log("DEBUG: NEXTAUTH_URL defined:", !!process.env.NEXTAUTH_URL);

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@riskguard.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log("DEBUG: Authorize callback started");
        console.log("DEBUG: Received email:", credentials?.email);
        
        if (!credentials?.email || !credentials?.password) {
          console.log("DEBUG: Auth failed: Missing credentials");
          return null;
        }

        const email = credentials.email.toLowerCase().trim();
        console.log(`DEBUG: Normalized email: "${email}"`);

        try {
          const user = await prisma.user.findUnique({
            where: { email }
          });

          if (!user) {
            console.log(`DEBUG: Auth failed: User NOT found in DB for email "${email}"`);
            const count = await prisma.user.count();
            console.log(`DEBUG: Total user count in DB: ${count}`);
            return null;
          }

          console.log("DEBUG: User found, comparing passwords...");
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

          if (!isPasswordValid) {
            console.log(`DEBUG: Auth failed: Password mismatch for ${email}`);
            return null;
          }

          console.log(`DEBUG: Auth SUCCESS for ${email}`);
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          console.log("DEBUG: Auth Error (CATCH):", errorMessage);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
