import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '../../../lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { screenName } = await request.json();

    if (!screenName) {
      return NextResponse.json({ error: 'Screen name is required' }, { status: 400 });
    }

    // Update the user's screen name
    await prisma.user.update({
      where: { email: session.user.email },
      data: { screenName }
    });

    return NextResponse.json({ message: 'Screen name updated successfully' });
  } catch (error) {
    console.error('Error updating screen name:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 