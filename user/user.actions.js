// user.actions.js
const User = require('./user.model');  // Asegúrate de que la ruta es correcta.

async function findUserById(userId){
    return await User.findOne({_id: userId, enabled: true}).select('-password -__v');
};

async function updateUserById(userId, updates){
    const user = await User.findById(userId);
    
    if (!user) {
        return null;
    }

    // Actualiza los campos permitidos
    user.name = updates.name || user.name;
    user.email = updates.email || user.email;
    user.password = updates.password || user.password;  // Considera el hashing de la contraseña aquí

    await user.save();
    return user;
};

async function deleteUserById(userId) {
    const updatedUser = await User.findByIdAndUpdate(userId, { enabled: false }, { new: true });
    return updatedUser;
}
module.exports = { findUserById, updateUserById, deleteUserById }