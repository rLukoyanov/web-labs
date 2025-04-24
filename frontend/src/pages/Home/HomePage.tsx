import React from 'react';
import { Navigate } from 'react-router-dom';
import { getToken } from '@utils/localStorage';
import styles from './HomePage.module.scss';

const HomePage: React.FC = () => {
  const isAuthenticated = !!getToken();

  if (isAuthenticated) {
    return <Navigate to="/events" />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1>Event Management</h1>
        <p className={styles.subtitle}>
          Управляйте своими мероприятиями легко и эффективно
        </p>
      </div>
    </div>
  );
};

export default HomePage;
