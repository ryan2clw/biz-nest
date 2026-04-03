import styles from './HomePage.module.scss';
import Hero from '../../components/Hero/Hero';

interface HomePageProps {
  carouselItems?: string[];
  ctaText?: string;
  ctaUrl?: string;
  heroImageUrl?: string;
}

export default function HomePage({ carouselItems, ctaText, ctaUrl, heroImageUrl }: HomePageProps) {
  return (
    <div className={styles["tampa-bg"]}>
      <main className={styles.main}>
        <Hero
          carouselItems={carouselItems}
          ctaText={ctaText}
          ctaUrl={ctaUrl}
          heroImageUrl={heroImageUrl}
        />
      </main>
    </div>
  );
}
