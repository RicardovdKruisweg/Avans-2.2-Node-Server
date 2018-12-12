const express = require('express');
const router = express.Router();
const groupController = require('../controllers/group');

// routes
router.post('/', create);
router.post('/comment/:id', comment);
router.get('/:id', getById);
router.get('/user/:id', getUserGroups);
router.put('/:id', update);
router.delete('/:id', _delete);

module.exports = router;

function getUserGroups(req, res, next) {
  groupController.getUserGroups(req.params.id)
      .then(group => group ? res.json(group) : res.sendStatus(404))
      .catch(err => next(err));
}

function getById (req, res, next){
  groupController.getById(req.params.id)
      .then( group => group ? res.json(group) : res.sendStatus(404) )
      .catch( err => next(err) );
}

function comment (req, res, next) {
  groupController.comment(req.body, req.params.id)
    .then( group => res.json( group ) )
    .catch( err => next( err ) );
}

function create (req, res, next) {
  groupController.create(req.body)
    .then( group => res.json(group) )
    .catch( err => next(err) )
}

function update (req, res, next) {
  groupController.update(req.params.id, req.body)
    .then ( group => res.json(group))
    .catch ( err => next(err) );
}

function _delete (req, res, next) {
  groupController.delete(req.params.id)
    .then( () => res.json({}))
    .catch ( err => next(err) )
}