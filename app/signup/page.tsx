import UserForm from '../components/UserForm/UserForm';
import styles from './page.module.scss';

export const metadata = {
  title: 'Sign Up | Biz Nest',
  description: 'Create your new Biz Nest account and start building your business nest egg.'
};

export default function SignUpPage() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>New account sign up</h1>
        <p className={styles.subtitle}>
          Choose your screen name and sign up with Google to get started with Biz Nest
        </p>
        <UserForm />
      </div>
    </div>
  );
} 