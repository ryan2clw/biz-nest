/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '../../../../lib/prisma';
import type { Prisma } from '@prisma/client';

export async function DELETE(
  request: NextRequest,
  { params }: { params: any }
) {
  const resolvedParams = await params;
  try {
    // Check authentication - using a simple session check
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

      return deletedUser;
    });

    console.log(`User ${userId} and related data deleted successfully`);

    return NextResponse.json({ 
      message: 'User and related data deleted successfully',
      deletedUser: {
        id: result.id,
        email: result.email,
        firstName: result.firstName,
        lastName: result.lastName
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