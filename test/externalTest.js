const   assert = require('assert'),
        externalHandler = require("../handlers/externalHandler");

/**
 * A basic test that will check if the external handler will return a proper
 * stringified response
 */
describe("ExternalHandler", function () {
    describe("Returns request body when it's received", function () {
        it("should return the stringified object it has received in the response body", function () {
            const request = {
                body: {
                    test: "this",
                    is: true
                }
            };

            const response = externalHandler(request.body, function() {});

            assert.equal(JSON.stringify(request), response.body);
        })
    });
});