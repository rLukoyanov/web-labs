import { Router, Request, Response } from 'express';
import { literal, CreationAttributes } from 'sequelize';
import { Event } from '@models/Event';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Получить список всех мероприятий
 *     description: Возвращает список всех мероприятий, фильтруя удалённые.
 *     responses:
 *       200:
 *         description: Список мероприятий
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 *       500:
 *         description: Ошибка при получении списка мероприятий
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const events = await Event.findAll({
      where: literal('"deleted_at" IS NULL') as unknown as Record<
        string,
        unknown
      >,
    });
    res.status(200).json(events);
  } catch (error) {
    const err =
      error instanceof Error ? error : new Error('Неизвестная ошибка');
    res.status(500).json({
      error: 'Ошибка при получении списка мероприятий',
      details: err.message,
    });
  }
});

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Получить одно мероприятие по ID
 *     description: Возвращает информацию о мероприятии по его ID.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID мероприятия
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Мероприятие найдено
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       404:
 *         description: Мероприятие не найдено
 *       500:
 *         description: Ошибка при поиске мероприятия
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const event = await Event.findOne({ where: { id } });

    if (!event) {
      return res.status(404).json({ error: 'Мероприятие не найдено' });
    }

    res.status(200).json(event);
  } catch (error) {
    const err =
      error instanceof Error ? error : new Error('Неизвестная ошибка');
    res.status(500).json({
      error: 'Ошибка при поиске мероприятия',
      details: err.message,
    });
  }
});

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Создание нового мероприятия
 *     description: >
 *       Создаёт новое мероприятие с проверкой на лимит по количеству событий, которые могут быть созданы за 24 часа.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Мероприятие успешно создано
 *       400:
 *         description: Ошибка валидации
 *       429:
 *         description: Превышен лимит на создание мероприятий
 *       500:
 *         description: Ошибка при создании мероприятия
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, description, date } = req.body;

    if (!title || !date) {
      return res
        .status(400)
        .json({ error: 'Название, дата обязательны' });
    }

    const event = await Event.create({
      title,
      description,
      date,
    } as CreationAttributes<Event>);

    res.status(201).json(event);
  } catch (error) {
    const err =
      error instanceof Error ? error : new Error('Неизвестная ошибка');
    console.log(err);
    res.status(500).json({
      error: 'Ошибка при создании мероприятия',
      details: err.message,
    });
  }
});

/**
 * @swagger
 * /events/{id}:
 *   put:
 *     summary: Обновить мероприятие
 *     description: Обновляет информацию о мероприятии по его ID.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID мероприятия
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Мероприятие успешно обновлено
 *       404:
 *         description: Мероприятие не найдено
 *       500:
 *         description: Ошибка при обновлении мероприятия
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const event = await Event.findOne({ where: { id } });

    if (!event) {
      return res.status(404).json({ error: 'Мероприятие не найдено' });
    }

    await event.update(req.body);
    res.status(200).json(event);
  } catch (error) {
    const err =
      error instanceof Error ? error : new Error('Неизвестная ошибка');
    res.status(500).json({
      error: 'Ошибка при обновлении мероприятия',
      details: err.message,
    });
  }
});

/**
 * @swagger
 * /events/{id}:
 *   delete:
 *     summary: Мягкое удаление мероприятия
 *     description: Помечает мероприятие как удалённое, устанавливая поле deletedAt.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID мероприятия
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Мероприятие помечено как удалённое
 *       404:
 *         description: Мероприятие не найдено
 *       500:
 *         description: Ошибка при удалении мероприятия
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const event = await Event.findOne({ where: { id } });

    if (!event) {
      return res.status(404).json({ error: 'Мероприятие не найдено' });
    }

    await event.update({ deletedAt: new Date() });
    res.status(200).json({ message: 'Мероприятие помечено как удалённое' });
  } catch (error) {
    const err =
      error instanceof Error ? error : new Error('Неизвестная ошибка');
    res.status(500).json({
      error: 'Ошибка при удалении мероприятия',
      details: err.message,
    });
  }
});

export default router;
