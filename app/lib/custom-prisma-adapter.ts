import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from './prisma';

interface CreateUserData {
  name?: string;
  email?: string;
  image?: string;
  emailVerified?: Date;
}

export function CustomPrismaAdapter() {
  const adapter = PrismaAdapter(prisma);
  
  return {
    ...adapter,
    createUser: async (data: CreateUserData) => {
      // Split the name if it exists
      let firstName = null;
      let lastName = null;
      
      if (data.name) {
        const nameParts = data.name.split(' ');
        firstName = nameParts[0] || null;
        lastName = nameParts.slice(1).join(' ') || null;
      }
      
      // Create user with firstName and lastName instead of name
      const user = await prisma.user.create({
        data: {
          email: data.email,
          firstName: firstName,
          lastName: lastName,
          image: data.image,
          emailVerified: data.emailVerified,
        },
      });
      
      console.log('CustomPrismaAdapter: User created with split name:', {
        firstName,
        lastName,
        email: data.email
      });
      
      return user;
    },
  };
} 