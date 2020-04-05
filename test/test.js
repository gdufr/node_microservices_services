var Promise = require('bluebird'),
    glob = Promise.promisify(require('glob')),
    path = require('path'),
    fs = Promise.promisifyAll(require('fs')),
    assert = require('assert');

var chai = require("chai"),
    chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);
chai.should();

let utility = require('./../common/utilities.js'),
    requiredAttributes = ['required1', 'required2'],
    collectedRequestObject = {required1: 'value1', required2: 'value2', optional1: 'value3'},
    missingAttributeObject = {required1: 'value1'},
    requestObject = {
        body: {bodyAttribute: 'body value'},
        params: {paramsAttribute: 'params value'},
        query: {queryAttribute: 'query value'}
    };


/**
 * Test to make sure that there is a transformer for each service
 *
 * if we determine that we can use the same transformer for multiple
 * services then this will have to be updated
 */
describe('services', function () {

    it('should have a transformer for each service', function () {
        //loop over the .js files in lib/services and check that there is a file with the same name in lib/transformers

        //initialize a var to pass in the promise chain
        var transformerNames = [];

        return fs.readdirAsync('lib/transformers')
        //read in all the transformer names and put them in an array
            .then(function (transformerNamesList) {
                transformerNames = transformerNamesList;
            })
            // return a promise with all the services names
            .then(function () {
                return fs.readdirAsync('lib/services');
            })
            // loop over each of the service names and return a resolved promise verifying that the service file name is
            //   also a transformer file name
            .each(function (serviceFilename) {
                console.log('Checking for file ' + serviceFilename + ' in the lib/transformers directory');
                // will fail the test if the name of the service file is not also the name of a transformer file
                return Promise.resolve(transformerNames.indexOf(serviceFilename)).should.not.eventually.equal(-1);
            });
    })
})
