import DashboardWithPagination from '../components/Dashboard/DashboardWithPagination';
import DashDetail from '../components/DashDetail/DashDetail';
import Spinner from '../components/Spinner/Spinner';
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

export const metadata = {
  title: 'Admin Dashboard | Biz Nest',
  description: 'Admin dashboard for managing Biz Nest business applications.'
};

export default async function AdminPage() {
  let users: User[] = [];
  let hasUsers = false;
  
  try {
    users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        screenName: true,
        email: true,
        image: true,
        industry: true,
      },
      orderBy: {
        lastName: 'asc',
      },
      take: 25, // Limit to first 25 users for performance
    });
    hasUsers = users.length > 0;
  } catch (error) {
    console.error('Error fetching users:', error);
    hasUsers = false;
  }

  if (!hasUsers) {
    return <Spinner />;
  }

  return (
    <div className={styles['admin-layout']}>
      <DashboardWithPagination initialUsers={users} />
      <DashDetail heading="User Details" />
    </div>
  );
} 