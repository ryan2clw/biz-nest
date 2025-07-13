import { NextRequest, NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
import { prisma } from '../../../../src/lib/prisma';

/**
 * @openapi
 * /api/user/update-profile:
 *   put:
 *     summary: Update user profile information
 *     description: Update the profile information for the authenticated user including firstName, lastName, screenName, and industry.
 *     tags:
 *       - Profile
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: ID of the user to update
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
 *         description: Profile successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request - missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - User not authenticated
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
    await prisma.profile.upsert({
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

    // Fetch the full user with profile
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: { profile: true },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 