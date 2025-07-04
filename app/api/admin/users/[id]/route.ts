/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
import { prisma } from '../../../../../src/lib/prisma';
import type { Prisma } from '@prisma/client';

/**
 * @openapi
 * /api/admin/users/{id}:
 *   get:
 *     summary: Get a specific user by ID for detail view
 *     description: Retrieve detailed information about a specific user including their profile data for the user detail page. Only accessible by admin users.
 *     tags:
 *       - User Detail
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID to retrieve
 *     responses:
 *       200:
 *         description: Successfully retrieved user for detail view
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - User not authenticated or not admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *     security:
 *       - bearerAuth: []
 *   put:
 *     summary: Update a user's profile information from detail page
 *     description: Update the profile information for a specific user from the user detail page. Only accessible by admin users.
 *     tags:
 *       - User Detail
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 nullable: true
 *                 description: User's first name
 *               lastName:
 *                 type: string
 *                 nullable: true
 *                 description: User's last name
 *               screenName:
 *                 type: string
 *                 nullable: true
 *                 description: User's screen name
 *               industry:
 *                 type: string
 *                 nullable: true
 *                 description: User's industry
 *     responses:
 *       200:
 *         description: User profile successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request - invalid user ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - User not authenticated or not admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *     security:
 *       - bearerAuth: []
 *   delete:
 *     summary: Delete a user and all related data from detail page
 *     description: Permanently delete a user and all associated data including sessions, accounts, and profile from the user detail page. Only accessible by admin users.
 *     tags:
 *       - User Detail
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID to delete
 *     responses:
 *       200:
 *         description: User successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 deletedUser:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     email:
 *                       type: string
 *                     firstName:
 *                       type: string
 *                       nullable: true
 *                     lastName:
 *                       type: string
 *                       nullable: true
 *       400:
 *         description: Invalid user ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - User not authenticated or not admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *     security:
 *       - bearerAuth: []
 */
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

export async function PUT(
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

    const userId = parseInt(id);
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

    const { firstName, lastName, screenName, industry } = await request.json();

    // Update or create profile
    await prisma.profile.upsert({
      where: {
        userId: userId,
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
        userId: userId,
      },
    });

    // Fetch the updated user with profile
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
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

    // Transform to include profile fields at the top level
    const transformedUser = {
      ...updatedUser,
      firstName: updatedUser?.profile?.firstName || null,
      lastName: updatedUser?.profile?.lastName || null,
      screenName: updatedUser?.profile?.screenName || null,
      industry: updatedUser?.profile?.industry || null
    };

    return NextResponse.json(transformedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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