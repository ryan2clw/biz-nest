import styles from './page.module.scss';
import Hero from './components/Hero/Hero';

export const metadata = {
  title: 'Biz Nest | Build Your Business Nest Egg',
  description: 'Empower your entrepreneurial journey with Biz Nest. Create, manage, and grow your business apps to build your financial future and business nest egg.'
};

export default function Home() {
  return (
    <div className={styles["tampa-bg"]}>
      <main className="main">
        <Hero />
      </main>
    </div>
  );
} 