import { Link, useNavigate, useLocation } from 'react-router-dom';
import { checkAuth, logout } from '@api/authService';
import { useEffect, useState } from 'react';
import styles from './Navigation.module.scss';

interface User {
  id: string;
  email: string;
  name?: string;
}

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await checkAuth();
        console.log('Check auth response:', res);
        if (res.success && res.user) {
          console.log('Setting user:', res.user);
          setUser(res.user);
        } else {
          console.log('No user data in response');
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setUser(null);
      }
    };

    loadUser();
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      navigate('/');
    }
  };

  const displayName = user?.name || user?.email?.split('@')[0] || 'Пользователь';
  console.log('Current user state:', user);
  console.log('Display name:', displayName);

  return (
    <nav className={styles.navigation}>
      <div className={styles.logo}>
        <Link to={user ? "/events" : "/"} onClick={handleLogoClick}>
          Event App
        </Link>
      </div>
      <div className={styles.links}>
        {user ? (
          <>
            <span className={styles.welcome}>{displayName}</span>
            <button onClick={handleLogout} className={styles.logoutButton}>
              Выйти
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Войти</Link>
            <Link to="/register">Регистрация</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navigation; 