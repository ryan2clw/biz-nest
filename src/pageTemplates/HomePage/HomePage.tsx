import styles from './HomePage.module.scss';
import Hero from '../../components/Hero/Hero';
import LeadForm from '../../components/LeadForm/LeadForm';

interface HomePageProps {
  carouselItems?: string[];
  ctaText?: string;
  ctaUrl?: string;
  heroImageUrl?: string;
  businessId?: string;
}

export default function HomePage({ carouselItems, ctaText, ctaUrl, heroImageUrl, businessId }: HomePageProps) {
  return (
    <div className={styles["tampa-bg"]}>
      <main className={styles.main}>
        <Hero
          carouselItems={carouselItems}
          ctaText={ctaText}
          ctaUrl={ctaUrl}
          heroImageUrl={heroImageUrl}
        />
        {businessId && (
          <LeadForm businessId={businessId} pagePath="/" />
        )}
      </main>
    </div>
  );
}
