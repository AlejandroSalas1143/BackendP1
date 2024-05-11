const express = require('express');
const router = express.Router();
const { getUser, updateUser, deleteUser } = require('./user.controller');
const verifyToken  = require('../auth/auth.jwt');


router.get('/:id?', verifyToken, getUser);
router.put('/edit/:id?', verifyToken, updateUser);
router.delete('/delete/:id', verifyToken, deleteUser);

module.exports = router;
