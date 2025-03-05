const express = require("express");
const { Op } = require("sequelize");
const Event = require("../models/Event");

const router = express.Router();

// 🔹 Получить список всех мероприятий
router.get("/", async (req, res) => {
    try {
        const events = await Event.findAll();
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ error: "Ошибка при получении списка мероприятий", details: error.message });
    }
});

// 🔹 Получить одно мероприятие по ID
router.get("/:id", async (req, res) => {
    try {
        const event = await Event.findByPk(req.params.id);
        if (!event) {
            return res.status(404).json({ error: "Мероприятие не найдено" });
        }
        res.status(200).json(event);
    } catch (error) {
        res.status(500).json({ error: "Ошибка при поиске мероприятия", details: error.message });
    }
});

// 🔹 Создать мероприятие (POST /events)
router.post("/", async (req, res) => {
    try {
        const { title, description, date, createdBy } = req.body;

        // Проверяем обязательные поля
        if (!title || !date || !createdBy) {
            return res.status(400).json({ error: "Заполните обязательные поля: title, date, createdBy" });
        }

        // Создаем мероприятие
        const event = await Event.create({ title, description, date, createdBy });
        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ error: "Ошибка при создании мероприятия", details: error.message });
    }
});

// 🔹 Обновить мероприятие (PUT /events/:id)
router.put("/:id", async (req, res) => {
    try {
        const event = await Event.findByPk(req.params.id);
        if (!event) {
            return res.status(404).json({ error: "Мероприятие не найдено" });
        }

        await event.update(req.body);
        res.status(200).json(event);
    } catch (error) {
        res.status(500).json({ error: "Ошибка при обновлении мероприятия", details: error.message });
    }
});

// 🔹 Удалить мероприятие (DELETE /events/:id)
router.delete("/:id", async (req, res) => {
    try {
        const event = await Event.findByPk(req.params.id);
        if (!event) {
            return res.status(404).json({ error: "Мероприятие не найдено" });
        }

        await event.destroy();
        res.status(200).json({ message: "Мероприятие удалено" });
    } catch (error) {
        res.status(500).json({ error: "Ошибка при удалении мероприятия", details: error.message });
    }
});

module.exports = router;