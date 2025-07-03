import styles from './HomePage.module.scss';
import Hero from '../../components/Hero/Hero';

export default function HomePage() {
  try {
    return (
      <div className={styles["tampa-bg"]}>
        <main className="main">
          <Hero />
        </main>
      </div>
    );
  } catch (error) {
    console.error('Error in HomePage:', error);
    throw error;
  }
} 