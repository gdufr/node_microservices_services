var utility = {},
    path = require("path"),
    _appConfig = require('application_configuration')(),
    moment = require('moment'),
    xml2js = require('xml2js');

utility.checkUndefined = function checkUndefined(conv) {
    if (conv !== undefined) {
        return conv;
    } else {
        return "";
    }
};

utility.parseDouble = function checkUndefined(conv) {
    if (conv != undefined && conv.length > 0) {
        return parseFloat(conv);
    } else {
        return "";
    }
};

utility.checkStatus = function checkStatus(status) {

    if (status !== undefined && status.toLowerCase() == "active") {
        status = "scheduled";
        return status;
    }
    else if (status !== undefined && status.toLowerCase() == "completed") {
        status = "completed";
        return status;
    }
    else if (status !== undefined && status.toLowerCase() == "failed") {
        status = "failed";
        return status;
    }
    else if (status !== undefined && status.toLowerCase() == "cancelled") {
        status = "cancelled";
        return status;
    }
    else {
        return "";
    }
}

utility.convertDateToMMDDYYY = function (inputDate) {
    var outputDate = "";
    if (inputDate != undefined) {

        outputDate = moment(inputDate, _appConfig.constants.get("/DATETIME/SOAP_DATE_FORMAT")).format(_appConfig.constants.get("/DATETIME/DATE_FORMAT"));
    }
    return outputDate;
};


utility.mergeTwoArray = function (fistArray, seconArray) {
    var outputArray = fistArray.concat(seconArray);
    return outputArray;
};

utility.sortById = function sortById(sortObj) {
    var getObjects = sortObj.slice(0);
    var sortedarray = getObjects.sort(function (a, b) {
        return a.id - b.id;
    });
    return sortedarray;
};

utility.removeDuplicate = function removeDuplicate(poRemoveObj) {
    var removeObj = utility.sortById(poRemoveObj);
    var oldId = "";
    var newId = "";
    var newObjArray = [];
    for (var i = 0; i < removeObj.length; i++) {
        var notificationObj = removeObj[i];
        newId = notificationObj.id;
        if (newId != oldId) {
            newObjArray.push(notificationObj);
            oldId = newId;
        }
    }

    return newObjArray;

};

utility.getSoapConfObject = function getSoapConfObject(operation, method) {
    var soapConfObject = {};
    var wsdlConfig = config.get(operation);
    soapConfObject = wsdlConfig[method];
    return soapConfObject;
};
utility.getExpired = function getExpired(month, year) {
    var cur_date = new Date();
    var isExp = "";
    if (year > cur_date.getFullYear()) {
        isExp = false;
    } else if (year == cur_date.getFullYear()) {
        if (month >= cur_date.getMonth() + 1) {
            isExp = false;
        } else {
            isExp = true;
        }
    } else {
        isExp = true;
    }
    return isExp;
};
/**
 *
 * @param obj
 * @returns {boolean}
 * usage: checkForNestedPropertyExistence(obj,prop,nestedprop)
 */
utility.checkForNestedPropertyExistence = function (obj) {
    var args = Array.prototype.slice.call(arguments, 1);

    for (var i = 0; i < args.length; i++) {
        if (!obj || !obj.hasOwnProperty(args[i])) {
            return false;
        }
        obj = obj[args[i]];
    }
    return true;
};


utility.getLastFourDigit = function (poAccNumber) {
    poAccNumber = poAccNumber.toString()
    if (poAccNumber != undefined && poAccNumber.length > 4) {
        return poAccNumber.substr(poAccNumber.length - 4);
    } else {
        return "";
    }
}

/**
 * Thsis method will return paymeas object checking wallet
 * @param obj
 * @returns obj
 * usage: isWalletSelected(obj,prop,nestedprop)
 */
