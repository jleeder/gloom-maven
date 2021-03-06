import React from 'react';
import { withRouter } from 'react-router-dom';
import { graphql, compose } from 'react-apollo';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';

class CreateParty extends React.Component {
  static propTypes = {
    loggedInUserQuery: PropTypes.shape({
      loggedInUser: PropTypes.shape({
        id: PropTypes.string,
      }),
      loading: PropTypes.bool,
    }).isRequired,
    history: PropTypes.shape({
      replace: PropTypes.func,
    }).isRequired,
    createPartyMutation: PropTypes.func.isRequired,
  }

  state = {
    name: '',
    location: 'Gloomhaven',
  }

  handleSubmit = async (e) => {
    e.preventDefault();

    // redirect if no user is logged in
    if (!this.props.loggedInUserQuery.loggedInUser) {
      console.warn('only logged in users can create new parties');
      return;
    }

    const { location, imageUrl, name } = this.state;
    const adminId = this.props.loggedInUserQuery.loggedInUser.id;

    const { data: { createParty: { id } } } = await this.props.createPartyMutation({
      variables: {
        name, location, imageUrl, adminId,
      },
    });
    this.props.history.replace(`/party/${id}`);
  }

  render() {
    if (this.props.loggedInUserQuery.loading) {
      return (
        <div>
          Loading
        </div>
      );
    }

    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <input
            value={this.state.name}
            placeholder="Name"
            onChange={e => this.setState({ name: e.target.value })}
          />
          <input
            value={this.state.location}
            placeholder="Location"
            onChange={e => this.setState({ location: e.target.value })}
          />

          <button type="submit">
            Create
          </button>
        </form>

      </div>
    );
  }
}

const CREATE_PARTY_MUTATION = gql`
  mutation CreatePartyMutation (
    $adminId: ID!,
    $name: String!,
    $location: String!,
  ) {
    createParty(
      adminId: $adminId,
      name: $name,
      location: $location,
    ) {
      id
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
  graphql(CREATE_PARTY_MUTATION, { name: 'createPartyMutation' }),
  graphql(LOGGED_IN_USER_QUERY, {
    name: 'loggedInUserQuery',
    options: { fetchPolicy: 'network-only' },
  }),
)(withRouter(CreateParty));
