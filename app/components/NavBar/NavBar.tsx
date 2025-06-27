"use client";

import styles from './NavBar.module.scss';
import Image from 'next/image';
import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function NavBar() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const [dark, setDark] = useState(false);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [dark]);

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Link href="/admin">
            <Image src="/biznest-logo.svg" alt="Biz Nest Logo" width={50} height={50} className={styles.logoImage} />
            <h2>Biz Nest</h2>
          </Link>
        </div>
        
        <div className={styles.navigation}>
          <Link href="/signup" className={styles.navLink}>
            Sign Up
          </Link>
          <Link href="/" className={styles.navLink}>
            Home
          </Link>
        </div>
        
        <div className={styles.actions}>
          <div className={styles.themeToggle}>
            <span className={styles.themeLabel}>{dark ? 'Light' : 'Dark'}</span>
            <button
              className={styles.toggleSwitch + (dark ? ' ' + styles.toggled : '')}
              aria-label="Toggle dark mode"
              onClick={() => setDark((d) => !d)}
            >
              <span className={styles.toggleSlider}></span>
            </button>
          </div>
          {status === 'loading' ? null : user ? (
            <div className={styles.userInfo}>
              <Link href="/admin" className={styles.adminLink}>
                Admin
              </Link>
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