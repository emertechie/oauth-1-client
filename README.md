oauth-1-client
==============

Promise-based OAuth 1 client for node.js

# Install

```
npm install oauth-1-client
```

# Overview

Promise-based OAuth 1 client for node.js based on the [node-auth](https://github.com/ciaranj/node-oauth) library.

# Usage

```
var odeskClient = new OAuth1Client({
    key: odeskConfig.apiKey,
    secret: odeskConfig.sharedSecret,
    callbackURL: odeskConfig.callbackURL,
    requestUrl: 'https://www.odesk.com/api/auth/v1/oauth/token/request',
    accessUrl: 'https://www.odesk.com/api/auth/v1/oauth/token/access',
    apiHostName: 'www.odesk.com' 
});
```

Note: The `apiHostName` option is used to construct a base URL (https:// based) for all relative paths. See below.

Each method on the API returns back a Javascript promise object.

If using a version of node which supports ES6 generators, a sample usage might look like:

```
var response = yield odeskClient.requestToken();

var tempCredentials = {
    token: response.token,
    tokenSecret: response.tokenSecret
};

// Store `tempCredentials` somewhere and redirect user
// (there might be a URL provided in `response.authorizeUrl` - consult your OAuth provider docs).
```

Then in your OAuth callback:

```
var verifier = (get it from URL or request header depending on your provider);
var prevCredentials = (load previously stored credentials from above);
var response = yield odeskClient.accessToken(prevCredentials.token, prevCredentials.tokenSecret, verifier);

var finalCredentials = {
    token: response.token,
    tokenSecret: response.tokenSecret
};
// store `finalCredentials` somewhere

// Good to go now. Make sure to call .auth(...) function first to set the credentials:
var authODeskClient = odeskClient.auth(finalCredentials.token, finalCredentials.tokenSecret);

// Then use get/put/post/delte methods as you'd expect:
var relativeUrl = util.format('/gds/timereports/v1/providers/%s/hours', userRef);
var response = yield authODeskClient.get(relativeUrl, params);
``` 

# License

MIT
