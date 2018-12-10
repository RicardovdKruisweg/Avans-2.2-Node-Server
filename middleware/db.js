const config = require('config/config.json');
const mongoose = require('mongoose');
mongoose.connect(config.mongoURI, 
  {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false
  })
  .then( () => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));
mongoose.Promise = global.Promise;

module.exports = {
    User: require('../models/User'),
    Group: require('../models/Group')
};