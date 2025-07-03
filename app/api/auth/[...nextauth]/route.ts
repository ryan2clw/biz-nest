import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { CustomPrismaAdapter } from '../../../../src/lib/custom-prisma-adapter';
import { prisma } from '../../../../src/lib/prisma';
import { authOptions } from '../../../../src/lib/authOptions';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
