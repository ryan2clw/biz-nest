import Dashboard from '../components/Dashboard/Dashboard';
import DashDetail from '../components/DashDetail/DashDetail';
import styles from './page.module.scss';


export const metadata = {
  title: 'Admin Dashboard | Biz Nest',
  description: 'Admin dashboard for managing Biz Nest business applications.'
};

export default function AdminPage() {
  return (
    <div className={styles['admin-layout']}>
      <Dashboard />
      <DashDetail heading="User Details" />
    </div>
  );
} 