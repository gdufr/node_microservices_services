var crypto = require('crypto'),
    logging = require('logging')(),
    logger = logging.general,
    logTypes = logging.logTypes;

/**
 * Verify that the required attributes are present in the request
 * @param {Object} params - the object that contains request body
 * @param {Object} params.request - the request object
 * @param {Object} params.request.body - the request body
 * @param {Object[]} params.requiredAttributes - the list of attribute keys that are required
 *
 * @returns {Object|Object[]}   on resolve, return param.request object.  On reject, return Array of missing attributes
 */
module.exports.verifyAttributes = function (params) {

    return new Promise(function (resolve, reject) {

        // handle missing request body
        if (!params.request) {
            return reject({
                    message: 'No request object was sent.  Expecting request with these attributes:',
                    requiredAttributes: params.requiredAttributes,
                    receivedRequest: params
                }
            );
        }

        if (!params.requiredAttributes) {
            // there are no required attributes, return request object
            return resolve(params.request);
        }

        let missingAttributes = [],
            // initialize requestAttributes before mapping to optimize execution efficiency
            requestAttributes = Object.getOwnPropertyNames(params.request),
            requiredAttributes = params.requiredAttributes;

        // loop over all the required attributes
        requiredAttributes.map(function (requiredAttribute) {

            // if the required attribute isn't in the request object, push it in an array to return
            if (requestAttributes.indexOf(requiredAttribute) === -1) {
                missingAttributes.push(requiredAttribute);
            }
        });

        if (missingAttributes.length > 0) {
            // there was at least one missing required attribute
            return reject({
                message: 'The request object is missing required (case-sensitive) attributes: ',
                missingAttributes: missingAttributes
            });
        } else {
            // all the required attributes were found
            return resolve(params.request);
        }
    })
}

/**
 * Loop over all of the different types of request objects and flatten them into a single object
 * @param {Object} params
 * @param {Object} params .body|.query|.params|.headers|.userinfo the request attributes that will be flattened
 * @returns {Promise} flattened object containing all the attributes from above
 */
module.exports.collectAttributes = function (params) {

    return new Promise(function (resolve, reject) {

        let userinfo = {};
        if (params.hasOwnProperty('headers')) {
            if (params.headers.hasOwnProperty('userinfo')) {
                userinfo = params.headers.userinfo;
            }
        }
        // handle missing request objects
        if (!params || (!params.body && !params.params && !params.query && !params.headers && !userinfo)) {
            return reject({
                    message: 'No request object was sent.  ' +
                    'Expecting request.body, request.param, request.query, or params.headers.userinfo (the jwt) ',
                    receivedRequest: params
                }
            );
        }

        let returnObject = {};

        // loop over all the request params, body, query, headers, and userinfo attributes
        // add them into the return object
        if (params.params) {
            paramsAttributes = Object.getOwnPropertyNames(params.params);
            paramsAttributes.map(function (paramsAttribute) {
                returnObject[paramsAttribute] = params.params[paramsAttribute];
            });
        }
        if (params.query) {
            queryAttributes = Object.getOwnPropertyNames(params.query);
            queryAttributes.map(function (queryAttribute) {
                returnObject[queryAttribute] = params.query[queryAttribute];
            });
        }
        if (params.body) {
            bodyAttributes = Object.getOwnPropertyNames(params.body);
            bodyAttributes.map(function (bodyAttribute) {
                returnObject[bodyAttribute] = params.body[bodyAttribute];
            });
        }
        if (params.headers) {
            headersAttributes = Object.getOwnPropertyNames(params.headers);
            headersAttributes.map(function (headerAttribute) {
                returnObject[headerAttribute] = params.headers[headerAttribute];
            });
        }
        if (userinfo) {
            userinfoAttributes = Object.getOwnPropertyNames(userinfo);
            userinfoAttributes.map(function (userinfoAttribute) {
                returnObject[userinfoAttribute] = userinfo[userinfoAttribute];
            });
        }
        // inject cacheKey and reqId attributes
        returnObject["reqId"] = params.reqId || null;
        returnObject["cacheKey"] = params.cacheKey || null;

        if (returnObject.customerId) {
            global.CUSTOMERID = returnObject.customerId || null;
        }

        logger.log.info(logTypes.fnInside(returnObject), `collectAttributes returning request items: ${returnObject}`);

        resolve(returnObject);
    })
}

/**
 * Determine if user is anonymous or logged in by checking the JWT
 * @param args
 * @returns {boolean} true if logged in, false if anonymous
 */
module.exports.isLoggedIn = function (args) {

    // just checking for the nested attribute that indicates user data has been passed from the gateway
    if (args.hasOwnProperty('headers')) {
        if (args.headers.hasOwnProperty('userinfo')) {
            if (args.headers.userinfo.hasOwnProperty('customerId')) {
                return true;
            }
        }
    }
    // if we get here then args doesn't have args.headers.userinfo.customerId
    // without this I'm assuming that the user is an anonymous user
    return false;
}

/**
 * Get the SHA-1 hash of a string
 * @param string
 * @returns {string} SHA-1 hash of param string
 */
module.exports.sha1 = function (string) {

    var generator = crypto.createHash('sha1');
    generator.update(string);

    return generator.digest('hex');

}

//use to simulate something taking longer
module.exports.wait = function (ms) {
    var start = new Date().getTime();
    var end = start;
    while (end < start + ms) {
        end = new Date().getTime();
    }
}