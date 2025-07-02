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
      // Create user with standard NextAuth fields
      const user = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          image: data.image,
          emailVerified: data.emailVerified,
        },
      });
      
      // Create profile with split name if name exists
      if (data.name) {
        const nameParts = data.name.split(' ');
        const firstName = nameParts[0] || null;
        const lastName = nameParts.slice(1).join(' ') || null;
        
        await prisma.profile.create({
          data: {
            firstName: firstName,
            lastName: lastName,
            userId: user.id,
          },
        });
        
        console.log('CustomPrismaAdapter: User and profile created with split name:', {
          firstName,
          lastName,
          email: data.email
        });
      }
      
      return user;
    },
  };
} 