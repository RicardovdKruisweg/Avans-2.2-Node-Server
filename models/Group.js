const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const MessageSchema = require('./Message');

const GroupSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    members: [ { type: mongoose.Schema.Types.ObjectId, ref: 'user' } ],
    messages: [ MessageSchema ]
});

module.exports = mongoose.model('group', GroupSchema);