const argon2 = require('argon2');
const { register, login } = require('./auth.actions');
const User = require('../user/user.model');

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await argon2.hash(password);
  const result = await register(name, email, hashedPassword);

  if (result.error) {
    return res.status(409).json({ message: result.error });
  }
  res.status(201).json({ message: result.message });
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !user.enabled) {
    return res.status(401).json({ message: 'Credenciales incorrectas o usuario no habilitado' });
  }

  const isValidPassword = await argon2.verify(user.password, password);
  if (!isValidPassword) {
    return res.status(401).json({ message: 'Credenciales incorrectas' });
  }

  const result = await login(user);
  if (result.error) {
    return res.status(500).json({ message: result.error });
  }
  res.status(200).json({ token: result.token });
};

module.exports = { registerUser, loginUser };
