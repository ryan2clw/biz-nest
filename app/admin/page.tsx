import DashboardWithPagination from '../components/Dashboard/DashboardWithPagination';
import DashDetail from '../components/DashDetail/DashDetail';
import styles from './page.module.scss';
import { prisma } from '../lib/prisma';

interface User {
  id: number;
  firstName?: string | null;
  lastName?: string | null;
  screenName?: string | null;
  email?: string | null;
  image?: string | null;
  industry?: string | null;
}

export default async function AdminPage() {
  let users: User[] = [];
  
  try {
    const usersWithProfiles = await prisma.user.findMany({
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
      take: 25, // Limit to first 25 users for performance
    });

    // Transform users to include industry from profile
    users = usersWithProfiles.map(user => ({
      ...user,
      industry: user.profile?.industry || null
    }));
  } catch (error) {
    console.error('Error fetching users:', error);
  }

  return (
    <div className={styles['admin-layout']}>
      <DashboardWithPagination initialUsers={users} />
      <DashDetail heading="User Details" />
    </div>
  );
} 