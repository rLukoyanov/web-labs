import React from 'react';
import { Link } from 'react-router-dom';
import styles from './NotFoundPage.module.scss';

const NotFoundPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Страница не найдена</h1>
      <Link to="/" className={styles.link}>
        Вернуться на главную
      </Link>
    </div>
  );
};

export default NotFoundPage;
