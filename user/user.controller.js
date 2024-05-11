// user.controller.js
const { findUserById, updateUserById } = require('./user.actions');  // Asegúrate de que la ruta es correcta.

// Obtener información del usuario
async function getUser(req, res) {
    try {
        const userId = req.params.id || req.userId; // Usa el ID proporcionado o el del usuario logueado
        const user = await findUserById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving user", error: error.message });
    }
}

// Actualizar información del usuario
async function updateUser(req, res) {
    const { name, email, password } = req.body;
    try {
        const updatedUser = await updateUserById(req.userId, { name, email, password });
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User updated successfully" });
    } catch (error) {
        res.status(400).json({ message: "Error updating user", error: error.message });
    }
}

module.exports = { getUser, updateUser };
