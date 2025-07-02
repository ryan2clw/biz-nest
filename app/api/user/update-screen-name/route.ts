import { NextRequest, NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
import { prisma } from '../../../../src/lib/prisma';

export async function PUT(request: NextRequest) {
  try {
    // const session = await getServerSession();
    
    // Temporarily comment out authentication for testing
    // if (!session?.user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { userId, screenName } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Update or create profile with screen name
    const profile = await prisma.profile.upsert({
      where: {
        userId: parseInt(userId),
      },
      update: {
        screenName: screenName || null,
      },
      create: {
        screenName: screenName || null,
        userId: parseInt(userId),
      },
    });

    console.log('Screen name updated successfully:', profile);

    return NextResponse.json({ 
      message: 'Screen name updated successfully',
      profile 
    });
  } catch (error) {
    console.error('Error updating screen name:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 