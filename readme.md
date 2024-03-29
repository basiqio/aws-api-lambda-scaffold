# AWS API Gateway and Lambda function integration scaffolding for Node.js

#### Project setup
You need to install AWS-CLI.
*(pip install --upgrade --user awscli)*

You need to setup AWS-CLI with your credentials.
*(aws configure)*

You need to install mocha for running tests
*(npm install --global mocha)*

# Features
* Routing
* Response transformation
* Layered middleware

# What's new
v.2.0.0 - Added middleware, refactored code and project minification

# API Gateway setup
#### Creating a new endpoint
When creating a new method for a resource endpoint check the "Use Lambda
Proxy integration" checkbox to pass request data into the event object in
the lambda function.

# Lambda setup
#### Configuration
Select the Node.js 6+ Runtime

Lambda Node.js support: http://www.whatdoeslambdasupport.com/

# Installation
#### Using npm

```sh
npm i aws-api-lambda-scaffold-js
```

Working with the framework
==========================

#### Main function
The main handler function should be defined in the index.js file and is
the entry and exit point for the application.

Import the scaffold package:

```javascript
const scaffold = require("aws-api-lambda-scaffold-js")
```

Or import the Router and Response classes directly

```javascript
const Router = require("aws-api-lambda-scaffold-js").Router,
      Response = require("aws-api-lambda-scaffold-js").Response;
```

#### Program flow
Upon invoking the handler a Router instance should be created and passed
event and context parameters. All of the routes that need to be handled need
to be registered with the Router instance by invoking Router.route(path,
 method, handler).
The Router will handle the request and invoked the provided callback
when you invoke the Router.process(callback) method. If a route is not
found the Router will throw an error.

To instantiate the Router:

```javascript
const router = new scaffold.Router(event, context);
```

And when instantiating a Response or CustomResponse

```javascript
return new scaffold.Response(body, statusCode, isBase64Encoded, headers)
```

```javascript
const response = new scaffold.CustomResponse(headers, isBase64Encoded);

// Send the response
return response.send(body);
```

Both Response classes have a default header value of:
```js
{"Content-type": "application/json"}
```

The benefits of using a custom response and passing it to the router is that
you can share response data without having to write it multiple times.

To see an example Lambda function, view the demo.js file in the package
directory.

#### Routes

To add a route to the router after instantiation use the following

```js
router.route("/route/{param}", "GET", handler, [middleware, middleware]);
```

The route will match if the lambda is invoked trough API Gateway with the
specified path, and the handler function will be invoked.

#### Route handler
The route handler is a function that will be invoked when a resource match
is found. It will receive the request data object, which contains useful information
which can be extracted from the event object and the execution callback
that can be invoked for async functions. It will also be injected with the
CustomResponse instance that is passed to Router.process(ctx, responseInstance)
or a newly instantiated CustomResponse class if none is passed to
Router.process(ctx, customResponseInstance).

```javascript
function ({requestBody, queryStringParameters, pathParameters, headers, stageVariables, requestContext}, response, callback) {
    /** function body */
}
```

 If the handler returns a value it must return a Response object with
 the following format
```javascript
{
    "isBase64Encoded": Boolean,
    "statusCode": Number,
    "headers": {"key": "val"},
    "body": String
}
```
Or it should invoke the callback (ie. if the function is doing async work
and has no return value).
The handler should return a Response instance a
CustomResponse.send(body) object.


Example API Gateway route test: http://i.imgur.com/dPkux1k.png

Basic directory structure we recommend is having a separate directory for
all the route handlers. (You can see an example in the package directory)

#### Middleware
Middleware is one of those very flexible things allowing you to seperate
your lambda properly by removing logging/authorization/etc... from your
handler's business logic.

If your handlers run sync code, you need to return the next(request) or
assign it to a variable and then return the code. In case of async handlers
the middleware *must NOT* return anything if you want to proceed further,
otherwise the framework will use the returned value as the lambda execution
result.

