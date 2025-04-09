const express = require("express");
const cors = require("cors");
require("dotenv").config();
const morgan = require("morgan");
const { authenticateDB, syncDB } = require("./config/db");
const userRoutes = require("./routes/users");
const eventRoutes = require("./routes/events");
const authRoutes = require("./routes/auth");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const passport = require("passport");
require("./config/passport");

const app = express();

// Улучшенная конфигурация Swagger
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Event Management API",
      version: "1.0.0",
      description: "Документация для API управления мероприятиями и пользователями",
      contact: {
        name: "Поддержка",
        email: "support@example.com"
      },
      license: {
        name: "MIT",
      }
    },
    tags: [
      {
        name: "Auth",
        description: "Аутентификация и авторизация"
      },
      {
        name: "Users",
        description: "Операции с пользователями"
      },
      {
        name: "Events",
        description: "Управление мероприятиями"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Введите JWT токен в формате: Bearer <ваш_токен>"
        }
      },
      schemas: {
        ErrorResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false
            },
            message: {
              type: "string",
              example: "Произошла ошибка"
            }
          }
        }
      }
    },
    security: [{
      bearerAuth: []
    }],
    servers: [
      {
        url: "http://localhost:5000",
        description: "Локальный сервер разработки"
      },
      {
        url: "https://api.yourdomain.com",
        description: "Продакшен сервер"
      }
    ],
  },
  apis: ["./routes/*.js", "./models/*.js"], // Добавлено сканирование моделей
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(passport.initialize());

// Улучшенное логирование запросов
const logRequests = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${req.ip}`);
  next();
};
app.use(logRequests);

// Улучшенная настройка Swagger UI
app.use("/api-docs", 
  swaggerUi.serve, 
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    swaggerOptions: {
      persistAuthorization: true,
      defaultModelsExpandDepth: -1, // Скрываем раздел моделей
      docExpansion: "list", // Разворачиваем только текущий endpoint
      filter: true, // Включаем поиск
      displayRequestDuration: true, // Показываем время выполнения
      tryItOutEnabled: true // Включаем "Try it out" по умолчанию
    },
    customSiteTitle: "Event Management API Docs",
    customfavIcon: "/favicon.ico",
    customCss: '.swagger-ui .topbar { display: none }'
  })
);

// Роуты
app.get("/", (req, res) => {
  res.json({
    message: "API работает!",
    docs: "/api-docs",
    status: "OK"
  });
});

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/events", eventRoutes);

// Улучшенная обработка ошибок
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.stack}`);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
});

// Асинхронная инициализация БД
const initializeDB = async () => {
  try {
    await authenticateDB();
    await syncDB();
    console.log("База данных подключена и синхронизирована");
  } catch (err) {
    console.error("Ошибка инициализации БД:", err.message);
    process.exit(1);
  }
};

// Запуск сервера
const PORT = process.env.PORT || 5000;

initializeDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Сервер запущен на http://localhost:${PORT}`);
      console.log(`Документация доступна по http://localhost:${PORT}/api-docs`);
    });
  })
  .catch(err => {
    console.error("Ошибка при запуске сервера:", err.message);
  });