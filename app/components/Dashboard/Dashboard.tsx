import Image from 'next/image';
import styles from './Dashboard.module.scss';
import Spinner from '../Spinner/Spinner';
import { prisma } from '../../lib/prisma';

interface User {
  id: number;
  firstName?: string | null;
  lastName?: string | null;
  screenName?: string | null;
  email?: string | null;
  image?: string | null;
  emailVerified?: Date | null;
}

export default async function Dashboard() {
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

  const getUserDisplayName = (user: User) => {
    if (user.screenName) return user.screenName;
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
    if (user.firstName) return user.firstName;
    if (user.lastName) return user.lastName;
    return user.email || 'Unknown User';
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h2 className={styles.title}>User Management</h2>
        <p className={styles.subtitle}>Total Users: {users.length}</p>
      </div>
      
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Name</th>
              <th>Email Verified</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td className={styles.userCell}>
                  <div className={styles.userInfo}>
                    {user.image && (
                      <Image 
                        src={user.image} 
                        alt={getUserDisplayName(user)} 
                        width={40}
                        height={40}
                        className={styles.avatar}
                      />
                    )}
                    <span className={styles.userName}>{getUserDisplayName(user)}</span>
                  </div>
                </td>
                <td>{user.email || 'No email'}</td>
                <td>
                  {user.firstName && user.lastName 
                    ? `${user.firstName} ${user.lastName}`
                    : user.firstName || user.lastName || 'Not provided'
                  }
                </td>
                <td>{user.emailVerified ? 'Yes' : 'No'}</td>
                <td>
                  <button className={styles.actionButton}>
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 