utility.isWalletSelected = function (objPaymeans, poAccount) {

    var isItBank = objPaymeans.type;
    if (poAccount.toString().length > 4) {
        return utility.isWalletSelectedCardId(objPaymeans, poAccount);
    }
    var isWallet = false;
    if (isItBank == "bank") {
        var objBnkAccount = utility.getLastFourDigit(objPaymeans.accountNumber.toString());
        if (poAccount == objBnkAccount) {
            isWallet = true;
        }
    } else if (isItBank == "credit") {
        var objCreditCard = utility.getLastFourDigit(objPaymeans.cardNumber.toString());
        if (poAccount == objCreditCard) {
            isWallet = true;
        }
    }
    return isWallet;
};

/**
 * Thsis method will return paymeas object checking wallet
 * @param obj
 * @returns obj
 * usage: isWalletSelected(obj,prop,nestedprop)
 */
utility.isWalletSelectedCardId = function (objPaymeans, poAccount) {
    var isItBank = objPaymeans.type;

    var isWallet = false;
    if (isItBank == "bank") {
        var objBnkAccount = objPaymeans.accountNumber.toString();
        if (poAccount == objBnkAccount) {
            isWallet = true;
        }
    } else if (isItBank == "credit") {
        var objCreditCard = objPaymeans.cardId.toString();
        if (poAccount == objCreditCard) {
            isWallet = true;
        }
    }
    return isWallet;
};

/**
 * Thsis method will return paymeas object checking wallet
 * @param obj Array
 * @returns obj
 * usage: checkForNestedPropertyExistence(obj,prop,nestedprop)
 */
utility.getSelectedWallet = function (objPaymeansArray, poAccontNum) {
    var selectedWallet;
    if (objPaymeansArray.length > 0) {
        //  selectedWallet = objPaymeansArray[0];
        for (var walletCount = 0; walletCount < objPaymeansArray.length; walletCount++) {
            selectedWallet = objPaymeansArray[walletCount];
            if (utility.isWalletSelected(selectedWallet, poAccontNum)) {
                return selectedWallet;
            }
        }
    }
    return selectedWallet;
};

/**
 * Thsis method will return paymeas object checking wallet
 * @param obj Array
 * @returns obj
 * usage: checkForNestedPropertyExistence(obj,prop,nestedprop)
 */
utility.getBankSelectedWallet = function (response,lstFourDigit) {
    var selectedWallet;
    if (response.length > 0) {
        //  selectedWallet = objPaymeansArray[0];
        for (var walletCount = 0; walletCount < response.length; walletCount++) {
            selectedWallet = response[walletCount];
            if (utility.isWalletSelected(selectedWallet, lstFourDigit)) {
                //callBack(selectedWallet);
                break;
            }
        }
    }
    return selectedWallet;
};

// Handles undefined values. Will return "" by default or newVal if passed in
utility.isUndefined = function isUndefined(val, newVal) {
    if (val === undefined) {
        return newVal || "";
    }
    else {
        return val;
    }
};

utility.parseException = function parseException(err, exceptionElement) {
    // Unfortunately this err object doesn't get parsed from XML into a nice JS object so we need to use xml2js to parse it
    try {

        xml2js.parseString(err.body, {tagNameProcessors: [xml2js.processors.stripPrefix]}, function (parseErr, resultErr) {
            if (parseErr) {
                err.code = _appConfig.constants.get("/NODE_CODES/ESB_DOWN/ERROR_CODE");
                err.statusCode = _appConfig.constants.get("/NODE_CODES/ESB_DOWN/STATUS_CODE");
            }
            else {

                var parentObj = resultErr["Envelope"]["Body"][0]["Fault"][0]["detail"][0];

                var errorCode = parentObj[exceptionElement][0]["errorInformation"][0]["errorCode"][0];
                var errorDesc = parentObj[exceptionElement][0]["errorInformation"][0]["errorDescription"][0];

                err.code = errorCode;
                err.message = errorDesc;
            }

        });

        return err;

    } catch (errParse) {

        err.code = _appConfig.constants.get("/NODE_CODES/INTERNAL_NODE_ERROR/ERROR_CODE");

        return err;
    }

};

