"use client";

import styles from './NavBar.module.scss';
import Image from 'next/image';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function NavBar() {
  const { data: session, status } = useSession();
  const user = session?.user;

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Image src="/biznest-logo.svg" alt="Biz Nest Logo" width={50} height={50} className={styles.logoImage} />
          <h2>Biz Nest</h2>
        </div>
        <div className={styles.actions}>
          {status === 'loading' ? null : user ? (
            <div className={styles.userInfo}>
              {user.image && (
                <Image src={user.image} alt={user.name || 'User'} width={32} height={32} className={styles.avatar} />
              )}
              <span className={styles.userName}>{user.name || user.email}</span>
              <button className={styles.loginBtn} onClick={() => signOut()}>Sign out</button>
            </div>
          ) : (
            <button className={styles.loginBtn} onClick={() => signIn('google')}>Login</button>
          )}
        </div>
      </div>
    </nav>
  );
} 