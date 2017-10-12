const Response = require("./response"),
    CustomResponse = require("./customResponse"),
    qs = require("querystring");

/**
 * Router class that will handle the routing
 */
class Router {

    /**
     * Router constructor
     *
     * @param event
     * @param context
     */
    constructor(event, context) {
        this.routes = {};

        this.event = event;
        this.context = context;

        this.defaultBody = {
            event,
            context
        };
    }

    /**
     * Method used to register a route
     *
     * @param route
     * @param method
     * @param handler
     */
    route (route, method, handler) {
        if (typeof handler !== "function") {
            throw new Error("Route handler is not a function");
        }

        if (this.routes[route] === undefined) {
            this.routes[route] = {};
        }

        this.routes[route][method.toUpperCase()] = handler;
    }

    /**
     * Method used to remove a route
     *
     * @param route
     */
    removeRoute (route) {
        if (this.routes[route] === undefined) {
            throw new Error('Invalid route');
        }

        delete this.routes[route];
    }

    /**
     * Method used to process the request according to the
     * route visited
     *
     * @param responseInstance
     * @param callback
     */
    process (callback, responseInstance) {
        const requestEvent = this.event,
            requestMethod = this.event.httpMethod;

        let functionParameters = {
            requestBody: {},
            pathParameters: {},
            queryStringParameters: {},
            headers: {},
            stageVariables: {},
            requestContext: this.event.requestContext,
            callback: callback
        };

        if (this.routes[requestEvent.resource] === undefined
            || this.routes[requestEvent.resource][requestMethod] === undefined) {

            return callback(null, new Response({
                success: false,
                errorMessage: 'Route not found: ' +
                requestEvent.resource + ' called with method: ' + requestMethod
            }, 404));
        }

        const parsedContentType = parseContentType(requestEvent.headers);

        if (parsedContentType && parsedContentType.charset) {
            functionParameters['charset'] = parsedContentType.charset;
        }

        if (requestEvent.body && requestEvent.body !== null) {

            // As headers are case insensitive they should be converted to lowercase before the check
            if (parsedContentType && parsedContentType.contentType === "application/x-www-form-urlencoded") {
                try {
                    functionParameters['requestBody'] = qs.parse(requestEvent.body);
                } catch (err) {
                    console.log("Error parsing request body from x-www-form-urlencoded : ", err, requestEvent.body);

                    functionParameters['requestBody'] = requestEvent.body;
                }
            } else {
                try {
                    functionParameters['requestBody'] = JSON.parse(requestEvent.body);
                } catch (err) {
                    console.log("Error parsing request body from JSON: ", err, requestEvent.body);

                    functionParameters['requestBody'] = requestEvent.body;
                }
            }
        }

        if (requestEvent.pathParameters && requestEvent.pathParameters !== null) {
            functionParameters['pathParameters'] = requestEvent.pathParameters;
        }

        if (requestEvent.queryStringParameters && requestEvent.queryStringParameters !== null) {
            functionParameters['queryStringParameters'] = requestEvent.queryStringParameters;
        }

        if (requestEvent.headers && requestEvent.headers !== null) {
            functionParameters['headers'] = requestEvent.headers;
        }

        if (requestEvent.stageVariables && requestEvent.stageVariables !== null) {
            functionParameters['stageVariables'] = requestEvent.stageVariables;
        }

        if (responseInstance === undefined) {
            responseInstance = new CustomResponse();
        }

        const response = this.routes[requestEvent.resource][requestMethod](functionParameters, responseInstance);

        if (response !== undefined && response !== null) {
            if (response.headers === undefined
                || response.isBase64Encoded === undefined
                || response.statusCode === undefined) {
                console.error("Response object: ", response);
                throw new Error("Handler return value must be in a correct format");
            }

            callback(null, response);
        }
    }

}

/**
 * Converts all of the object contents to lowercase, both keys and values
 *
 * @param object
 * @returns {*}
 */
function convertObjectKeysToLowercase(object) {
    if (!object) {
        return object;
    }

    try {
        return JSON.parse(JSON.stringify(object).toLowerCase());
    } catch (err) {
        return object;
    }
}

/**
 * Parses content type header to extract data and charset
 *
 * @param headers
 * @returns {*}
 */
function parseContentType(headers) {
    if (!headers) {
        return false;
    }

    let contentTypeHeader = convertObjectKeysToLowercase(headers)['content-type'];

    if (!contentTypeHeader) {
        return false;
    }

    contentTypeHeader = contentTypeHeader.split(";").map(value => value.trim());

    const contentType = contentTypeHeader[0] ? contentTypeHeader[0] : false,
        otherData = contentTypeHeader[1] ? contentTypeHeader[1] : false,
        returnData = {contentType};

    if (otherData) {
        contentTypeHeader.shift();

        contentTypeHeader.forEach(value => {
            returnData[value.split("=")[0].trim().toLowerCase()] = value.split("=")[1].trim().toLowerCase();
        });
    }

    return returnData;
}

module.exports = Router;