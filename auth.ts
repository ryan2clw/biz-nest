import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { CustomPrismaAdapter } from './src/db/custom-prisma-adapter';
import { prisma } from './src/db/prisma';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: CustomPrismaAdapter(),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        (session.user as { id?: string; profile?: { role: string; themePreference?: string } }).id = user.id;
        const profile = await prisma.profile.findUnique({
          where: { userId: Number(user.id) },
          select: { role: true, themePreference: true },
        });
        (session.user as { id?: string; profile?: { role: string; themePreference?: string } }).profile = {
          role: profile?.role || 'user',
          themePreference: profile?.themePreference || 'dark',
        };
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      if (user.email === 'ryan.dines@gmail.com') {
        await prisma.profile.update({
          where: { userId: Number(user.id) },
          data: { role: 'admin' },
        });
      }
    },
  },
});
