const   Response = require("../response"),
        AWS = require('aws-sdk');

module.exports = function({requestBody, callback}) {
    AWS.config.update({
        accessKeyId: 'YOUR ACCESS KEY ID',
        secretAccessKey: 'YOUR SECRET KEY'
    });

    let client = new AWS.CognitoIdentityServiceProvider({
        apiVersion: '2016-04-19',
        region: 'COGNITO REGION'
    });

    const params = {
        UserPoolId: 'YOUR USER POOL ID', /* required */
        AttributesToGet: [
            'email',
            /* more items */
        ],
        Limit: 0
    };

    client.listUsers(params, function(err, data) {
        if (err) {
            console.log(err, err.stack);
        } else {
            console.log(data);
            callback(null, new Response({ requestBody, pathParameters, results: data }))
        }
    });
};