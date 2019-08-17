const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../../src/models/user');
const Task = require('../../src/models/task');

const userOneId = new mongoose.Types.ObjectId();
const userOne = {
  _id: userOneId,
  name: 'Mary',
  email: 'programmingyvonnkr@gmail.com',
  age: 27,
  password: '1234567',
  tokens: [
    {
      token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET)
    }
  ]
};

const userTwoId = new mongoose.Types.ObjectId();
const userTwo = {
  _id: userTwoId,
  name: 'Andrew',
  email: 'andrew@gmail.com',
  age: 29,
  password: '1234567',
  tokens: [
    {
      token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET)
    }
  ]
};

const taskOne = {
  _id: new mongoose.Types.ObjectId(),
  description: 'Task one',
  completed: false,
  owner: userOne._id
};
const taskTwo = {
  _id: new mongoose.Types.ObjectId(),
  description: 'Task two',
  completed: true,
  owner: userOne._id
};
const taskThree = {
  _id: new mongoose.Types.ObjectId(),
  description: 'Task three',
  completed: false,
  owner: userTwo._id
};

const setUpDatabase = async () => {
  await User.deleteMany();
  await Task.deleteMany();
  await new User(userOne).save();
  await new User(userTwo).save();
  await new Task(taskOne).save();
  await new Task(taskTwo).save();
  await new Task(taskThree).save();
};

module.exports = {
  userOneId,
  userOne,
  userTwo,
  userTwoId,
  taskOne,
  taskTwo,
  taskThree,
  setUpDatabase
};
