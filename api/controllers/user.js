const config = require('config/config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('middleware/db');
const User = db.User;

module.exports = {
    authenticate,
    getAll,
    getById,
    create,
    update,
    delete: _delete
};

async function authenticate({ username, password }) {
    const user = await User.findOne({ username });
    if (user && bcrypt.compareSync(password, user.password)) {
        const { password, ...userWithoutPassword } = user.toObject();
        const token = jwt.sign({ sub: user.id }, config.secret);
        return {
            ...userWithoutPassword,
            token
        };
    }
}

async function getAll() {
    return await User.find().select('-password');
}

async function getById(id) {
    return await User.findById(id).select('-password');
}

async function create(userParam) {
    if(!userParam.username || !userParam.password) throw "Error missing paramenters";

    if (await User.findOne({ username: userParam.username })) {
        throw 'Username "' + userParam.username + '" is already taken';
    }

    const user = new User(userParam);

    if (userParam.password) {
        user.password = bcrypt.hashSync(userParam.password, 10);
    }

    user.profilePicture = `https://api.adorable.io/avatars/285/${userParam.username}`;

    await user.save();
    return user;
}

async function update(id, userParam) {
    const user = await User.findById(id);

    if (!user) throw 'User not found';
    // Check if old and new pasword are entered and hash them
    if (userParam.oldPassword && userParam.newPassword) {
        // Check if old password matches
        if(bcrypt.compareSync(userParam.oldPassword, user.password)) {
            user.password = bcrypt.hashSync(userParam.newPassword, 10);
        }
        else throw 'Current password did not match';
    }

    if(userParam.displayname){
        user.displayname = userParam.displayname
    }

    await user.save()
    const userInfo = {
        _id: user._id,
        username: user.username,
        profilePicture: user.profilePicture,
        displayname: user.displayname
    }
    return userInfo;
}

async function _delete(id) {
    await User.findByIdAndRemove(id);
}