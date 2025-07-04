import DashDetail from '../../components/DashDetail/DashDetail';
import ProfileForm from '../../components/ProfileForm/ProfileForm';
import DangerForm from '../../components/DangerForm/DangerForm';
import styles from './UserDetailPage.module.scss';
import UserDetailReduxSync from '../../../app/admin/user-detail/[id]/UserDetailReduxSync';
import type { User } from '../../interfaces/app';
import { prisma } from '../../lib/prisma';
import { notFound } from 'next/navigation';

export default async function UserDetailPage({ id }: { id: string }) {
  const userId = parseInt(id);
  if (isNaN(userId)) return notFound();

  const userData = await prisma.user.findUnique({
    where: { id: userId },
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
          userId: true,
          role: true,
        },
      },
    },
  });

  if (!userData) return notFound();

  const user: User = {
    ...userData,
    emailVerified: userData.emailVerified ? String(userData.emailVerified) : null,
    firstName: userData.profile?.firstName || null,
    lastName: userData.profile?.lastName || null,
    screenName: userData.profile?.screenName || null,
    industry: userData.profile?.industry || null,
    profile: userData.profile || null,
  };

  return (
    <div className={styles.container}>
      <UserDetailReduxSync user={user} />
      <div className={styles.header}>
        <h1>Update or Delete User</h1>
      </div>
      <div className={styles.content}>
        <DashDetail heading="User Details" />
        <ProfileForm />
        <DangerForm userId={user.id} />
      </div>
    </div>
  );
} 