const express = require('express');
const router = express.Router();
const { createPool } = require('../db');

const pool = require('../db'); 

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Tickets');
    res.json(rows);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