//Adding Name space
utility.addNameSpace = function addNameSpace(poNameSpace) {
    var childName;
    var loInput = {};
    //This will add child element direct in the input
    this.addChild = function (poChildName, poChildValue) {
        var loChildbject = "";
        loChildbject = poNameSpace + ":" + poChildName + ": " + poChildValue;
        return loChildbject;

    }

    //This will add object attributes
    this.addObjectAtributes = function (poChildObjName) {

        loInput[":" + poChildObjName] = {
            "attributes": {
                "xmlns": poNameSpace
            }
        }
        loInput[":" + poChildObjName].$value = {};
    }

    //This will add object child value
    this.addObjectChildValue = function (poChildObjName, poChildName, poChildValue) {
        loInput[":" + poChildObjName].$value = {
            "attributes": {
                "xmlns": poNameSpace
            },
            "$value": poChildValue
        }
    }

    // Will return object by add
    this.getParseNameSpaceObject = function () {
        return loInput;
    }

};
/**
 *
 * @param string
 * @returns {string}
 * usage: getCardType(poCardType)
 * will convert angular card type to node card type.
 */

utility.getCardType = function (poCardType) {
    var loNodeCardType = "";
    if (poCardType != undefined) {
        loNodeCardType = _appConfig.constants.get("/CARD_TYPE/"+poCardType+"");
        if (loNodeCardType != undefined) {
            return loNodeCardType;
        } else {
            return "";
        }
    }
    return loNodeCardType;
}

utility.getParseObject = function (poArray, poCardType, poDefault) {
    var loNodeCardType = poDefault;
    if (poCardType != undefined) {
        loNodeCardType = poArray[poCardType];
        if (loNodeCardType != undefined) {
            return loNodeCardType;
        } else {
            return poDefault;
        }
    }
    return loNodeCardType;
}

/**
 * it will give two date range future and past
 * @param poStartDate
 * @param poEndDate
 */
utility.getFutureAndPastDate = function (poActivityDate, req) {
    var queryFromDate = req.query.from;
    var queryToDate = req.query.to;
    var dateRange = {};
    if (poActivityDate != undefined) {
        dateRange = JSON.parse(poActivityDate);
    }
    if (utility.checkForNestedPropertyExistence(dateRange, "dateRange")) {
        dateRange = dateRange.dateRange;
        queryFromDate = dateRange.from;
        queryToDate = dateRange.to;
    }
    var poStartDate = new Date(queryFromDate);
    var poEndDate = new Date(queryToDate);

    var loDateRange = {};
    var currentDate = new Date();
    loDateRange.isFuture = false;
    loDateRange.isPast = false;
    loDateRange.isBoth = false;
    var endDate = new Date(poEndDate);
    var startDate = new Date(poStartDate);
    //  var currentDateStr = moment().format();
    var currentDateStr = moment().toISOString();
    if (currentDate > startDate && currentDate > poEndDate) {
        loDateRange.pastStartDate = queryFromDate;
        loDateRange.pastEndDate = queryToDate;
        loDateRange.isPast = true;
    } else if (currentDate < startDate && currentDate < poEndDate) {
        loDateRange.futureStartDate = queryFromDate;
        loDateRange.futuretEndDate = queryToDate;
        loDateRange.isFuture = true;
    }
    else if (currentDate > startDate && currentDate < poEndDate) {
        loDateRange.pastStartDate = queryFromDate;
        loDateRange.pastEndDate = currentDateStr;
        loDateRange.futureStartDate = currentDateStr;
        loDateRange.futuretEndDate = queryToDate;
        loDateRange.isBoth = true;
    }
    return loDateRange;
}
/**
 * Thsis method will return paymeas object checking wallet
 * @param obj
 * @returns obj
 * usage: checkForNestedPropertyExistence(obj,prop,nestedprop)
 */
