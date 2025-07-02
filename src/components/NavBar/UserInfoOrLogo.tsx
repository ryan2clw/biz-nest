import styles from './NavBar.module.scss';
import Image from 'next/image';
import Link from 'next/link';

interface UserInfoOrLogoProps {
  isLoggedIn: boolean;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function UserInfoOrLogo({ isLoggedIn, user }: UserInfoOrLogoProps) {
  if (isLoggedIn && user) {
    return (
      <div className={styles.userInfo}>
        {user.image && (
          <Image src={user.image} alt={user.name || 'User'} width={32} height={32} className={styles.avatar} />
        )}
        <span className={styles.userName}>{user.name || user.email}</span>
      </div>
    );
  }
  return (
    <div className={styles.logo}>
      <Link href="/">
        <Image src="/biznest-logo.svg" alt="Biz Nest Logo" width={50} height={50} className={styles.logoImage} />
        <h2>Biz Nest</h2>
      </Link>
    </div>
  );
} 