Sync handler middleware
```javascript
function ({requestBody, queryStringParameters, pathParameters, headers, stageVariables, requestContext}, responseInstance, next) {
    // If error you can return it and the execution will stop there
    if (error) {
        return response.send({success: false});
    }

    // If you want the middleware to resolve and progress invoke next(request);
    return next(request);
}
```

Async handler middleware
```javascript
function ({requestBody, queryStringParameters, pathParameters, headers, stageVariables, requestContext}, responseInstance, next) {
    // If error you can return it and the execution will stop there
    if (error) {
        // End the lambda execution early due to an error by invoking the original callback to end lambda execution
        return request.callback(null, response.send({success: false}));
    }

    // If you want the middleware to resolve and progress invoke next(request);
    next(request);
}
```

Example usage can be found in the demo.js file.

#### Publishing your changes to the Lambda

Create a .lambda_contents file in your root directory (example .lambda_contents
is located in the package directory), and add your lambda project files
and folders separated by newlines.

When you want to apply changes to the lambda you can run the publish.sh
script from the package directory.

```sh
./node_modules/aws-api-lambda-scaffold-js/publish.sh yourLambdaName
```

(Replace yourLambdaName with your Lambda function name)

It will automatically zip all of the files from the .lambda_contents file and
push the changes to the lambda using aws-cli.

#### Running tests
To run tests you can execute *npm run test* which will run all mocha
tests located in the test directory

Mocha docs: https://mochajs.org/


## Misc

#### Webstorm js language help
Install assert-plus, node, mocha libraries to get code completion and help
in WebStorm and enable nodejs coding assistance

#### Useful links
http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CognitoIdentityServiceProvider.html
http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html

#### Example Lambda data availability
The Lambda handler is receiving three parameters: event, context and callback
The event contains request data, context contains the lambda context and
callback – You can use the optional callback to return information to the caller,
otherwise return value is null. It should be invoked because it terminates the
lambda function properly.

```javascript
{
    "event": {
        "resource": "/hash",
        "path": "/hash",
        "httpMethod": "POST",
        "headers": null,
        "queryStringParameters": null,
        "pathParameters": null,
        "stageVariables": null,
        "requestContext": {
            "path": "/hash",
            "accountId": "123",
            "resourceId": "7kyb5s",
            "stage": "test-invoke-stage",
            "requestId": "test-invoke-request",
            "identity": {
                "cognitoIdentityPoolId": null,
                "accountId": "123",
                "cognitoIdentityId": null,
                "caller": "CALLER",
                "apiKey": "test-invoke-api-key",
                "sourceIp": "test-invoke-source-ip",
                "accessKey": "YOURACCESSKEY",
                "cognitoAuthenticationType": null,
                "cognitoAuthenticationProvider": null,
                "userArn": "arn:aws:iam::123:user/nenad-lukic",
                "userAgent": "Apache-HttpClient/4.5.x (Java/1.8.0_112)",
                "user": "123"
            },
            "resourcePath": "/hash",
            "httpMethod": "POST",
            "apiId": "123ijjk13"
        },
        "body": "{\n    \"email\": \"djole@gmail.com\"\n}",
        "isBase64Encoded": false
    },
    "context": {
        "callbackWaitsForEmptyEventLoop": true,
        "logGroupName": "/aws/lambda/createAnIntercomHash",
        "logStreamName": "2017/06/05/[$LATEST]124241",
        "functionName": "createAnIntercomHash",
        "memoryLimitInMB": "128",
        "functionVersion": "$LATEST",
        "invokeid": "8ad3b3c0-49fe-11e7-86d5-a38a3b86ba05",
        "awsRequestId": "8ad3b3c0-49fe-11e7-86d5-a38a3b86ba05",
        "invokedFunctionArn": "arn:aws:lambda:ap-southeast-2:127579097966:function:createAnIntercomHash"
    }
}
```