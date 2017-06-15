/**
 * Response class that fits into the lambda proxy integration structure
 */
class Response {

    constructor(body = {}, statusCode = 200, headers = {"Content-type": "application/json"}, base64 = false) {
        this.isBase64Encoded = base64;
        this.statusCode = statusCode;
        this.headers = headers;
        if (body && Object.keys(body).length === 0) {
            this.body = null;
        } else {
            this.body = JSON.stringify(body);
        }
    }

}

module.exports = Response;