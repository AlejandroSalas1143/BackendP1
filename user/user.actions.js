const User = require('./user.model');

async function findUserById(userId){
    return await User.findOne({_id: userId, enabled: true}).select('-password -__v');
};

async function updateUserById(userId, updates){
    const user = await User.findById(userId);
    
    if (!user) {
        return null;
    }
    user.name = updates.name || user.name;
    user.email = updates.email || user.email;
    user.password = updates.password || user.password; 

    await user.save();
    return user;
};

async function deleteUserById(userId) {
    const updatedUser = await User.findByIdAndUpdate(userId, { enabled: false }, { new: true });
    return updatedUser;
}
module.exports = { findUserById, updateUserById, deleteUserById }