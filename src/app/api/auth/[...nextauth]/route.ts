import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

console.log("DEBUG: [...nextauth] route module initialized");

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
