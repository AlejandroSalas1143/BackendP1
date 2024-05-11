const express = require('express');
const router = express.Router();
//const { createUser, getUser, updateUser, deleteUser } = require('./user.controller'); // Asegúrate de que las rutas de los imports son correctas
const { getUser, updateUser } = require('./user.controller');
const verifyToken  = require('../auth/auth.jwt');


//router.post('/users', createUser);
router.get('/:id?', verifyToken, getUser);
router.put('/edit', verifyToken, updateUser);
//router.delete('/users/me', deleteUser);

module.exports = router;
