// backend/index.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const sequelize = require("./config/db");  // Импортируем sequelize для использования базы данных

dotenv.config();  // Загружаем переменные из .env

const app = express();

app.use(express.json());  // Для обработки JSON-запросов
app.use(cors());  // Для разрешения кросс-доменных запросов

const PORT = process.env.PORT || 5000;

// Главный маршрут для проверки работы сервера
app.get("/", (req, res) => {
    res.json({ message: "Сервер работает!" });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
}).on("error", (err) => {
    console.error("Ошибка сервера:", err);
});
