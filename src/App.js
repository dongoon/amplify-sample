import React, { Component } from 'react';
import { API, graphqlOperation } from "aws-amplify";
import { listPosts } from './graphql/queries';

class App extends Component {

  state = {
    posts: []
  }

  async componentDidMount() {
    try {
      const posts = await API.graphql(graphqlOperation(listPosts))
      console.log('posts: ', posts)
    } catch (e) {
      console.log(e)
    }
  }

  render() {
    return (
      <div className="App">
      </div>
    )
  }
}

export default App;
