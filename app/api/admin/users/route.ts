import { prisma } from '@/app/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    const skip = (page - 1) * limit;

    // Fetch users with pagination and sorting
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        screenName: true,
        email: true,
        image: true,
        profile: {
          select: {
            industry: true
          }
        }
      },
      orderBy: {
        lastName: 'asc',
      },
      skip,
      take: limit,
    });

    // Transform users to include industry from profile
    const usersWithIndustry = users.map(user => ({
      ...user,
      industry: user.profile?.industry || null
    }));

    // Get total count for pagination
    const totalUsers = await prisma.user.count();
    const totalPages = Math.ceil(totalUsers / limit);

    return NextResponse.json({ 
      users: usersWithIndustry,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      success: true 
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch users',
        success: false 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 