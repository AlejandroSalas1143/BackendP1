// authRoutes.js

const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('./auth.controller');

// Ruta para registrar un nuevo usuario
router.post('/register', registerUser);

// Ruta para iniciar sesión
router.post('/login', loginUser);

module.exports = router;
