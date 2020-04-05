const requiredAttributes = require('../../common/requiredAttributes').getHackerNews | [],
    utilities = require('../../common/utilities'),
    logging = require('logging')(),
    generalLogger = logging.general;

/**
 * Transforms the request into the structure expected for the http request
 * @param {Object} request - the object that contains request body and any other needed data
 * @param {Object} request.body|request.params|request.query - the request (e.g. { customerId: 123123, etc})
 */
module.exports.transform = function (request) {

    // GET requests will be using the request.query
    // POST requests will be using request.body
    // utilities.collectAttributes will flatten the objects into one and return it
    return utilities.collectAttributes(request)
        .then(function (collectedRequestObject) {
            // now that we have the request object flattened, verify that the required attributes are present
            return utilities.verifyAttributes({requiredAttributes: requiredAttributes, request: collectedRequestObject})
                .then(function (verifiedRequestObject) {
                    // the required attributes are present in the request, map them to the expected attributes

                    let options = {
                        url: verifiedRequestObject.url
                    }

                    // we handle setting the redis cache key here, if desired
                    // if (isCacheable) {
                    //     global.CACHECONFIG["KEY"] = request.cacheKey || null;
                    //     global.CACHECONFIG.OPS.getHackerNews = `getHackerNews:pretty`;
                    // }
                    // generalLogger.log.info(logTypes.fnInside({CACHECONFIG: global.CACHECONFIG}), `getData cache state: ${isCacheable}`);

                    return {options: options};
                })
                .catch(function (err) {
                    // at least one required attribute was missing, pass the err up the chain
                    generalLogger.log.error("getHackerNews verifyAttributes got err", err);
                    return {err: err};
                })
        })
        .catch(function (err) {
            // there was a problem with utilities.collectAttributes, pass the err up the chain
            generalLogger.log.error("getHackerNews collectAttributes got err", err);
            return {err: err};
        })
}