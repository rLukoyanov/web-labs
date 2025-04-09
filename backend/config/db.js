const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
    process.env.DB_NAME,     // Название БД
    process.env.DB_USER,     // Пользователь
    process.env.DB_PASSWORD, // Пароль
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: "postgres", // Указываем, что используем PostgreSQL
        logging: false,      // Отключаем логи SQL-запросов
    }
);

// Функция проверки соединения
const authenticateDB = async () => {
    try {
        await sequelize.authenticate();
        console.log("Успешное подключение к базе данных");
    } catch (error) {
        console.error("Ошибка подключения к базе данных:", error);
    }
};

// Функция для принудительной синхронизации (пересоздания) таблиц
const syncDB = async () => {
    try {
        await sequelize.sync({ force: false }); // force: true пересоздает таблицы
        console.log("Таблицы успешно пересозданы");
    } catch (error) {
        console.error("Ошибка при синхронизации БД:", error);
    }
};

module.exports = { 
    sequelize, 
    authenticateDB,
    syncDB
};