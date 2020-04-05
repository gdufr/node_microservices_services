// const getDataService = require('../../lib/services/getData');
//
// /**
//  * Functions like this would normally be the responsibility of a microservice
//  * This function is placed in the services library because there are multiple microservices that use it (not really, just for demonstration)
//  *  in addition to performing additional functions with the result
//  * In adherence to the DRY principal, this has been placed in this shared code library
//  *
//  * @param userinfo
//  */
// module.exports.transformGetDataResponse = function (userinfo) {
//
//     return new Promise(function (resolve, reject) {
//
//         getDataService.getData()
//             .then(function (response) {
//
//                 var value1 = response;
//                 var value2 = userinfo.attributeName;
//
//                 if (Array.isArray(tnc)) {
//                     var splitValue1 = value1.slice(-1)[0].split('|')[1];
//                 } else {
//                     var splitValue1 = String(value1).split('|')[1];
//                 }
//
//                 return resolve({acceptTerms: splitValue1 != value2})
//             })
//             .catch(function (err) {
//                 reject(err);
//             })
//     })
// };