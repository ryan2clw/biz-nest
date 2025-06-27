import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/app/lib/prisma';

export async function POST(request: NextRequest) {
  console.log('update-industry API: Request received');
  
  try {
    // Get the current session
    const session = await getServerSession();
    console.log('update-industry API: Session:', session);
    
    if (!session?.user?.email) {
      console.log('update-industry API: No session or email found');
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('update-industry API: Request body:', body);
    
    const { industry } = body;

    if (!industry) {
      console.log('update-industry API: No industry provided');
      return NextResponse.json(
        { error: 'Industry is required' },
        { status: 400 }
      );
    }

    console.log('update-industry API: Updating user with email:', session.user.email);
    console.log('update-industry API: Industry to set:', industry);

    // Update the user's industry
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        profile: {
          update: { industry }
        }
      },
      include: { profile: true }
    });

    console.log('update-industry API: User updated successfully:', updatedUser);

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error('update-industry API: Error updating user industry:', error);
    return NextResponse.json(
      { error: 'Failed to update industry' },
      { status: 500 }
    );
  }
} 