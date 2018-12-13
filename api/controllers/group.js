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
    comment,
    getAvailableUsers,
    addUserToGroup
};

async function getUserGroups(id) {
  const group =  await Group.find({ $or : [{ 'members' : new ObjectId(id) }, { 'owner' : new ObjectId(id) }] });
  return group;
}

async function getById(id) {
  const group = await Group.findById(id).populate({
    path: 'messages.author',
    select: 'displayname profilePicture',
  });
  return group;
}

async function getAvailableUsers(groupId){
  const usersInGroup = await Group.findOne({ _id: groupId}, { members: 1, owner: 1});
  let usersArray = usersInGroup.members;
  usersArray.push(usersInGroup.owner);
  const users = await User.find( { _id: { $nin: usersArray } } ).select('-password');
  return users
}

async function addUserToGroup(body) {
  const groupId = body.groupId;
  const userId = body.userId;
  const group = await Group.findOneAndUpdate(
    { _id: groupId },
    { $push: { members: userId } }
  ).populate({
    path: 'messages.author',
    select: 'displayname profilePicture',
  });
  return group;
}

async function comment (comment, groupId) {
  const group = await Group.findById(groupId)
  group.messages.push({ content: comment.content, author: comment.author});
  await group.save();
  const comments = await Group.findById(group._id).populate({
    path: 'messages.author',
    select: 'displayname profilePicture',
  });
  return comments;
}

async function create (group) {
  const newGroup = Group(group);
  await newGroup.save()
  return newGroup;
}

async function update (groupId, groupname) {
  const newname = groupname.name;
  const group = await Group.findById(groupId)
  group.name = newname;
  await group.save();
  return group;
}

async function _delete (groupId) {
  await Group.findByIdAndRemove(groupId);
} 