import { NextRequest, NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
import { prisma } from '../../../lib/prisma';

export async function PUT(request: NextRequest) {
  try {
    // const session = await getServerSession();
    
    // Temporarily comment out authentication for testing
    // if (!session?.user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { userId, firstName, lastName, screenName, industry } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Update or create profile
    const profile = await prisma.profile.upsert({
      where: {
        userId: parseInt(userId),
      },
      update: {
        firstName: firstName || null,
        lastName: lastName || null,
        screenName: screenName || null,
        industry: industry || null,
      },
      create: {
        firstName: firstName || null,
        lastName: lastName || null,
        screenName: screenName || null,
        industry: industry || null,
        userId: parseInt(userId),
      },
    });

    console.log('Profile updated successfully:', profile);

    return NextResponse.json({ 
      message: 'Profile updated successfully',
      profile 
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 