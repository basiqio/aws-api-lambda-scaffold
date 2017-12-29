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
  route(route, method, handler) {
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

    let functionParameters = {
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

    let { contentType, charset, error } = parseContentType(requestEvent.headers);

    if (error) {
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

    if (contentType && charset) {
      functionParameters["charset"] = charset;
    }

    if (requestEvent.body && requestEvent.body !== null) {
      // As headers are case insensitive they should be converted to lowercase before the check
      if (contentType === "application/x-www-form-urlencoded") {
        try {
          functionParameters["requestBody"] = qs.parse(requestEvent.body);
        } catch (err) {
          console.log("Error parsing request body from x-www-form-urlencoded : ", err, requestEvent.body);

          functionParameters["requestBody"] = requestEvent.body;
        }
      } else {
        try {
          functionParameters["requestBody"] = JSON.parse(requestEvent.body);
        } catch (err) {
          console.log("Error parsing request body from JSON: ", err, requestEvent.body);

          functionParameters["requestBody"] = requestEvent.body;
        }
      }
    }

    if (requestEvent.pathParameters && requestEvent.pathParameters !== null) {
      functionParameters["pathParameters"] = requestEvent.pathParameters;
    }

    if (requestEvent.queryStringParameters && requestEvent.queryStringParameters !== null) {
      functionParameters["queryStringParameters"] = requestEvent.queryStringParameters;
    }

    if (requestEvent.headers && requestEvent.headers !== null) {
      functionParameters["headers"] = requestEvent.headers;
    }

    if (requestEvent.stageVariables && requestEvent.stageVariables !== null) {
      functionParameters["stageVariables"] = requestEvent.stageVariables;
    }

    if (responseInstance === undefined) {
      responseInstance = new CustomResponse();
    }

    const response = this.routes[requestEvent.resource][requestMethod](functionParameters, responseInstance);
    if (response !== undefined && response !== null) {
      if (
        response.headers === undefined ||
        response.isBase64Encoded === undefined ||
        response.statusCode === undefined
      ) {
        console.error("Response object: ", response);
        throw new Error("Handler return value must be in a correct format");
      }

      callback(null, response);
    }
  }
}

function parseContentType(headers) {
  if (!headers) {
    return { error: "Headers are not defined." };
  }

  try {
    let lowercaseHeaders = JSON.parse(JSON.stringify(headers).toLowerCase());
    if (!lowercaseHeaders["content-type"]) {
      return { error: "Missing content-type header." };
    }

    let parts = lowercaseHeaders["content-type"].split(";").map(trim);

    function charsetValue(value) {
      let parts = value.split("=");
      return parts.length === 2 && parts[0].trim() === "charset" ? parts[1].trim() : undefined;
    }

    return {
      charset: parts.slice(1, parts.length).reduce(result, value => (result ? result : charsetValue(value)), undefined),
      contentType: parts[0]
    };
  } catch (err) {
    return { error: err };
  }
}

module.exports = Router;
