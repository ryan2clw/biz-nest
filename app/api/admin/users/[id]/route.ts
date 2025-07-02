/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
import { prisma } from '../../../../../src/lib/prisma';
import type { Prisma } from '@prisma/client';

export async function DELETE(
  request: NextRequest,
  { params }: { params: any }
) {
  const resolvedParams = await params;
  try {
    // Check authentication - using a simple session check
    // const session = await getServerSession();
    // if (!session?.user?.email) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const userId = parseInt(resolvedParams.id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has a profile
    const existingProfile = await prisma.profile.findUnique({
      where: { userId: userId }
    });

    // Delete user and related data in a transaction
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Delete related sessions
      await tx.session.deleteMany({
        where: { userId: userId }
      });

      // Delete related accounts
      await tx.account.deleteMany({
        where: { userId: userId }
      });

      // Delete related profile (if exists)
      if (existingProfile) {
        await tx.profile.delete({
          where: { userId: userId }
        });
      }

      // Delete the user
      const deletedUser = await tx.user.delete({
        where: { id: userId }
      });

      return { deletedUser, existingProfile };
    });

    console.log(`User ${userId} and related data deleted successfully`);

    return NextResponse.json({ 
      message: 'User and related data deleted successfully',
      deletedUser: {
        id: result.deletedUser.id,
        email: result.deletedUser.email,
        firstName: result.existingProfile?.firstName || null,
        lastName: result.existingProfile?.lastName || null
      }
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // const session = await getServerSession();

    // Temporarily comment out authentication for testing
    // if (!session?.user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        emailVerified: true,
        profile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            screenName: true,
            industry: true,
            userId: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Transform to include profile fields at the top level for convenience
    const transformedUser = {
      ...user,
      firstName: user.profile?.firstName || null,
      lastName: user.profile?.lastName || null,
      screenName: user.profile?.screenName || null,
      industry: user.profile?.industry || null
    };

    return NextResponse.json(transformedUser);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 