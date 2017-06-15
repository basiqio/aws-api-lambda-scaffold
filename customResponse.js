/**
 * Response class that fits into the lambda proxy integration structure that should be
 * instantiated once.
 */
class CustomResponse {

    constructor(headers, base64) {
        headers = Object.assign({}, {"Content-type": "application/json"}, headers);

        if (!base64) {
            base64 = false;
        }

        this.isBase64Encoded = base64;
        this.headers = headers;
    }

    send(body, statusCode = 200, headers) {
        if (body && Object.keys(body).length === 0) {
            body = null;
        } else {
            body = JSON.stringify(body);
        }

        if (!headers) {
            headers = this.headers;
        }

        return {
            isBase64Encoded: this.isBase64Encoded,
            headers: headers,
            statusCode: statusCode,
            body: body
        };
    }

    setHeaders(headers) {
        this.headers = headers;
    }
}

module.exports = CustomResponse;