import styles from './page.module.scss';
import Hero from './components/Hero/Hero';
import NavBar from './components/NavBar/NavBar';

export const metadata = {
  title: 'Biz Nest | Build Your Business Nest Egg',
  description: 'Empower your entrepreneurial journey with Biz Nest. Create, manage, and grow your business apps to build your financial future and business nest egg.'
};

export default function Home() {
  return (
    <div className={styles["tampa-bg"]}>
      <NavBar />
      <main className="main">
        <Hero />
      </main>
    </div>
  );
} 