utility.getLastFourDigitForHandler = function (poObjPaymeans) {
    var objPaymeans = poObjPaymeans.paymentMethod;
    if (!(objPaymeans.walletAccounts.selected.isNew)) {
        return utility.getLastSelectedAccount(poObjPaymeans);
    }
    var isItBank = utility.checkForNestedPropertyExistence(objPaymeans, "newWalletAccount", "bankAccount", "accountNumber");
    var isItCreditCrad = utility.checkForNestedPropertyExistence(objPaymeans, "newWalletAccount", "creditCard", "cardNumber");
    var objBnkAcc = "";
    if (isItBank) {
        objBnkAcc = utility.getLastFourDigit(objPaymeans.newWalletAccount.bankAccount.accountNumber);
    } else if (isItCreditCrad) {
        objBnkAcc = utility.getLastFourDigit(objPaymeans.newWalletAccount.creditCard.cardNumber);
    }
    return objBnkAcc;
};

/**
 * Thsis method will return paymeas object checking wallet
 * @param obj
 * @returns obj
 * usage: checkForNestedPropertyExistence(obj,prop,nestedprop)
 */
utility.getLastSelectedAccount = function (poObjPaymeans) {
    var objPaymeans = poObjPaymeans.paymentMethod;
    var isItBank = utility.checkForNestedPropertyExistence(objPaymeans, "walletAccounts", "selected", "type");
    var paymentType = objPaymeans.walletAccounts.selected.type;
    var isItCreditCrad = utility.checkForNestedPropertyExistence(objPaymeans, "walletAccounts", "selected", "cardId");
    var objBnkAcc = "";
    if (paymentType == "bank") {
        objBnkAcc = objPaymeans.walletAccounts.selected.accountNumber;
    } else if (paymentType == "credit" && isItCreditCrad) {
        objBnkAcc = objPaymeans.walletAccounts.selected.cardId;
    }
    return objBnkAcc;
};

// will check is new wallet account
utility.isItWalletAccont = function (req) {
    var isWallet = false;
    var isSaveWallet = false;

    if (utility.checkForNestedPropertyExistence(req, 'paymentMethod', 'newWalletAccount', 'saveWalletAccount')) {
        var forNewallet = req.paymentMethod.newWalletAccount.saveWalletAccount;
        if (forNewallet.checked != undefined && forNewallet.checked) {
            isSaveWallet = true;
        }
    }
    if (utility.checkForNestedPropertyExistence(req, 'paymentMethod', 'walletAccounts', 'selected') && isSaveWallet) {
        var forNewallet = req.paymentMethod.walletAccounts.selected.isNew;
        //if(forNewallet.checked !=undefined && forNewallet.checked){
        if (forNewallet !== undefined && forNewallet) {
            isWallet = true;
        }
    }

    return isWallet;
}


utility.generatePaymentId = function () {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
}

// will check is new wallet account
utility.isItFutureDate = function (poDate) {

    // Converts the time from Angular to UTC in YYYY-MM-DD format
    var fromDate = moment.utc(poDate).format(_appConfig.constants.get("/DATETIME/UTC_FORMAT_T"));

    // Gets the current system time in UTC YYYY-MM-DD format
    var currentDate = moment().utc().format(_appConfig.constants.get("/DATETIME/UTC_FORMAT_T"));

    // Check to see if both dates are the same day
    var isOneTimePay = (fromDate === currentDate);
    return isOneTimePay;
}
// will check is new wallet account
utility.isItWalletAccount = function (args) {
    var isWallet = false;
    var isSaveWallet = false;
    if (utility.checkForNestedPropertyExistence(args.body, 'paymentMethod', 'newWalletAccount', 'saveWalletAccount')) {
        var forNewallet = args.body.paymentMethod.newWalletAccount.saveWalletAccount;
        if (forNewallet.checked != undefined && forNewallet.checked) {
            isSaveWallet = true;
        }
    }
    if (utility.checkForNestedPropertyExistence(args.body, 'paymentMethod', 'walletAccounts', 'selected') && isSaveWallet) {
        var forNewallet = args.body.paymentMethod.walletAccounts.selected.isNew;
        //if(forNewallet.checked !=undefined && forNewallet.checked){
        if (forNewallet !== undefined && forNewallet) {
            isWallet = true;
        }
    }
    return isWallet;
}
utility.getPaymentMethod = function (poPaymentMethod) {
    if (poPaymentMethod.toLowerCase().trim() === "credit") {
        return "CC";
    }
    else {
        return "DD";
    }
}


module.exports = utility;
