require('rootpath')();
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('middleware/jwt');
const errorHandler = require('middleware/errorHandler');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// api routes
app.use('/users', require('./api/routes/users'));
app.use('/groups', require('./api/routes/groups'));



app.use(cors());
// use JWT auth to secure the api
app.use(jwt());
// global error handler
app.use(errorHandler);

// Serve static assets if in production
if(process.env.NODE_ENV === 'production') {
  // set staic folder
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  })
}

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server started on ${port}`));