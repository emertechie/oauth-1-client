var chai = require('chai');
var assert = chai.assert;
var sinon = require('sinon');

var Client = require('../lib/index');

describe('OAuth Client', function() {

    var sut, mockOAuthClient;
    beforeEach(function() {
        sut = new Client({
            key: 'apiKey',
            secret: 'apiSecret',
            callbackURL: 'callbackURL',
            requestUrl: 'requestUrl',
            accessUrl: 'accessUrl',
            apiHostName: 'apiHostName'
        });
        mockOAuthClient = sinon.mock(sut.oauthClient);
    });

    afterEach(function() {
        mockOAuthClient.verify();
    });

    describe('Using pre-authenticated client', function() {
        var preAuthClient1;
        var preAuthClient2;
        beforeEach(function() {
            preAuthClient1 = sut.auth('userKey1', 'userSecret1');
            preAuthClient2 = sut.auth('userKey2', 'userSecret2');
        });

        it('calls get(path) ok', function() {
            mockOAuthClient.expects('get').withArgs('https://apiHostName/foo', 'userKey1', 'userSecret1');
            preAuthClient1.get('/foo');

            mockOAuthClient.expects('get').withArgs('https://apiHostName/bar', 'userKey2', 'userSecret2');
            preAuthClient2.get('/bar');
        });

        it('calls get(path, query) ok', function() {
            mockOAuthClient.expects('get').withArgs('https://apiHostName/foo?a=1', 'userKey1', 'userSecret1');
            preAuthClient1.get('/foo', { a: 1 });

            mockOAuthClient.expects('get').withArgs('https://apiHostName/bar?b=2', 'userKey2', 'userSecret2');
            preAuthClient2.get('/bar', { b: 2 });
        });

        it('calls put(path, content) ok', function() {
            mockOAuthClient.expects('put').withArgs('https://apiHostName/foo', 'userKey1', 'userSecret1', { a: 1 });
            preAuthClient1.put('/foo', { a: 1 });

            mockOAuthClient.expects('put').withArgs('https://apiHostName/bar', 'userKey2', 'userSecret2', { b: 2 });
            preAuthClient2.put('/bar', { b: 2 });
        });

        it('calls post(path, content) ok', function() {
            mockOAuthClient.expects('post').withArgs('https://apiHostName/foo', 'userKey1', 'userSecret1', { a: 1 });
            preAuthClient1.post('/foo', { a: 1 });

            mockOAuthClient.expects('post').withArgs('https://apiHostName/bar', 'userKey2', 'userSecret2', { b: 2 });
            preAuthClient2.post('/bar', { b: 2 });
        });

        it('calls delete(path) ok', function() {
            mockOAuthClient.expects('delete').withArgs('https://apiHostName/foo', 'userKey1', 'userSecret1');
            preAuthClient1.delete('/foo');

            mockOAuthClient.expects('delete').withArgs('https://apiHostName/bar', 'userKey2', 'userSecret2');
            preAuthClient2.delete('/bar');
        });
    });
});