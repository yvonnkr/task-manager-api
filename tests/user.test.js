const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user');
const { userOneId, userOne, setUpDatabase } = require('./fixtures/db');

beforeEach(setUpDatabase);

test('should signup a new user', async () => {
  const response = await request(app)
    .post('/users')
    .send({
      name: 'Yvonne',
      email: 'yvonnkr86@gmail.com',
      age: 33,
      password: '1234567'
    })
    .expect(201);

  //Other Examples of other things we could test --Optional

  //Assert that the database was changed correctly
  const user = await User.findById(response.body.user._id);
  expect(user).not.toBeNull();

  //Assertions about the response
  expect(response.body).toMatchObject({
    user: {
      name: 'Yvonne',
      email: 'yvonnkr86@gmail.com'
    },
    token: user.tokens[0].token
  });

  //Assert that plaintext password is not stored in DB
  expect(user.password).not.toBe('1234567');
});

test('should login existing user', async () => {
  const res = await request(app)
    .post('/users/login')
    .send({
      email: userOne.email,
      password: userOne.password
    })
    .expect(200);

  //Assert that token in response matches users second token
  const user = await User.findById(userOneId);
  expect(res.body.token).toBe(user.tokens[1].token);
});

test('should not login nonexistent user / credentials dont match', async () => {
  await request(app)
    .post('/users/login')
    .send({
      email: 'non@user.com',
      password: 'badpassword'
    })
    .expect(400);
});

test('should get profile for user', async () => {
  await request(app)
    .get('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});

test('should not get profile for unauthenticated user', async () => {
  await request(app)
    .get('/users/me')
    .send()
    .expect(401);
});

test('should delete account for user', async () => {
  await request(app)
    .delete('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  //Assert that user is deleted
  const user = await User.findById(userOneId);
  expect(user).toBeNull();
});

test('should not delete account for unauthenticated user', async () => {
  await request(app)
    .delete('/users/me')
    .send()
    .expect(401);
});

test('should upload avatar image', async () => {
  await request(app)
    .post('/users/me/avatar')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .attach('avatar', 'tests/fixtures/profile-pic.jpg')
    .expect(200);

  const user = await User.findById(userOneId);
  expect(user.avatar).toEqual(expect.any(Buffer));
  //expect.any(Buffer) == typeOf(Buffer)
});

test('should update valid user fields', async () => {
  const res = await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      name: 'John'
    })
    .expect(200);

  const user = await User.findById(userOneId);

  expect(res.body.name).toBe('John');
  expect(user.name).toEqual('John');
});

test('should not update invalid user fields', async () => {
  await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      location: 'uk'
    })
    .expect(400);
});
