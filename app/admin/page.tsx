import Dashboard from '../components/Dashboard/Dashboard';
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
  emailVerified?: Date | null;
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
        emailVerified: true,
      },
      take: 50, // Limit to first 50 users for performance
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
      <Dashboard users={users} />
      <DashDetail heading="User Details" />
    </div>
  );
} 