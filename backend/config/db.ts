import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';
import { User } from '@models/User';
import { Event } from '@models/Event';
import { BlacklistedToken } from '@models/BlacklistedToken';

dotenv.config();

const sequelize = new Sequelize({
  database: process.env.DB_NAME || 'events_app',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  dialect: 'postgres',
  logging: false,
  define: {
    underscored: true,
    timestamps: true,
  },
});

// Initialize models
sequelize.addModels([User, Event, BlacklistedToken]);

// Initialize associations after models are loaded
Event.belongsTo(User, { foreignKey: 'createdBy', as: 'user' });
User.hasMany(Event, { foreignKey: 'createdBy', as: 'events' });

export { sequelize };

// Проверка соединения с БД
export const authenticateDB = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('Успешное подключение к базе данных');
  } catch (error) {
    console.error('Ошибка подключения к базе данных:', error);
    throw error;
  }
};

// Синхронизация таблиц (force: true — пересоздаст таблицы)
export const syncDB = async (): Promise<void> => {
  try {
    await sequelize.sync({ force: false });
    console.log('Таблицы успешно пересозданы');
  } catch (error) {
    console.error('Ошибка при синхронизации БД:', error);
    throw error;
  }
};
