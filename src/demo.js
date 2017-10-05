/**
 * Import dependencies here
 */
const   hmacSHA256 = require("crypto-js/hmac-sha256"),
        hexEncoding = require("crypto-js/enc-hex"),
        Router = require('./router'),
        Response = require('./response'),
        CustomResponse = require('./customResponse'),
        AWS = require('aws-sdk');


/**
 * Import handlers here
 */
const   externalHandler = require("./handlers/externalHandler"),
        fetchApplicationsHandler = require("./handlers/fetchApplicationsHandler"), // DynamoDB use-case
        fetchUsersHandler = require("./handlers/fetchUsersHandler"); // Cognito use-case


/**
 * Setup global variables here
 */
const   Intercom = {
    secret: 'INTERCOM SECRET'
};


exports.handler = (event, context, callback) => {

    const   router = new Router(event, context),
            response = new CustomResponse({
               "Access-Control-Allow-Origin": "*"
            });

    router.route(
        "/test/{id}",
        "POST",
        function ({requestBody, queryStringParameters, pathParameters, headers, callback}) {
            return new Response({
                requestBody, pathParameters, queryStringParameters, headers
            })
        }
    );

    router.route("/applications", "GET", fetchApplicationsHandler);

    router.route("/users", "GET", fetchUsersHandler);

    router.route("/hash", "POST", function(request) {
        if (request.email === undefined) {
            return new Response({
                success: false,
                errorMessage: "No email defined"
            }, 400);
        }

        return new Response({
            hash: hmacSHA256(request.email, Intercom.secret).toString(hexEncoding)
        });
    });

    router.route("/external", "POST", externalHandler);

    router.route("/test", "GET", function ({requestBody}, response) {
        return response.send();
    });

    router.process(callback, response);
};