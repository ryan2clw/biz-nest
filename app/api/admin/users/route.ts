import { prisma } from '@/app/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Fetch all users from the database
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        screenName: true,
        email: true,
        image: true,
        emailVerified: true,
      },
      orderBy: {
        id: 'desc',
      },
    });

    return NextResponse.json({ 
      users,
      success: true 
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch users',
        success: false 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 