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
     * @param middleware
     */
  route(route, method, handler, middleware) {
    if (typeof handler !== "function") {
      throw new Error("Route handler is not a function");
    }

    if (this.routes[route] === undefined) {
      this.routes[route] = {};
    }

    this.routes[route][method.toUpperCase()] = { handler, middleware: middleware || [] };
  }

  /**
     * Method used to remove a route
     *
     * @param route
     */
  removeRoute(route) {
    if (this.routes[route] === undefined) {
      throw new Error("Invalid route");
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
  process(callback, responseInstance) {
    const requestEvent = this.event,
      requestMethod = this.event.httpMethod;

    let requestParameters = {
      requestBody: {},
      pathParameters: {},
      queryStringParameters: {},
      headers: {},
      stageVariables: {},
      requestContext: this.event.requestContext,
      callback: callback
    };

    if (
      this.routes[requestEvent.resource] === undefined ||
      this.routes[requestEvent.resource][requestMethod] === undefined
    ) {
      return callback(
        null,
        new Response(
          {
            success: false,
            errorMessage: "Route not found: " + requestEvent.resource + " called with method: " + requestMethod
          },
          404
        )
      );
    }

    let parsed = parseContentType(requestEvent.headers);

    if (parsed.error) {
      return callback(
        null,
        new Response(
          {
            success: false,
            errorMessage: "Canot parse content type: " + error
          },
          400
        )
      );
    }

    if (parsed.contentType && parsed.charset) {
      requestParameters["charset"] = parsed.charset;
    }

    if (requestEvent.body && requestEvent.body !== null) {
      // As headers are case insensitive they should be converted to lowercase before the check
      if (parsed.contentType === "application/x-www-form-urlencoded") {
        try {
          requestParameters["requestBody"] = qs.parse(requestEvent.body);
        } catch (err) {
          console.log("Error parsing request body from x-www-form-urlencoded : ", err, requestEvent.body);

          requestParameters["requestBody"] = requestEvent.body;
        }
      } else {
        try {
          requestParameters["requestBody"] = JSON.parse(requestEvent.body);
        } catch (err) {
          console.log("Error parsing request body from JSON: ", err, requestEvent.body);

          requestParameters["requestBody"] = requestEvent.body;
        }
      }
    }

    if (requestEvent.pathParameters && requestEvent.pathParameters !== null) {
      requestParameters["pathParameters"] = requestEvent.pathParameters;
    }

    if (requestEvent.queryStringParameters && requestEvent.queryStringParameters !== null) {
      requestParameters["queryStringParameters"] = requestEvent.queryStringParameters;
    }

    if (requestEvent.headers && requestEvent.headers !== null) {
      requestParameters["headers"] = requestEvent.headers;
    }

    if (requestEvent.stageVariables && requestEvent.stageVariables !== null) {
      requestParameters["stageVariables"] = requestEvent.stageVariables;
    }

    if (responseInstance === undefined) {
      responseInstance = new CustomResponse();
    }

    const route = this.routes[requestEvent.resource][requestMethod],
      core = generateInvocationLayers(requestParameters, route.middleware, route.handler, responseInstance, callback),
      response = core();

    if (response !== undefined && response !== null) {
      if (
        response.headers === undefined ||
        response.isBase64Encoded === undefined ||
        response.statusCode === undefined
      ) {
        console.error("Response object: ", JSON.stringify(response));
        throw new Error("Handler return value must be in a correct format");
      }

      callback(null, response);
    }
  }
}

/**
 * Method that generates the core function that contains all the middleware and the handler function
 * The list is reversed as the reducer function will start adding layers from the inside out, so the
 * first middleware in the list would have been executed last.
 *
 * @param requestParameters
 * @param middlewareList
 * @param handler
 * @param response
 * @param callback
 */
function generateInvocationLayers(requestParameters, middlewareList, handler, response, callback) {
  return middlewareList
    .concat(handler)
    .reverse()
    .reduce(
      function(sum, middleware) {
        return middleware.bind(undefined, requestParameters, response, sum);
      },
      function(result) {
        callback(null, result);
      }
    );
}

/**
 * Parses content type
 *
 * @param headers
 * @returns {*}
 */
function parseContentType(headers) {
  if (!headers) {
    return {};
  }

  try {
    let lowercase = JSON.parse(JSON.stringify(headers).toLowerCase());

    if (!lowercase["content-type"]) {
      return {};
    }

    const charset = value => {
      let parts = value.split("=");
      return parts.length === 2 && parts[0].trim() === "charset" ? { charset: parts[1].trim() } : {};
    };

    return lowercase["content-type"]
      .split(";")
      .map(i => i.trim())
      .reduce((acc, part, index) => Object.assign(acc, index == 0 ? { contentType: value } : charset(part)), {});
  } catch (err) {
    return { error: err };
  }
}

module.exports = Router;
