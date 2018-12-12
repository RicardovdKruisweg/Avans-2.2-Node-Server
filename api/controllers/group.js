const config = require('config/config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('middleware/db');
const ObjectId = require('mongoose').Types.ObjectId;

const Group = db.Group;
const Message = db.Message;
const User = db.User;

module.exports = {
    getById,
    create,
    update,
    delete: _delete,
    getUserGroups,
    comment
};
// TODO: Write catches
async function getUserGroups(id) {
  const group =  await Group.find({ $or : [{ 'members' : new ObjectId(id) }, { 'owner' : new ObjectId(id) }] });
  return group;
}

async function getById(id) {
  const group = await Group.findById(id).populate({
    path: 'messages.author',
    select: 'displayname'
  });
  return group;
}

async function comment (comment, groupId) {
  const group = await Group.findById(groupId)
  group.messages.push({ content: comment.content, author: comment.author});
  await group.save();
}

async function create (group) {
  const newGroup = Group(group);
  newGroup.save()
  return newGroup;
}

async function update () {

}

async function _delete () {
  
}