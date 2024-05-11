// authController.js

const { register, login } = require('./auth.actions');

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const message = await register(name, email, password);
    res.status(201).json({ message });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const token = await login(email, password);
    res.status(200).json({ token });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser };
