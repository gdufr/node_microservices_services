var requireDir = require('require-dir'),
    config = {};
    global.CACHECONFIG = {KEY: "", ESBOPS: {} };

module.exports = function(config) {
    // Initialize opts in case it isn't passed in
    global.config = config || {};

    var services = requireDir('./lib/services/');
    services.utilities = require('./common/utilities');
    services.responseTransformations = requireDir('./common/responseTransformations');

    return services;
}
 
