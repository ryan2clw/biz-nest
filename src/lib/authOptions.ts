import GoogleProvider from 'next-auth/providers/google';
import { CustomPrismaAdapter } from './custom-prisma-adapter';
import { prisma } from './prisma';
import { Session, User, Account } from 'next-auth';

export const authOptions = {
  adapter: CustomPrismaAdapter(),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'database' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  callbacks: {
    async session({ session, user }: { session: Session; user: User }) {
      console.log('NextAuth: Session callback - User:', user);
      if (session.user) {
        (session.user as { id?: string | number; profile?: { role: string, themePreference?: string } }).id = user.id;
        // Fetch profile, role, and themePreference
        const profile = await prisma.profile.findUnique({
          where: { userId: Number(user.id) },
          select: { role: true, themePreference: true },
        });
        (session.user as { id?: string | number; profile?: { role: string, themePreference?: string } }).profile = {
          role: profile?.role || 'user',
          themePreference: profile?.themePreference || 'dark',
        };
      }
      return session;
    },
  },
  events: {
    async createUser(message: { user: User }) {
      const { user } = message;
      console.log('NextAuth: New user created:', user);
    },
    async signIn(message: { user: User; account: Account | null; profile?: unknown; isNewUser?: boolean }) {
      const { user, account, isNewUser } = message;
      console.log('NextAuth: Sign in event - User:', user);
      console.log('NextAuth: Sign in event - Is new user:', isNewUser);
      console.log('NextAuth: Sign in event - Account:', account);
      if (isNewUser && account?.provider === 'google') {
        console.log('NextAuth: New Google user signed up:', user);
      }
    },
  },
}; 