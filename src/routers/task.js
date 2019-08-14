const express = require('express');
const Task = require('../models/task');
const auth = require('../middleware/auth');
const router = new express.Router();

//create task
router.post('/tasks', auth, async (req, res) => {
  // const task = new Task(req.body);
  const task = new Task({
    ...req.body,
    owner: req.user._id
  });
  try {
    await task.save();

    res.status(201).send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

//GET /tasks   --all tasks
//GET /tasks?completed=true||false  --filtering
//GET /tasks?limit=10&skip=20 --pagination
//GET /tasks?sortBy=createdAt:asc  OR ?sortBy=createdAt_ desc --//(asc=1  desc=-1) (use specail char to separate options)
router.get('/tasks', auth, async (req, res) => {
  try {
    const match = {};
    const sort = {};

    if (req.query.completed) {
      match.completed = req.query.completed === 'true';
    }

    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(':');
      sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }

    await req.user
      .populate({
        path: 'tasks',
        match,
        options: {
          limit: parseInt(req.query.limit),
          skip: parseInt(req.query.skip),
          sort
        }
      })
      .execPopulate();
    res.send(req.user.tasks);

    // // one way
    // const tasks = req.query.completed
    //   ? await Task.find({ owner: req.user._id, completed: true })
    //   : await Task.find({ owner: req.user._id });

    // res.send(tasks);

    //or another way to get users tasks ?filtered
    // const match = {};
    // if (req.query.completed === 'true') {
    //   match.completed = true;
    // } else if (req.query.completed === 'false') {
    //   match.completed = false;
    // }
  } catch (e) {
    res.status(500).send('Server error');
  }
});

//get task by id
router.get('/tasks/:id', auth, async (req, res) => {
  try {
    // const task = await Task.findById({ _id: req.params.id });
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id
    });
    if (!task) return res.status(404).send({ msg: 'Task not found' });

    res.send(task);
  } catch (e) {
    res.status(500).send('Server Error!');
    console.log(e);
  }
});

//update task
router.patch('/tasks/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['description', 'completed'];
  const isValidOperation = updates.every(update =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation)
    return res.status(400).send({ error: 'Invalid Update' });

  try {
    // const task = await Task.findById(req.params.id);
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id
    });
    if (!task) return res.status(404).send('Task not found');

    updates.forEach(update => (task[update] = req.body[update]));

    await task.save();

    res.send(task);

    //other way before ref: and auth
    // const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
    //   new: true,
    //   runValidators: true
    // });
  } catch (e) {
    res.status(400).send(e);
  }
});

//delete task
router.delete('/tasks/:id', auth, async (req, res) => {
  try {
    // const task = await Task.findByIdAndDelete(req.params.id);
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!task) return res.status(404).send('Task not found.');

    res.send(task);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

module.exports = router;
