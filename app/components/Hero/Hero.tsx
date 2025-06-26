import styles from './Hero.module.scss';

export default function Hero() {
  return (
    <div className={styles.hero}>
      <h1>Biz Nest</h1>
      <p>
        Build your business nest egg with confidence. Biz Nest empowers entrepreneurs and small business owners to create, manage, and grow their business apps with ease. Start your journey to financial security and business success—lay the foundation for your future today!
      </p>
      <button>Get Started</button>
    </div>
  );
} 