import { notFound } from 'next/navigation';
import { prisma } from '../../../lib/prisma';
import DashDetail from '../../../components/DashDetail/DashDetail';
import ProfileForm from '../../../components/ProfileForm/ProfileForm';
import DangerForm from '../../../components/DangerForm/DangerForm';
import styles from '../page.module.scss';

export const metadata = {
  title: 'User Profile and History | Biz Nest',
  description: 'View detailed user profile and account history.'
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function UserDetailPage({ params }: { params: any }) {
  const resolvedParams = await params;
  const userId = parseInt(resolvedParams.id);
  
  if (isNaN(userId)) {
    notFound();
  }

  try {
    // Fetch user details server-side
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        screenName: true,
        email: true,
        image: true,
        emailVerified: true,
        profile: {
          select: {
            industry: true
          }
        },
        accounts: {
          select: {
            provider: true,
            providerAccountId: true,
            type: true,
            expires_at: true,
          }
        },
        sessions: {
          select: {
            sessionToken: true,
            expires: true,
          },
          orderBy: {
            expires: 'desc'
          },
          take: 5
        }
      }
    });

    if (!user) {
      notFound();
    }

    // Transform user data to include industry from profile
    const userWithIndustry = {
      ...user,
      industry: user.profile?.industry || null
    };

    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>User Profile and History</h1>
        </div>
        <div className={styles.content}>
          <DashDetail heading="User Details" user={userWithIndustry} />
          <div className={styles.formsContainer}>
            <ProfileForm />
            <DangerForm userId={user.id} />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error fetching user details:', error);
    notFound();
  }
} 