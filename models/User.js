const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

// Create Schema
const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    displayname: {
        type: String,
        required: false
    },
    profilePicture: {
        type: String,
        required: false
    },
    isDeleted : {
        type: Boolean,
        default: false
    }
    //friends: [this],
});

UserSchema.set('toJSON', { virtuals: true });
// Embedding over referencing: Expect more GETS
// TODO: Add feature to enable friends (Probably self reference)

module.exports = mongoose.model('user', UserSchema);