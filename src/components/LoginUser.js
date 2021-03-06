import React from 'react';
import { withRouter } from 'react-router-dom';
import { graphql, compose } from 'react-apollo';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';

class CreateLogin extends React.Component {
  static propTypes = {
    loggedInUserQuery: PropTypes.shape({
      loggedInUser: PropTypes.shape({
        id: PropTypes.string,
      }),
      loading: PropTypes.bool,
      refetch: PropTypes.func,
    }).isRequired,
    history: PropTypes.shape({
      replace: PropTypes.func,
    }).isRequired,
    authenticateUserMutation: PropTypes.func.isRequired,
  }

  state = {
    email: '',
    password: '',
  }

  authenticateUser = async () => {
    const { email, password } = this.state;

    const response = await this.props.authenticateUserMutation({ variables: { email, password } });
    localStorage.setItem('graphcoolToken', response.data.authenticateUser.token);
    await this.props.loggedInUserQuery.refetch();
    this.props.history.replace('/');
  }

  render() {
    if (this.props.loggedInUserQuery.loading) {
      return (
        <div>
          Loading...
        </div>
      );
    }

    // redirect if user is logged in
    if (
      this.props.loggedInUserQuery.loggedInUser
      && this.props.loggedInUserQuery.loggedInUser.id
    ) {
      console.warn('already logged in');
      this.props.history.replace('/');
    }

    return (
      <div className="w-100 pa4 flex justify-center">
        <div style={{ maxWidth: 400 }} className="">
          <input
            value={this.state.email}
            placeholder="Email"
            onChange={e => this.setState({ email: e.target.value })}
          />
          <input
            type="password"
            value={this.state.password}
            placeholder="Password"
            onChange={e => this.setState({ password: e.target.value })}
          />

          <button type="submit" onClick={this.authenticateUser}>
            Log in
          </button>
        </div>
      </div>
    );
  }
}

const AUTHENTICATE_USER_MUTATION = gql`
  mutation AuthenticateUserMutation ($email: String!, $password: String!) {
    authenticateUser(email: $email, password: $password) {
      token
    }
  }
`;

const LOGGED_IN_USER_QUERY = gql`
  query LoggedInUserQuery {
    loggedInUser {
      id
    }
  }
`;
export default compose(
  graphql(AUTHENTICATE_USER_MUTATION, { name: 'authenticateUserMutation' }),
  graphql(LOGGED_IN_USER_QUERY, {
    name: 'loggedInUserQuery',
    options: { fetchPolicy: 'network-only' },
  }),
)(withRouter(CreateLogin));
