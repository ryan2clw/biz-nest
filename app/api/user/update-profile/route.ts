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

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Update or create profile
    // const profile = await prisma.profile.upsert({
    //   where: {
    //     userId: parseInt(userId),
    //   },
    //   update: {
    //     firstName: firstName || null,
    //     lastName: lastName || null,
    //     screenName: screenName || null,
    //     industry: industry || null,
    //   },
    //   create: {
    //     firstName: firstName || null,
    //     lastName: lastName || null,
    //     screenName: screenName || null,
    //     industry: industry || null,
    //     userId: parseInt(userId),
    //   },
    // });

    // Fetch the full user with profile
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: { profile: true },
    });

    const userWithProfileFields = {
      ...user,
      firstName: user?.profile?.firstName || null,
      lastName: user?.profile?.lastName || null,
      screenName: user?.profile?.screenName || null,
      industry: user?.profile?.industry || null,
    };

    return NextResponse.json(userWithProfileFields);
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 