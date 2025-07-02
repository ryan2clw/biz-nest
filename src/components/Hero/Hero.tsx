import styles from './Hero.module.scss';
import Carousel from '../Carousel/Carousel';

export default function Hero() {
  return (
    <div className={styles.hero}>
      <h1>
        Biz
        <span className={styles.logoSpan} aria-label="Biz Nest Logo">
          <svg width="60" height="60" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: 'middle', margin: '0 8px' }}>
            <rect x="30" y="20" width="20" height="40" rx="3" fill="#2563eb" stroke="#1e40af" strokeWidth="2"/>
            <rect x="36" y="28" width="8" height="12" rx="1" fill="#fff" opacity="0.7"/>
            <rect x="36" y="44" width="8" height="8" rx="1" fill="#fff" opacity="0.7"/>
            <ellipse cx="40" cy="65" rx="18" ry="7" fill="#f5d6b4" stroke="#bfa16b" strokeWidth="2"/>
            <path d="M22 65 Q30 70 40 65 Q50 70 58 65" stroke="#bfa16b" strokeWidth="2" fill="none"/>
            <path d="M28 68 Q35 72 40 67 Q45 72 52 68" stroke="#bfa16b" strokeWidth="1.5" fill="none"/>
            <circle cx="60" cy="20" r="6" fill="#fbbf24" opacity="0.7"/>
          </svg>
        </span>
        Nest
      </h1>
      <Carousel items={[
        "Build your business nest egg with confidence.",
        "Biz Nest empowers entrepreneurs and small business owners to create, manage, and grow their business apps with ease.",
        "Start your journey to financial security and business success—lay the foundation for your future today!"
      ]} />
      <button>Get Started</button>
    </div>
  );
} 