const app = require('./app');

const port = process.env.PORT; //|| 3000 --set in config/dev.env;

app.listen(port, () => {
  console.log('Server up on port ' + port);
});
