/**
 * Import dependencies here
 */
const   Router = require('./router'),
        Response = require('./response'),
        CustomResponse = require('./customResponse');


/**
 * Import handlers here
 */
const   externalHandler = require("./handlers/externalHandler");


exports.handler = (event, context, callback) => {

    const   router = new Router(event, context),
            response = new CustomResponse({
               "Access-Control-Allow-Origin": "*"
            });

    const roleMiddleware = function (request, response, next) {
        if (!request.requestContext.authorizer || request.requestContext.authorizer.claims["role"] !== "admin") {
            return new Response({
                success: false,
                errorMessage: "Unauthorized"
            })
        }

        return next(request);
    };

    const loggerMiddleware = function (request, response, next) {
        const start = Date.now();

        response = next(request);

        //Log the duration = Date.now()-start;
        return response;
    };

    const asyncRoleMiddleware = function (request, response, next) {
        if (!request.requestContext.authorizer || request.requestContext.authorizer.claims["role"] !== "admin") {
            return request.callback(null, response.send({
                success: false,
                errorMessage: "Unauthorized"
            }));
        }

        next(request);
    };

    router.route(
        "/async/{id}",
        "POST",
        function ({requestBody, queryStringParameters, pathParameters, headers}, response, callback) {
            setTimeout(function () {
                callback(response.send({
                    pathParameters
                }));
            }, 1500);
        },
        [asyncRoleMiddleware]
    );

    router.route(
        "/sync/{id}",
        "POST",
        function ({requestBody, queryStringParameters, pathParameters, headers}, response, callback) {
            return response.send({
                    pathParameters
            });
        },
        [roleMiddleware, loggerMiddleware]  // Due to the async callbacky behavior of node, if you want to end the request
                                            // from the before middleware, it should be located before.
    );

    router.route("/external", "POST", externalHandler);

    router.route("/test", "GET", function ({requestBody}, response) {
        return response.send();
    });

    router.process(callback, response);
};