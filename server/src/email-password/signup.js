const { fromEvent } = require('graphcool-lib');
const bcrypt = require('bcryptjs');
const validator = require('validator');

function getGraphcoolUser(api, email) {
  return api.request(`
    query {
      User(email: "${email}") {
        id
      }
    }`)
    .then((userQueryResult) => {
      if (userQueryResult.error) {
        return Promise.reject(userQueryResult.error);
      }
      return userQueryResult.User;
    });
}

function createGraphcoolUser(api, email, passwordHash, name) {
  return api.request(`
    mutation {
      createUser(
        email: "${email}",
        password: "${passwordHash}",
        name: "${name}"
      ) {
        id
      }
    }`)
    .then(userMutationResult => userMutationResult.createUser.id);
}

module.exports = function signup(event) {
  if (!event.context.graphcool.pat) {
    console.log('Please provide a valid root token!');
    return { error: 'Email Signup not configured correctly.' };
  }

  const { email, password, name } = event.data;
  const graphcool = fromEvent(event);
  const api = graphcool.api('simple/v1');
  const SALT_ROUNDS = 10;
  const salt = bcrypt.genSaltSync(SALT_ROUNDS);

  if (validator.isEmail(email)) {
    return getGraphcoolUser(api, email)
      .then((graphcoolUser) => {
        if (graphcoolUser === null) {
          return bcrypt.hash(password, salt)
            .then(hash => createGraphcoolUser(api, email, hash, name));
        }
        return Promise.reject(new Error('Email already in use'));
      })
      .then(graphcoolUserId => graphcool.generateAuthToken(graphcoolUserId, 'User')
        .then(token => ({ data: { id: graphcoolUserId, token } })))
      .catch((error) => {
        console.log(error);

        // don't expose error message to client!
        return { error: 'An unexpected error occured.' };
      });
  }
  return { error: 'Not a valid email' };
};
