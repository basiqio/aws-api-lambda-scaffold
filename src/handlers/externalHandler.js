const Response = require("../response");

/**
 * The basic external handler layout
 *
 * @param requestBody
 * @param callback
 * @returns {Response}
 */
module.exports = function ({requestBody}, response, callback) {

    return new Response({
        requestBody: requestBody
    })
};