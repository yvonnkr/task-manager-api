const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/user');
const auth = require('../middleware/auth');
const {
  sendWelcomeEmail,
  sendCancelationEmail
} = require('../emails/accounts');
const router = new express.Router();

//==============================================
//create user
router.post('/users', async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();
    sendWelcomeEmail(user.email, user.name);

    const token = await user.generateAuthToken();

    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e.message);
  }
});

//==============================================
//log in user
router.post('/users/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );

    const token = await user.generateAuthToken(); //user not User

    res.send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

//==============================================
//logout user
router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      token => token.token !== req.token
    );

    await req.user.save();
    res.send('Logged out Successfully.');
  } catch (e) {
    res.status(500).send('Server Error.');
  }
});

//==============================================
//logout all
router.post('/users/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = [];

    await req.user.save();
    res.send('All sessions logged out successfully.');
  } catch (e) {
    res.status(500).send('Server Error.');
    console.log(e);
  }
});

//==============================================
//get user profile when authenticated
router.get('/users/me', auth, async (req, res) => {
  res.send(req.user);
});

//==============================================
//#region  get all users --removed

// router.get('/users', auth, async (req, res) => {
//   try {
//     const users = await User.find();
//     res.send(users);
//   } catch (e) {
//     res.status(500).send('Server error');
//   }
// });
//#endregion

//get user by id --not needed --get user profile above
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById({ _id: req.params.id });
    if (!user) return res.status(404).send('User not found');

    res.send(user);
  } catch (e) {
    res.status(500).send('Server error');
  }
});

//==============================================
//update / patch user
router.patch('/users/me', auth, async (req, res) => {
  //check updates
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'age', 'password', 'email'];
  const isValidOperation = updates.every(update =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation)
    return res.status(400).send({ error: 'Invalid updates!' });

  try {
    updates.forEach(update => (req.user[update] = req.body[update]));

    await req.user.save();

    res.send(req.user);

    //before code using findByIdAndUpdate --this will not allow middleware to work properly
    // const user = await User.findById(req.params.id);
    // if (!user) return res.status(404).send('User not found');
    // const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    //   new: true,
    //   runValidators: true
    // });
  } catch (e) {
    res.status(400).send(e.message);
  }
});

//==============================================
//delete user
router.delete('/users/me', auth, async (req, res) => {
  try {
    // const user = await User.findByIdAndDelete(req.user._id);
    // if (!user) return res.status(404).send('User already deleted.');

    await req.user.remove();
    sendCancelationEmail(req.user.email, req.user.name);
    res.send(req.user);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

//================AVATAR Endpoint==============================
//Endpoint for avatar  --CRUD
const upload = multer({
  // dest: 'avatars', //to save to this directory --//out to access the buffer
  limits: {
    fileSize: 1000000
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/.(jpg|jpeg|png)$/)) {
      return cb(new Error('Please upload an image file only. '));
    }

    cb(undefined, true);
  }
});
//prettier-ignore
router.post('/users/me/avatar', [auth , upload.single('avatar')], async (req, res) => {
  const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()
  req.user.avatar =  buffer;
  await req.user.save();
  res.send({msg: 'Avatar Added.'});
}, (err,req,res,next) => {res.status(400).send({error: err.message})});

//==============================================
//Delete Avatar
router.delete('/users/me/avatar', auth, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.send();
});

//==============================================
//fetch avatar --serving up file
router.get('/users/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.avatar) {
      throw new Error();
    }

    res.set('Content-Type', 'image/png');
    res.send(user.avatar);
  } catch (e) {
    res.status(404).send();
  }
});

module.exports = router;
