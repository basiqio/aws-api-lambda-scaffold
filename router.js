const Response = require("./response");

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
     * @param callback
     */
    process (callback) {
        const requestEvent = this.event,
              requestMethod = this.event.httpMethod;

        let functionParameters = {
            requestBody: {},
            pathParameters: {},
            queryStringParameters: {},
            headers: {},
            stageVariables: {},
            callback: callback
        };

        if (this.routes[requestEvent.resource] === undefined
            || this.routes[requestEvent.resource][requestMethod] === undefined) {

            return callback(null, new Response({
                error: true,
                errorMessage: 'Route not found: ' +
                    requestEvent.resource + ' called with method: ' + requestMethod
            }, 404));
        }

        if (requestEvent.body && requestEvent.body !== null) {
            functionParameters['requestBody'] = JSON.parse(requestEvent.body);
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

        const response = this.routes[requestEvent.resource][requestMethod](functionParameters);

        if (response !== undefined && response !== null) {
            if (!(response instanceof Response)) {
                throw new Error("Handler return value must be an instance of the Response object");
            }
            callback(null, response);
        }
    }

}

module.exports = Router;