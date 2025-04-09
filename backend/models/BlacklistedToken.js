// Импортируем необходимые модули
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Определяем модель BlacklistedToken для работы с таблицей черных токенов
const BlacklistedToken = sequelize.define("BlacklistedToken", {
  token: {
    type: DataTypes.STRING(512),
    allowNull: false,
    primaryKey: true
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: "BlacklistedTokens",
  timestamps: true
});

// Хук beforeCreate для установки expiresAt перед созданием записи
BlacklistedToken.beforeCreate(async (instance) => {
  try {
    const decoded = jwt.verify(instance.token, process.env.JWT_SECRET);
    instance.expiresAt = new Date(decoded.exp * 1000);
  } catch {
    instance.expiresAt = new Date(Date.now() + 86400000);  // 24 часа от текущего времени
  }
});

// Экспортируем модель для использования в других частях приложения
module.exports = BlacklistedToken;
