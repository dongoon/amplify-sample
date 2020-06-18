# Sample app with AWS Amplify

## 前提, 準備
### 環境
サンプル実装時の環境バージョン（これ以上であれば問題ないはず）
```shell script
❯ node -v
v13.6.0
❯ yarn -v
1.19.2
```
```shell script
yarn install
```

### Amplify CLI
https://docs.amplify.aws/cli/start/install
```shell script
npm install -g @aws-amplify/cli
``` 

### 管理者権限を付与したIAM
[AWS CLIの設定](https://docs.aws.amazon.com/ja_jp/cli/latest/userguide/cli-chap-configure.html) が済んでいる場合は不要。<br>
未設定の場合は[Amplify CLI インストール](https://docs.amplify.aws/cli/start/install) の手順を参考にして設定する。
```shell script
amplify configure
```

## サンプル動作確認 (dev)
### GCP認証APIの登録
https://console.cloud.google.com/apis/credentials
* プロジェクトが無ければ[作成](https://cloud.google.com/resource-manager/docs/creating-managing-projects?hl=ja)
* サイドメニュー > APIとサービス > 認証情報
    1. +認証情報を作成
    1. OAuthクライアントID
    1. アプリケーションの種類: ウェブアプリケーション
    1. 名前は任意、コールバックURLもこの段階では無しでOK
* **作成したAPIのClientIDとSecretを手元に記録しておく**
### 手順
1. Amplify環境初期設定
   ```shell script
   > amplify init
   ? Enter a name for the environment dev
   ? Choose your default editor: IntelliJ IDEA # 自身の環境に合わせて
   Using default provider  awscloudformation
   
   For more information on AWS Profiles, see:
   https://docs.aws.amazon.com/cli/latest/userguide/cli-multiple-profiles.html
   
   ? Do you want to use an AWS profile? Yes
   ? Please choose the profile you want to use amplify-sample # 自身の環境に合わせて
   Adding backend environment dev to AWS Amplify Console app: dw67ohnr51aqo
   ⠦ Initializing project in the cloud...
   .......
   Initialized your environment successfully.
   .......
   ```
1. 認証情報をAPIに追加
   ```shell script
   > amplify update api
   ? Please select from one of the below mentioned services: GraphQL
   ? Select from the options below Update auth settings
   ? Choose the default authorization type for the API Amazon Cognito User Pool
   Using service: Cognito, provided by: awscloudformation
    
    The current configured provider is Amazon Cognito. 
    
    Do you want to use the default authentication and security configuration? Default configuration with Social Provider (Federation)
    Warning: you will not be able to edit these selections. 
    How do you want users to be able to sign in? Username
    Do you want to configure advanced settings? No, I am done.
    What domain name prefix do you want to use? boardapp7806bdb7-7806bdb7 ## 表示されたもので構わない
    Enter your redirect signin URI: http://localhost:3000/
   ? Do you want to add another redirect signin URI No
    Enter your redirect signout URI: http://localhost:3000/
   ? Do you want to add another redirect signout URI No
    Select the social providers you want to configure for your user pool: Google ## 選択は矢印| k,j + スペース
     
    You've opted to allow users to authenticate via Google.  If you haven't already, you'll need to go to https://developers.google.com/identity and create an App ID. 
    
    ## 上「GCP認証APIの登録」で書き留めたClientIDとSecret
    Enter your Google Web Client ID for your OAuth flow:  xxxxxxxxxx.apps.googleusercontent.com
    Enter your Google Web Client Secret for your OAuth flow:  uXuXuXuXuXuXuXuXuXuX
   Successfully added auth resource
   ? Configure additional auth types? No
   
   GraphQL schema compiled successfully.
   
   Edit your schema at /Users/yasuhiko/projects/sandbox/amplify-sample/amplify/backend/api/boardapp/schema.graphql or place .graphql files in a directory at /Users/yasuhiko/projects/sandbox/amplify-sample/amplify/backend/api/boardapp/schema
   Successfully updated resource
   ```
1. AWS上にリソース作成
   結構時間かかります..
   ```shell script
   > amplify push
   ✔ Successfully pulled backend environment dev from the cloud.
   
   Current Environment: dev
   
   | Category | Resource name    | Operation | Provider plugin   |
   | -------- | ---------------- | --------- | ----------------- |
   | Api      | boardapp         | Create    | awscloudformation |
   | Auth     | boardapp7806bdb7 | Create    | awscloudformation |
   ? Are you sure you want to continue? Yes
   
   GraphQL schema compiled successfully.
   
   ? Do you want to update code for your updated GraphQL API Yes
   ? Do you want to generate GraphQL statements (queries, mutations and subscription) based on your schema types?
   This will overwrite your current graphql queries, mutations and subscriptions Yes
   ⠏ Updating resources in the cloud. This may take a few minutes...
   ....
   UPDATE_COMPLETE
   UPDATE_COMPLETE_CLEANUP_IN_PROGRESS
   ✔ Generated GraphQL operations successfully and saved at src/graphql
   ✔ All resources are updated in the cloud
   ...
   ## ※ 最後に表示される↓URLをコピーする
   Hosted UI Endpoint: https://boardappXXXXXXX-dev.auth.ap-northeast-1.amazoncognito.com/
   ```
1. Google認証APIの更新
   「GCP認証APIの登録」で登録したAPIの設定で 承認済みリダイレクトURI を登録する。<br>
   登録する値: `<前項でコピーしたURL>/oauth2/idpresponse`
1. `yarn start`

以上

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.
