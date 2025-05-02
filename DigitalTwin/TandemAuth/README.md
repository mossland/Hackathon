# Forge-3legged-Node-Cli
a simple demo working with 3legged token process of Forge in Node command line

# Setup

For using this sample, you will need Developer credentials of Forge. Visit the [Forge Developer](https://developer.autodesk.com), Log in or Sign up, follow the steps to create the Application. For this test, use <b>http://localhost:1234/token/forgeoauth</b> as redirect_uri. Finally, take note of the <b>client_id</b> and <b>client_secret</b> and input to [config.js](./config.js). 

# Test
  * The code sample demos  3 legged token process
  
  * run 
  ```
  npm install
  ```
  * run 
  ```
  node index.js
  ``` 
  or
  ```
  npm test
  ```

  * a browser will pop out to ask for loging Autodesk account, after granted, it will be redirected to the code.
  * command line will dump the token and refresh token.
  * a progress bar starts, after specific time, a new token and refresh token will be generated.
