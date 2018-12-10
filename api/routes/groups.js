const express = require('express');
const router = express.Router();
const groupController = require('../controllers/group');

// routes
router.post('/', create);
router.get('/:id', getById);
router.put('/:id', update);
router.delete('/:id', _delete);

module.exports = router;

function getById(req, res, next) {
  groupController.getById(req.params.id)
      .then(group => group ? res.json(group) : res.sendStatus(404))
      .catch(err => next(err));
}

function create () {

}

function update () {

}

function _delete () {
  
}