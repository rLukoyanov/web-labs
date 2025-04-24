import { useEffect, useState } from 'react';
import styles from './EventsPage.module.scss';
import { fetchEvents } from '@api/eventService';
import { getToken } from '@utils/localStorage';
import { useNavigate } from 'react-router-dom';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  deletedAt?: string | null;
}

const EventsPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const token = getToken();

  useEffect(() => {
    if (!token) {
      console.log('No token found, redirecting to login');
      navigate('/login');
      return;
    }

    const loadEvents = async () => {
      try {
        console.log('Loading events...');
        setIsLoading(true);
        setError('');
        const data = await fetchEvents(showDeleted, token);
        console.log('Events loaded:', data);
        setEvents(data);
      } catch (err: any) {
        console.error('Error loading events:', err);
        console.error('Error response:', err.response);
        setError(err.response?.data?.message || 'Ошибка при загрузке мероприятий');
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, [showDeleted, token, navigate]);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>Список мероприятий</h2>
        </div>
        <div className={styles.loading}>Загрузка мероприятий...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Список мероприятий</h2>
        <div className={styles.controls}>
          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={showDeleted}
              onChange={() => setShowDeleted(!showDeleted)}
            />
            Показать удалённые мероприятия
          </label>
        </div>
      </div>

      {error && (
        <div className={styles.error}>
          <span>⚠️</span> {error}
        </div>
      )}

      {events.length === 0 ? (
        <div className={styles.noEvents}>
          {showDeleted
            ? 'Нет удалённых мероприятий'
            : 'Пока нет созданных мероприятий'}
        </div>
      ) : (
        <div className={styles.grid}>
          {events.map((event) => (
            <div
              key={event.id}
              className={`${styles.card} ${
                event.deletedAt ? styles.deleted : ''
              }`}
            >
              <h3>{event.title}</h3>
              <p className={styles.description}>{event.description}</p>
              <div className={styles.date}>
                <span className={styles.icon}>📅</span>
                {new Date(event.date).toLocaleString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                {event.deletedAt && (
                  <span className={styles.deletedLabel}>
                    удалено {new Date(event.deletedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventsPage;
