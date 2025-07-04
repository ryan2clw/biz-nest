import DashboardWithPagination from '../../components/Dashboard/DashboardWithPagination';
import DashDetail from '../../components/DashDetail/DashDetail';
import styles from './AdminPage.module.scss';

interface User {
  id: number;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  emailVerified?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  screenName?: string | null;
  industry?: string | null;
  profile?: {
    id: number;
    firstName?: string | null;
    lastName?: string | null;
    screenName?: string | null;
    industry?: string | null;
    userId: number;
    role: 'admin' | 'customer' | 'user';
  } | null;
}

interface AdminPageProps {
  initialUsers: User[];
  initialTotalPages: number;
}

export default function AdminPage({ initialUsers, initialTotalPages }: AdminPageProps) {
  return (
    <div className={styles['admin-layout']}>
      <DashboardWithPagination initialUsers={initialUsers} initialTotalPages={initialTotalPages} />
      <DashDetail heading="User Details" />
    </div>
  );
} 