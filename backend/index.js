const express = require("express");
const cors = require("cors");
require("dotenv").config();
const morgan = require("morgan");
const { authenticateDB, sequelize } = require("./config/db");
const userRoutes = require("./routes/users");
const eventRoutes = require("./routes/events");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const app = express();

// Настройка Swagger
const swaggerOptions = {
  definition: {
    openapi: "3.0.0", // Версия OpenAPI
    info: {
      title: "API Documentation", // Название документации
      version: "1.0.0", // Версия API
      description: "Документация для API приложения", // Описание
    },
    servers: [
      {
        url: "http://localhost:5000", // URL вашего сервера
      },
    ],
  },
  apis: ["./routes/*.js"], // Путь к файлам, содержащим описание API (ваши маршруты)
};

// Генерация документации с помощью swagger-jsdoc
const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Подключение Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Кастомный middleware для логирования
const logRequests = (req, res, next) => {
  const currentTime = new Date().toISOString();
  console.log(`[${currentTime}] ${req.method} ${req.originalUrl}`);
  next(); // Передаем управление следующему middleware или маршруту
};

// Настройка middleware
app.use(cors()); // Разрешаем кросс-доменные запросы
app.use(express.json()); // Для парсинга JSON данных

// Добавление morgan для логирования
app.use(morgan("dev")); // Логирование запросов с использованием morgan (формат "dev" показывает HTTP-метод, путь и статус код)

// Логируем все запросы через кастомный middleware
app.use(logRequests);

// Обработчик для корня
app.get("/", (req, res) => {
  res.send("API работает!");
});

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

// curl -X GET http://localhost:5000/users
// curl -X POST http://localhost:5000/users -H "Content-Type: application/json" -d '{"name": "qweqwe", "email": "qweqweq@mail.ru"}'
// curl -X POST http://localhost:5000/events -H "Content-Type: application/json" -d '{"title": "Tech Conference 2025", "description": "An exciting tech event focused on the future of AI.", "date": "2025-06-15T10:00:00.000Z", "createdBy": "762ea839-3318-40fd-b8bd-e07c07244e34"}'