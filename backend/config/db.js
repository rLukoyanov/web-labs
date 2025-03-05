// backend/config/db.js
const { Sequelize } = require('sequelize');
require('dotenv').config();  // Загрузка переменных из .env

// Создание объекта sequelize с параметрами подключения
const sequelize = new Sequelize({
  database: process.env.DB_NAME,     // Название базы данных
  username: process.env.DB_USER,     // Логин для подключения
  password: process.env.DB_PASSWORD, // Пароль для подключения
  host: process.env.DB_HOST,         // Хост для подключения
  port: process.env.DB_PORT,         // Порт для подключения (по умолчанию 5432 для PostgreSQL)
  dialect: 'postgres',               // Диалект базы данных PostgreSQL
});

// Функция для проверки соединения с базой данных
const authenticateDatabase = async () => {
  try {
    // Проверка соединения с базой данных
    await sequelize.authenticate();
    console.log('Connection to the database has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

// Вызов функции для проверки соединения
authenticateDatabase();

// Экспорт объекта sequelize для использования в моделях
module.exports = sequelize;
