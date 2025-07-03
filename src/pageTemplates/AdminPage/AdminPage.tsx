"use client";
import DashboardWithPagination from '../../components/Dashboard/DashboardWithPagination';
import DashDetail from '../../components/DashDetail/DashDetail';
import styles from './AdminPage.module.scss';

export default function AdminPage() {
  return (
    <div className={styles['admin-layout']}>
      <DashboardWithPagination initialUsers={[]} initialTotalPages={1} />
      <DashDetail heading="User Details" />
    </div>
  );
} 