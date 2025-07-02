"use client";
import DashboardWithPagination from '../../src/components/Dashboard/DashboardWithPagination';
import DashDetail from '../../src/components/DashDetail/DashDetail';
import styles from './page.module.scss';
import withAuth from '../../src/components/withAuth';

function AdminPage() {
  return (
    <div className={styles['admin-layout']}>
      <DashboardWithPagination initialUsers={[]} initialTotalPages={1} />
      <DashDetail heading="User Details" />
    </div>
  );
}

export default withAuth(AdminPage, 'admin'); 