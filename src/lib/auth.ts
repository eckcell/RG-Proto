import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

console.error("DEBUG: auth.ts module loaded");

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@riskguard.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.error("DEBUG: Authorize called with email:", credentials?.email);
        
        if (!credentials?.email || !credentials?.password) {
          console.error("DEBUG: Missing email or password");
          return null;
        }

        const email = credentials.email.toLowerCase().trim();
        console.error(`DEBUG: Normalized email for lookup: "${email}"`);

        try {
          const user = await prisma.user.findUnique({
            where: { email }
          });

          if (!user) {
            console.error(`DEBUG: User NOT found in DB for email: "${email}"`);
            // Diagnostic: Check if any users exist at all
            const userCount = await prisma.user.count();
            console.error(`DEBUG: Total user count in DB: ${userCount}`);
            return null;
          }

          console.error("DEBUG: User found, checking password...");
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

          if (!isPasswordValid) {
            console.error("DEBUG: Password mismatch for user:", email);
            return null;
          }

          console.error("DEBUG: Authentication successful for:", email);
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          };
        } catch (dbError: any) {
          console.error("DEBUG: Database error during authorize:", dbError.message);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
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
