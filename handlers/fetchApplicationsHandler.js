const   Response = require("../response"),
        AWS = require('aws-sdk'),
        DDB = new AWS.DynamoDB();

module.exports = function ({requestBody, callback}) {

    const params = {
        TableName: "YOUR TABLE NAME"
    };

    DDB.scan(params, function(err, data) {
        if (err) {
            console.log(err, err.stack);
        } else {
            callback(null, new Response({
                data: data
            }));
            console.log(data);           // successful response
        }
    });
};