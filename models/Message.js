const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    content: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = MessageSchema;