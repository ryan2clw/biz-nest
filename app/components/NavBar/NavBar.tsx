"use client";

import styles from './NavBar.module.scss';
import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../lib/store';
import { popPage, toggleMenu, closeMenu } from '../../lib/slices/adminSlice';
import UserInfoOrLogo from './UserInfoOrLogo';

export default function NavBar() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const [dark, setDark] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const pageHistory = useSelector((state: RootState) => state.admin.pageHistory);
  const menuOpen = useSelector((state: RootState) => state.admin.menuOpen);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [dark]);

  const handleBack = () => {
    if (pageHistory.length > 0) {
      dispatch(popPage());
      const lastUrl = pageHistory[pageHistory.length - 1];
      if (lastUrl) {
        router.push(lastUrl);
      }
    }
  };

  const handleMenuToggle = (e: React.MouseEvent) => {
    console.log('Hamburger clicked');
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    dispatch(toggleMenu());
  };

  const handleMenuToggleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleMenuClose = () => {
    dispatch(closeMenu());
  };

  const handleMenuLinkClick = (e: React.MouseEvent, action?: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    handleMenuClose();
    if (action) {
      action();
    }
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        {pageHistory.length > 0 && (
          <button className={styles.backButton} aria-label="Go back" onClick={handleBack}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
        <UserInfoOrLogo
          isLoggedIn={!!user}
          user={user}
        />
        
        <div className={styles.navigation}>
          {user ? (
            <>
              <Link href="/admin" className={styles.navLink}>
                Admin
              </Link>
              <Link href="/" className={styles.navLink}>
                Home
              </Link>
            </>
          ) : (
            <Link href="/signup" className={styles.navLink}>
              Sign Up
            </Link>
          )}
        </div>
        
        <div className={styles.actions}>
          <div className={styles.themeToggle}>
            <span className={styles.themeLabel}>{dark ? 'Light' : 'Dark'}</span>
            <button
              className={styles.toggleSwitch + (dark ? ' ' + styles.toggled : '')}
              aria-label="Toggle dark mode"
              onClick={(e) => { e.preventDefault(); setDark((d) => !d); }}
            >
              <span className={styles.toggleSlider}></span>
            </button>
          </div>
          {status === 'loading' ? null : user ? (
            <button className={styles.loginBtn} onClick={() => signOut()}>Sign out</button>
          ) : (
            <button className={styles.loginBtn} onClick={() => signIn('google')}>Login</button>
          )}
        </div>

        {/* Hamburger Menu Button */}
        <div 
          className={styles.hamburger} 
          onClick={handleMenuToggle} 
          onMouseDown={handleMenuToggleMouseDown}
          role="button"
          tabIndex={0}
          aria-label="Toggle menu"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              dispatch(toggleMenu());
            }
          }}
        >
          <span className={`${styles.hamburgerLine} ${menuOpen ? styles.open : ''}`}></span>
          <span className={`${styles.hamburgerLine} ${menuOpen ? styles.open : ''}`}></span>
          <span className={`${styles.hamburgerLine} ${menuOpen ? styles.open : ''}`}></span>
        </div>

        {/* Mobile Menu Dropdown */}
        <div className={`${styles.mobileMenu} ${menuOpen ? styles.open : ''}`}>
          {user ? (
            <>
              <Link href="/admin" className={styles.mobileLink} onClick={handleMenuClose}>
                Admin
              </Link>
              <Link href="/" className={styles.mobileLink} onClick={handleMenuClose}>
                Home
              </Link>
            </>
          ) : (
            <Link href="/signup" className={styles.mobileLink} onClick={handleMenuClose}>
              Sign Up
            </Link>
          )}
          {status === 'loading' ? null : user ? (
            <button className={styles.mobileLink} onClick={(e) => { console.log('Mobile Sign Out clicked'); handleMenuLinkClick(e, () => signOut()); }}>
              Sign Out
            </button>
          ) : (
            <button className={styles.mobileLink} onClick={(e) => { console.log('Mobile Login clicked'); handleMenuLinkClick(e, () => signIn('google')); }}>
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
} 