/**
 * Response class that fits into the lambda proxy integration structure
 */
class Response {

    constructor(body = {}, statusCode = 200, base64 = false, headers = {"Content-type": "application/json"}) {
        this.isBase64Encoded = base64;
        this.statusCode = statusCode;
        this.headers = headers;
        this.body = JSON.stringify(body);
    }

}

module.exports = Response;