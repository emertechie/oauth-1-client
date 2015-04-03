var assert = require('assert');
var OAuth = require('OAuth');
var url = require('url');
var Promise = require('promise');

require('extend-error');
var HttpApiError = Error.extend('HttpApiError');

var Client = function(options) {
    assert(options.key, 'Must provide API key');
    assert(options.secret, 'Must provide API secret');
    assert(options.callbackURL, 'Must provide API callbackURL');
    assert(options.requestUrl, 'Must provide requestUrl');
    assert(options.accessUrl, 'Must provide accessUrl');
    assert(options.apiHostName, 'Must provide apiHostName');

    this.apiKey = options.key;
    this.apiSecret = options.secret;
    this.callbackURL = options.callbackURL;
    this.apiHostName = options.apiHostName;

    this.oauthClient = new OAuth.OAuth(
        options.requestUrl,
        options.accessUrl,
        this.apiKey,
        this.apiSecret,
        '1.0',
        this.callbackURL,
        'HMAC-SHA1');
};

Client.prototype.auth = function(token, secret) {
    assert(token, 'Must provide token');
    assert(secret, 'Must provide secret');

    this.authenticatedToken = token;
    this.authenticatedSecret = secret;
    return this;
};

Client.prototype.get = function(path, pageOrQuery) {
    assert(this.authenticatedToken, 'Must set authentication token first');
    assert(this.authenticatedSecret, 'Must set authentication secret first');

    var url = buildUrl(this.apiKey, this.apiSecret, this.apiHostName, path, pageOrQuery);
    return new Promise(function(resolve, reject) {
        var responseHandler = createResponseHandler(resolve, reject);
        this.oauthClient.get(url, this.authenticatedToken, this.authenticatedSecret, responseHandler);
    }.bind(this));
};

Client.prototype.put = function(path, content) {
    assert(this.authenticatedToken, 'Must set authentication token first');
    assert(this.authenticatedSecret, 'Must set authentication secret first');

    var url = buildUrl(this.apiKey, this.apiSecret, this.apiHostName, path);
    return new Promise(function(resolve, reject) {
        var responseHandler = createResponseHandler(resolve, reject);
        this.oauthClient.put(url, this.authenticatedToken, this.authenticatedSecret, content, responseHandler);
    }.bind(this));
};

Client.prototype.post = function(path, content) {
    assert(this.authenticatedToken, 'Must set authentication token first');
    assert(this.authenticatedSecret, 'Must set authentication secret first');

    var url = buildUrl(this.apiKey, this.apiSecret, this.apiHostName, path);
    return new Promise(function(resolve, reject) {
        var responseHandler = createResponseHandler(resolve, reject);
        this.oauthClient.post(url, this.authenticatedToken, this.authenticatedSecret, content, responseHandler);
    }.bind(this));
};

Client.prototype['delete'] = function(path) {
    assert(this.authenticatedToken, 'Must set authentication token first');
    assert(this.authenticatedSecret, 'Must set authentication secret first');

    var url = buildUrl(this.apiKey, this.apiSecret, this.apiHostName, path);
    return new Promise(function(resolve, reject) {
        var responseHandler = createResponseHandler(resolve, reject);
        this.oauthClient['delete'](url, this.authenticatedToken, this.authenticatedSecret, responseHandler);
    }.bind(this));
};

Client.prototype.requestToken = function(extraParams) {
    return new Promise(function(resolve, reject) {
        this.oauthClient.getOAuthRequestToken(extraParams || {}, function(err, oauthToken, oauthTokenSecret, parsedQueryString) {
            if (err) {
                return reject(err);
            }
            resolve({
                token: oauthToken,
                tokenSecret: oauthTokenSecret,
                authorizeUrl: parsedQueryString.login_url
            });
        });
    }.bind(this));
};

Client.prototype.accessToken = function(token, secret, verifier) {
    return new Promise(function(resolve, reject) {
        this.oauthClient.getOAuthAccessToken(token, secret, verifier, function (err, oauthAccessToken, oauthAccessTokenSecret) {
            if (err) {
                return reject(err);
            }
            resolve({
                token: oauthAccessToken,
                tokenSecret: oauthAccessTokenSecret
            });
        });
    }.bind(this));
};

function createResponseHandler(resolve, reject) {
    return function responseHandler(err, data, res) {
        if (err) {
            return reject(err);
        }
        if (res.statusCode.toString()[0] !== '2') {
            return reject(new HttpApiError({ statusCode: res.statusCode, body: data }));
        }
        if (typeof data === 'string') {
            try {
                var parsedBody = JSON.parse(data || '{}');
                resolve({
                    statusCode: res.statusCode,
                    body: parsedBody,
                    headers: res.headers
                });
            } catch (err) {
                reject('Error parsing JSON response from API. Error:' + err);
            }
        }
    };
}

function buildUrl(apiKey, apiSecret, apiHostName, path, pageOrQuery) {
    if (apiKey === null) {
        throw new Error('Must provide apiKey');
    }
    if (apiSecret === null) {
        throw new Error('Must provide apiSecret');
    }
    if (path === null) {
        throw new Error('Must provide a path');
    }
    var query = (pageOrQuery && typeof pageOrQuery === 'object')
        ? pageOrQuery
        : {};
    if (apiKey && !apiSecret) {
        query.api_key = this.apiKey;
    }
    return url.format({
        protocol: "https:",
        hostname: apiHostName,
        pathname: path,
        query: query
    });
}

module.exports = Client;