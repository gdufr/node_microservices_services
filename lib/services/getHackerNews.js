const transformer = require('../transformers/getHackerNews'),
    httpCall = require('data-access')().http.httpCall,
    logging = require('logging')(),
    generalLogger = logging.general,
    logTypes = logging.logTypes,
    mockData = require('./../config/mockData.json');

/**
 * Retrieves the http response using the data access layer
 * @param {Object} request - the object that contains request body
 * @param {Object} request.body|request.params|request.query - the request (e.g. { customerId: 123123, etc)
 * @param string request.params|body|query.username - the username to search for
 *
 */
module.exports.getHackerNews = function (request) {

    generalLogger.log.trace("getHackerNews received request", request);

    return transformer.transform(request)
        .then(function (transformedRequest) {

            // before integration with back end just return mock data
            // return {result: mockData};
            return httpCall(transformedRequest.options)
                .then(function (result) {
                    generalLogger.log.trace("getHackerNews returning httpCall result", result);
                    return {result: result};
                }).catch(function (err) {
                    // httpCall returned an error
                    generalLogger.log.error("getHackerNews httpCall returned err", err);
                    return {err: err};
                });
        })
        .catch(function (err) {
            // transform returned an error
            generalLogger.log.error("getHackerNews transformer returned err", err);
            return {err: err};
        })
}
