import DashboardWithPagination from '../components/Dashboard/DashboardWithPagination';
import DashDetail from '../components/DashDetail/DashDetail';
import styles from './page.module.scss';
import { prisma } from '../lib/prisma';

interface Profile {
  id: number;
  firstName?: string | null;
  lastName?: string | null;
  screenName?: string | null;
  industry?: string | null;
  userId: number;
}

interface User {
  id: number;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  emailVerified?: string | null;
  profile?: Profile | null;
  // Include convenience fields at the top level
  firstName?: string | null;
  lastName?: string | null;
  screenName?: string | null;
  industry?: string | null;
}

// Type for the Prisma query result
type UserWithProfile = {
  id: number;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  emailVerified?: Date | null;
  profile?: {
    id: number;
    firstName?: string | null;
    lastName?: string | null;
    screenName?: string | null;
    industry?: string | null;
    userId: number;
  } | null;
};

export default async function AdminPage() {
  let users: User[] = [];
  let totalPages = 1;
  
  try {
    // Get total count first
    const totalUsers = await prisma.user.count();
    totalPages = Math.ceil(totalUsers / 25);

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
      take: 25, // Limit to first 25 users for performance
    });

    // Transform users to include profile fields at the top level
    users = usersWithProfiles.map((user: UserWithProfile) => ({
      ...user,
      emailVerified: user.emailVerified ? user.emailVerified.toISOString() : null,
      firstName: user.profile?.firstName || null,
      lastName: user.profile?.lastName || null,
      screenName: user.profile?.screenName || null,
      industry: user.profile?.industry || null
    }));
  } catch (error) {
    console.error('Error fetching users:', error);
  }

  return (
    <div className={styles['admin-layout']}>
      <DashDetail heading="User Details" />
      <DashboardWithPagination initialUsers={users} initialTotalPages={totalPages} />
    </div>
  );
} 