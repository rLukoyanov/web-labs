import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';
import { User } from '@models/User';
import { Event } from '@models/Event';
import { BlacklistedToken } from '@models/BlacklistedToken';
dotenv.config();
export const sequelize = new Sequelize({
    database: process.env.DB_NAME || 'postgres',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    dialect: 'postgres',
    models: [User, Event, BlacklistedToken],
    logging: false,
});
// Проверка соединения с БД
export const authenticateDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Успешное подключение к базе данных');
    }
    catch (error) {
        console.error('❌ Ошибка подключения к базе данных:', error);
    }
};
// Синхронизация таблиц (force: true — пересоздаст таблицы)
export const syncDB = async () => {
    try {
        await sequelize.sync({ force: false });
        console.log('✅ Таблицы успешно синхронизированы');
    }
    catch (error) {
        console.error('❌ Ошибка при синхронизации БД:', error);
    }
};
