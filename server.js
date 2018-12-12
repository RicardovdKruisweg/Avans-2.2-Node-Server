require('rootpath')();
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('middleware/jwt');
var server = require('http').Server(app);
const socketIo = require('socket.io')
const errorHandler = require('middleware/errorHandler');

const groupController = require('./api/controllers/group');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors());

// api routes
app.use('/users', require('./api/routes/users'));
app.use('/groups', require('./api/routes/groups'));

app.use(jwt());
app.use(errorHandler);
// use JWT auth to secure the api
// global error handler


// Serve static assets if in production
if(process.env.NODE_ENV === 'production') {
  // set staic folder
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  })
}

const port = process.env.PORT || 5000;

const io = socketIo(server);

// Check if commented then emit groupinfo
io.on('connection', socket => {
  socket.on('comment', (comment, groupId) => {
    console.log(comment);
    groupController.comment(comment, groupId).then( () => {
      groupController.getById(groupId).then( group => {
        io.sockets.emit('new comment', group);
      })
      .catch( err => console.log(err));
    })  
    .catch(err => console.error(err));
  });
});

server.listen(port, () => console.log(`Server started on ${port}`));    