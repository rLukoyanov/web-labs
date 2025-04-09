const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const jwt = require("jsonwebtoken");
require("dotenv").config();

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

BlacklistedToken.beforeCreate(async (instance) => {
  try {
    const decoded = jwt.verify(instance.token, process.env.JWT_SECRET);
    instance.expiresAt = new Date(decoded.exp * 1000);
  } catch {
    instance.expiresAt = new Date(Date.now() + 86400000);
  }
});

module.exports = BlacklistedToken;