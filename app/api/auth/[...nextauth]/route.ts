import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { CustomPrismaAdapter } from '../../../lib/custom-prisma-adapter';

const handler = NextAuth({
  adapter: CustomPrismaAdapter(),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'database',
  },
  callbacks: {
    async session({ session, user }) {
      console.log('NextAuth: Session callback - User:', user);
      if (session.user) {
        (session.user as { id?: string | number } ).id = user.id;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      console.log('NextAuth: New user created:', user);
    },
    async signIn({ user, account, isNewUser }) {
      console.log('NextAuth: Sign in event - User:', user);
      console.log('NextAuth: Sign in event - Is new user:', isNewUser);
      console.log('NextAuth: Sign in event - Account:', account);
      
      if (isNewUser && account?.provider === 'google') {
        console.log('NextAuth: New Google user signed up:', user);
      }
    },
  },
});

export { handler as GET, handler as POST };
