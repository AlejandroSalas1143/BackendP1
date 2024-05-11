const jwt = require('jsonwebtoken');
const User = require('../user/user.model');
const { SECRET } = require("../config");

const register = async (name, email, hashedPassword) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return { error: 'El correo electrónico ya está registrado' };
  }

  try {
    const newUser = new User({
      name,
      email,
      password: hashedPassword
    });
    await newUser.save();
    return { message: 'Usuario registrado exitosamente' };
  } catch (error) {
    console.error(error);
    return { error: 'Error del servidor al registrar el usuario' };
  }
};

const login = async (user) => {
  try {
    const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: '1h' });
    return { token };
  } catch (error) {
    console.error(error);
    return { error: 'Error del servidor al generar el token' };
  }
};

module.exports = { register, login };
