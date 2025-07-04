"use client";

import styles from './NavBar.module.scss';
import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';

import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../lib/store';
import { popPage, toggleMenu, closeMenu, updateThemePreference } from '../../lib/slices/appSlice';
import UserInfoOrLogo from './UserInfoOrLogo';

type AppState = { app: { menuOpen: boolean } };

export default function NavBar() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const pageHistory = useSelector((state: RootState) => state.app.pageHistory);
  const menuOpen = useSelector((state: RootState) => state.app.menuOpen);
  const theme = useSelector((state: RootState) => state.app.theme);
  const dark = theme === 'dark';



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

  const handleThemeToggle = () => {
    dispatch(updateThemePreference(dark ? 'light' : 'dark'));
  };

  const handleBodyClick = () => {
    console.log('Body clicked. menuOpen before:', menuOpen);
    dispatch(closeMenu());
    setTimeout(() => {
      const win = window as typeof window & { store?: { getState?: () => unknown } };
      const state = win.store?.getState?.();
      if (state && typeof state === 'object' && state !== null && 'app' in state && typeof (state as AppState).app === 'object' && (state as AppState).app !== null && 'menuOpen' in (state as AppState).app) {
        console.log('menuOpen after:', (state as AppState).app.menuOpen);
      }
    }, 100);
  };

  console.log('NavBar render, menuOpen:', menuOpen);

  return (
    <div onClick={handleBodyClick} style={{ width: '100%' }}>
      <nav className={styles.navbar} onClick={e => e.stopPropagation()}>
        <div className={styles.container} onClick={e => e.stopPropagation()}>
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
                <Link href="/api-docs" className={styles.navLink}>
                  API Docs
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
              <span className={styles.themeLabel}>{dark ? 'Dark' : 'Light'}</span>
              <button
                className={styles.toggleSwitch + (dark ? ' ' + styles.toggled : '')}
                aria-label="Toggle dark mode"
                onClick={(e) => { e.preventDefault(); handleThemeToggle(); }}
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
            onClick={e => { handleMenuToggle(e); e.stopPropagation(); }} 
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
          <div className={`${styles.mobileMenu} ${menuOpen ? styles.open : ''}`} onClick={e => e.stopPropagation()}>
            {user ? (
              <>
                <Link href="/admin" className={styles.mobileLink} onClick={handleMenuClose}>
                  Admin
                </Link>
                <Link href="/api-docs" className={styles.mobileLink} onClick={handleMenuClose}>
                  API Docs
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
            
            {/* Mobile Theme Toggle */}
            <div className={styles.mobileThemeToggle}>
              <span className={styles.mobileThemeLabel}>{dark ? 'Dark Mode' : 'Light Mode'}</span>
              <button
                className={styles.mobileToggleSwitch + (dark ? ' ' + styles.mobileToggled : '')}
                aria-label="Toggle dark mode"
                onClick={(e) => { 
                  e.preventDefault(); 
                  e.stopPropagation();
                  handleThemeToggle();
                }}
              >
                <span className={styles.mobileToggleSlider}></span>
              </button>
            </div>
            
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
    </div>
  );
} 