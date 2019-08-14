const mongoose = require('mongoose');

mongoose.connect(
  process.env.MONGODB_URL,
  {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  },
  err => {
    err
      ? console.log('Unable to connect')
      : console.log('Connected to mongodb....');
  }
);
