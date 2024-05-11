const { findUserById, updateUserById, deleteUserById } = require('./user.actions');  // Asegúrate de que la ruta es correcta.

async function getUser(req, res) {
    try {
        const userId = req.params.id || req.userId; 
        const user = await findUserById(userId, { enabled: true });
        if (!user) {
            return res.status(404).json({ message: "User not found or not enabled" });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving user", error: error.message });
    }
}

async function updateUser(req, res) {
    const { name, email, password } = req.body;

    const userId = req.params.id || req.userId;

    if (userId !== req.userId) {
        return res.status(403).json({ message: "Permission denied: You can only update your own profile" });
    }

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

async function deleteUser(req, res) {
    const userId = req.params.id;
    if (userId !== req.userId) {
        return res.status(403).json({ message: "Permission denied: Cannot delete another user" });
    }

    try {
        const result = await deleteUserById(userId);
        if (!result) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting user", error: error.message });
    }
}

module.exports = { getUser, updateUser, deleteUser };
