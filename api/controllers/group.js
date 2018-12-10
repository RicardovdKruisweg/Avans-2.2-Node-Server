const config = require('config/config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('middleware/db');
const ObjectId = require('mongoose').Types.ObjectId;

const Group = db.Group;

module.exports = {
    getById,
    create,
    update,
    delete: _delete
};

async function getById(id) {
  console.log(id)
  return await Group.find({ $or: [{ 'members' : new ObjectId(id) }, { 'owner' : new ObjectId(id) }] });
}

async function create () {

}

async function update () {

}

async function _delete () {
  
}