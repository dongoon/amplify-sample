import React, { Component } from 'react'
import { API, graphqlOperation } from 'aws-amplify'
import { listPosts } from './graphql/queries'
import { createPost } from './graphql/mutations'
import { onCreatePost } from './graphql/subscriptions'

import Amplify, { Auth, Hub } from 'aws-amplify';
import awsconfig from './aws-exports';
Amplify.configure(awsconfig);

class App extends Component {
  state = {
    posts: [],
    content: '',
    user: null,
    customState: null,
  }

  async componentDidMount() {
    Hub.listen('auth', ({ payload: { event, data } }) => {
      switch (event) {
        case 'signIn':
          this.setState({ user: data })
          break
        case 'signOut':
          this.setState({ user: null })
          break
        case 'customOAuthState':
          this.setState({ customState: data })
          break
        default:
          this.setState({ user: null })
          break
      }
    });

    Auth.currentAuthenticatedUser()
      .then(user => {
        this.setState({ user })
        this.afterLogin()
      })
      .catch(() => console.log("Not signed in.."))
  }

  async afterLogin() {
    API.graphql(graphqlOperation(listPosts))
      .then((posts) => {
        console.log('posts: ', posts)
        this.setState({ posts: posts.data.listPosts.items })
      })
      .catch((e) => console.log(e))

    API.graphql(graphqlOperation(onCreatePost)).subscribe({
      next: (eventData) => {
        console.log('eventData: ', eventData)
        const post = eventData.value.data.onCreatePost
        const posts = [...this.state.posts, post]
        this.setState({ posts })
      }
    })
  }

  createPost = async () => {
    if (this.state.content === '') return

    const createPostInput = {
      content: this.state.content,
      account: this.state.user.attributes.email,
    }
    API.graphql(graphqlOperation(createPost, { input: createPostInput }))
      .then((o) => {
        this.setState({ content: "" })
      })
      .catch((e) => console.log(e))
  }

  onChange = e => {
    this.setState({ [e.target.name]: e.target.value })
  }

  render() {
    const { user, posts } = this.state
    const sortedPosts = posts.sort((a, b) => {
      if (Date.parse(a.createdAt) < Date.parse(b.createdAt)) return -1
      if (Date.parse(a.createdAt) > Date.parse(b.createdAt)) return 1
      return 0
    })

    const userMessage = <div className="userMessage">
      <div className="you-say">
        <input value={this.state.content} name="content" onChange={this.onChange} className="your-comment" />
        <button onClick={this.createPost}>送信</button>
      </div>
      <ul className="comments">
        {
          sortedPosts.map((post) => {
            return <li key={post.id || 'new'} className="comment">
              <div className="account-name">{post.account || '名無し'}</div>
              <div className="content">{post.content}</div>
            </li>
          })
        }
      </ul>
      <button onClick={() => Auth.signOut()}>サインアウト</button>
    </div>
    const loginButton =  <button onClick={() => Auth.federatedSignIn({provider: 'Google'})}>Googleサインイン</button>

    return (
      <div className="App">
        { user ? userMessage : loginButton }
      </div>
    )
  }
}

export default App;
