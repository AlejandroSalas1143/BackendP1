// authActions.js

const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const User = require('../user/user.model');
const { SECRET } = require("../config");

const register = async (name, email, password) => {
  try {
    // Verificar si el email ya está registrado
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('El correo electrónico ya está registrado');
    }

    // Hash de la contraseña con Argon2
    const hashedPassword = await argon2.hash(password);

    // Crear el nuevo usuario
    const newUser = new User({
      name,
      email,
      password: hashedPassword
    });

    // Guardar el nuevo usuario en la base de datos
    await newUser.save();

    return 'Usuario registrado exitosamente';
  } catch (error) {
    console.error(error);
    throw new Error('Error del servidor');
  }
};

const login = async (email, password) => {
  try {
    // Buscar el usuario por su correo electrónico
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Credenciales incorrectas');
    }

    // Verificar la contraseña utilizando Argon2
    const isValidPassword = await argon2.verify(user.password, password);
    if (!isValidPassword) {
      throw new Error('Credenciales incorrectas');
    }

    // Generar token JWT
    const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: '1h' });

    return token;
  } catch (error) {
    console.error(error);
    throw new Error('Error del servidor');
  }
};

module.exports = { register, login };
