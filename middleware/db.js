const config = require('config/config.json');
const mongoose = require('mongoose');

// MongoDB
mongoose.Promise = global.Promise;
if(process.env.NODE_ENV === 'production'){
    mongoose.connect(config.mongoURI,  { // https://mongoosejs.com/docs/deprecations.html
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false
    }).then(_ => {
        console.log('MongoDB connected!');
    }).catch(console.error);
} else {
    mongoose.connect(config.mongoTestURI,  { // https://mongoosejs.com/docs/deprecations.html
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false
    }).then(_ => {
        console.log('MongoDB connected!');
    }).catch(console.error);
}

module.exports = {
    User: require('../models/User'),
    Group: require('../models/Group')
};