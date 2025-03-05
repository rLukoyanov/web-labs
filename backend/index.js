const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { authenticateDB, sequelize } = require("./config/db");
const userRoutes = require("./routes/users");
const eventRoutes = require("./routes/events");

const app = express();

// Настройка middleware
app.use(cors()); // Разрешаем кросс-доменные запросы
app.use(express.json()); // Для парсинга JSON данных

// Подключаем маршруты
app.use("/users", userRoutes);
app.use("/events", eventRoutes);

// Проверяем соединение с базой данных
authenticateDB();

// Синхронизация базы данных
sequelize.sync({ force: false }).then(() => {
    console.log("База данных синхронизирована");
}).catch((error) => {
    console.error("Ошибка синхронизации базы данных:", error);
});

// Запуск сервера
const PORT = process.env.PORT || 5000; // Порт для сервера
app.listen(PORT, (err) => {
    if (err) {
        console.error("Ошибка при запуске сервера:", err);
        process.exit(1);
    }
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});