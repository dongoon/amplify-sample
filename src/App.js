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
    title: '',
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
        console.log(user)
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
        const posts = [...this.state.posts.filter(content => {
          return (content.title !== post.title)
        }), post]
        this.setState({ posts })
      }
    })
  }

  createPost = async () => {
    // バリデーションチェック
    if (this.state.title === '' || this.state.content === '') return

    // 新規登録 mutation
    const createPostInput = {
      title: this.state.title,
      content: this.state.content
    }

    // 登録処理
    try {
      const posts = [...this.state.posts, createPostInput]
      this.setState({ posts: posts, title: "", content: "" })
      await API.graphql(graphqlOperation(createPost, { input: createPostInput }))
      console.log('createPostInput: ', createPostInput)
    } catch (e) {
      console.log(e)
    }
  }

  onChange = e => {
    this.setState({ [e.target.name]: e.target.value })
  }

  render() {
    const { user } = this.state

    const userMessage = <div className="userMessage">
      <div>
        タイトル
        <input value={this.state.title} name="title" onChange={this.onChange}></input>
      </div>
      <div>
        内容
        <input value={this.state.content} name="content" onChange={this.onChange}></input>
      </div>
      <button onClick={this.createPost}>追加</button>
      <hr />
      <ul>
        {
          this.state.posts.map((post) => {
            return <li key={post.id || 'new'}>{post.title}: {post.content}</li>
          })
        }
      </ul>
      <button onClick={() => Auth.signOut()}>Sign Out</button>
    </div>
    const loginButton =  <button onClick={() => Auth.federatedSignIn({provider: 'Google'})}>Open Google</button>

    return (
      <div className="App">
        { user ? userMessage : loginButton }
      </div>
    )
  }
}

export default App;
