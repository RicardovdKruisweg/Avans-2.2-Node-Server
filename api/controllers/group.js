const config = require('config/config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('middleware/db');
const ObjectId = require('mongoose').Types.ObjectId;

const Group = db.Group;
const Message = db.Message;

module.exports = {
    getById,
    create,
    update,
    delete: _delete,
    getUserGroups,
    comment
};

async function getUserGroups(id) {
  const group =  await Group.find({ $or: [{ 'members' : new ObjectId(id) }, { 'owner' : new ObjectId(id) }] });
  return group;
}

async function getById(id) {
  const group = await Group.findById(id);
  return group;
}

async function comment (comment, groupId) {
  console.log(comment);
  const group = await Group.findById(groupId)
  group.messages.push({ content: comment.comment.content, author: comment.comment.author});
  console.log(group);
  group.save();
}

async function create () {

}

async function update () {

}

async function _delete () {
  
}