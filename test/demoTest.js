const   assert = require('assert'),
    demoHandler = require("../src/demo").handler;


const event = {
    "path": undefined,
    "headers": {
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Encoding": "gzip, deflate, lzma, sdch, br",
        "Accept-Language": "en-US,en;q=0.8",
        "CloudFront-Forwarded-Proto": "https",
        "CloudFront-Is-Desktop-Viewer": "true",
        "CloudFront-Is-Mobile-Viewer": "false",
        "CloudFront-Is-SmartTV-Viewer": "false",
        "CloudFront-Is-Tablet-Viewer": "false",
        "CloudFront-Viewer-Country": "US",
        "Content-type": "application/json",
        "Host": "wt6mne2s9k.execute-api.us-west-2.amazonaws.com",
        "Upgrade-Insecure-Requests": "1",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.82 Safari/537.36 OPR/39.0.2256.48",
        "Via": "1.1 fb7cca60f0ecd82ce07790c9c5eef16c.cloudfront.net (CloudFront)",
        "X-Amz-Cf-Id": "nBsWBOrSHMgnaROZJK1wGCZ9PcRcSpq_oSXZNQwQ10OTZL4cimZo3g==",
        "X-Forwarded-For": "192.168.100.1, 192.168.1.1",
        "X-Forwarded-Port": "443",
        "X-Forwarded-Proto": "https"
    },
    "pathParameters": {

    },
    "requestContext": {
        "accountId": "123456789012",
        "resourceId": "us4z18",
        "stage": "test",
        "requestId": "41b45ea3-70b5-11e6-b7bd-69b5aaebc7d9",
        "identity": {
            "cognitoIdentityPoolId": "",
            "accountId": "",
            "cognitoIdentityId": "",
            "caller": "",
            "apiKey": "",
            "sourceIp": "192.168.100.1",
            "cognitoAuthenticationType": "",
            "cognitoAuthenticationProvider": "",
            "userArn": "",
            "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.82 Safari/537.36 OPR/39.0.2256.48",
            "user": ""
        },
        "resourcePath": "/{proxy+}",
        "httpMethod": "GET",
        "apiId": "wt6mne2s9k"
    },
    "resource": "/{proxy+}",
    "httpMethod": undefined,
    "queryStringParameters": {

    },
    "stageVariables": {

    }
};

/**
 * A basic sanity for handlers test
 */
describe("DemoHandler", function () {
    describe("Matches async/{id} route", function () {
        const eventOne = Object.assign({}, event);
        eventOne.path = "/async/testing";
        eventOne.resource = "/async/{id}";
        eventOne.pathParameters = {
            id: "testing"
        };
        eventOne.httpMethod = "POST";

        it("should reject the request due to the middleware role check failing", function () {
            eventOne.requestContext.authorizer = {
                claims: {
                    role: "notAdmin"
                }
            };

            demoHandler(eventOne, {}, function (error, result) {
                assert.equal(result.body, '{"success":false,"errorMessage":"Unauthorized"}');
            });
        });

        it("should let the request through with the valid role and execute the handler", function (done) {
            eventOne.requestContext.authorizer = {
                claims: {
                    role: "admin"
                }
            };


            demoHandler(eventOne, {}, function (error, result) {
                assert.equal(result.body, '{"pathParameters":{"id":"testing"}}');
                done();
            });
        });
    });
    describe("Matches sync/{id} route", function () {
        const eventTwo = Object.assign({}, event);
        eventTwo.path = "/sync/testing";
        eventTwo.resource = "/sync/{id}";
        eventTwo.pathParameters = {
            id: "testing"
        };
        eventTwo.httpMethod = "POST";

        it("should reject the request due to the middleware role check failing", function () {
            eventTwo.requestContext.authorizer = {
                claims: {
                    role: "notAdmin"
                }
            };

            demoHandler(eventTwo, {}, function (error, result) {
                assert.equal(result.body, '{"success":false,"errorMessage":"Unauthorized"}');
            });
        });

        it("should let the request through with the valid role and execute the handler", function (done) {
            eventTwo.requestContext.authorizer = {
                claims: {
                    role: "admin"
                }
            };


            demoHandler(eventTwo, {}, function (error, result) {
                assert.equal(result.body, '{"pathParameters":{"id":"testing"}}');
                done();
            });
        });
    });
});