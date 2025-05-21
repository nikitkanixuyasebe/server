// server.js
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Получить список занятых билетов
app.get('/taken-tickets', async (req, res) => {
  try {
    const tickets = await db.getTakenTickets();
    res.json({ taken: tickets });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка получения билетов' });
  }
});

// Покупка билетов
app.post('/purchase', async (req, res) => {
  const { tickets } = req.body;

  if (!Array.isArray(tickets) || tickets.length === 0) {
    return res.status(400).json({ error: 'Неверные данные' });
  }

  try {
    const success = await db.reserveTickets(tickets);
    if (!success) {
      return res.status(409).json({ error: 'Некоторые билеты уже заняты' });
    }
    res.json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при бронировании' });
  }
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});