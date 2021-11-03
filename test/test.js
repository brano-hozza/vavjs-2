// Branislav Hozza
import assert from 'assert';
import fetch from 'node-fetch';

const TEST_USER ={
  username: '2test',
  password: 'test',
};

describe('AUTH API', function() {
  describe('Register', function() {
    it('Should return user with username and token', async function() {
      await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: TEST_USER.username,
          password: TEST_USER.password,
        }),
      })
          .then(async (res) => {
            assert.equal(res.status, 200);
            if (res.status === 200) {
              return res.json();
            }
          })
          .then((res) => {
            assert.notEqual(res.token, undefined);
          });
    });
  });
  describe('Login', function() {
    it('Should return user with username and token', async function() {
      await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: TEST_USER.username,
          password: TEST_USER.password,
        }),
      })
          .then(async (res) => {
            assert.equal(res.status, 200);
            if (res.status === 200) {
              return res.json();
            }
          })
          .then((res) => {
            assert.notEqual(res.token, undefined);
          });
    });
  });
});
