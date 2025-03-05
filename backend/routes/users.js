const express = require("express");
const User = require("../models/User");

const router = express.Router();

// 🔹 Получить список пользователей
router.get("/", async (req, res) => {
    try {
        const users = await User.findAll();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: "Ошибка при получении пользователей", details: error.message });
    }
});

// 🔹 Создать нового пользователя
router.post("/", async (req, res) => {
    try {
        const { name, email } = req.body;

        // Проверяем обязательные поля
        if (!name || !email) {
            return res.status(400).json({ error: "Имя и email обязательны для заполнения" });
        }

        // Проверяем уникальность email
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: "Пользователь с таким email уже существует" });
        }

        // Создаём нового пользователя
        const user = await User.create({ name, email });
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ error: "Ошибка при создании пользователя", details: error.message });
    }
});

module.exports = router;