import styles from './DashDetail.module.scss';

interface DashDetailProps {
  heading: string;
}

export default function DashDetail({ heading }: DashDetailProps) {
  return (
    <div className={styles.dashDetail}>
      <h3>{heading}</h3>
      <p>Detail content goes here...</p>
    </div>
  );
} 