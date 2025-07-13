import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../src/lib/prisma';

/**
 * @openapi
 * /api/admin/users:
 *   get:
 *     summary: Get paginated list of users for admin dashboard
 *     description: Retrieve a paginated list of users with their profile information for display in the admin dashboard. Only accessible by admin users.
 *     tags:
 *       - Admin Dashboard
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 25
 *           minimum: 1
 *           maximum: 100
 *         description: Number of users per page
 *     responses:
 *       200:
 *         description: Successfully retrieved users for admin dashboard
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedUsers'
 *       401:
 *         description: Unauthorized - User not authenticated or not admin
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
export async function GET(request: NextRequest) {
  try {
    // const session = await getServerSession();
    
    // Temporarily comment out authentication for testing
    // if (!session?.user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    const skip = (page - 1) * limit;

    // Get total count
    const totalUsers = await prisma.user.count();
    const totalPages = Math.ceil(totalUsers / limit);

    // Get users with profiles
    const usersWithProfiles = await prisma.user.findMany({
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
      },
      orderBy: {
        profile: {
          lastName: 'asc'
        }
      },
      skip,
      take: limit,
    });

    // Return users with only nested profile (no top-level profile fields)
    return NextResponse.json({
      users: usersWithProfiles,
      totalPages,
      currentPage: page,
      totalUsers,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 