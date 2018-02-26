// Collection of useful "tools" for testing Angular applications through Protractor

/**
 * Handy view-agnostic functions
 *
 * Created by Will on 12/19/2016.
 */

var protractor = require('protractor');
var WD = require('selenium-webdriver');
var EC = protractor.ExpectedConditions;
var util = require('util');
var lo = require('lodash');
var __ = require('underscore');


var tools = function() {

    var _this = this;


    // Selector definition, required by all pageObjects
    /**
     * @description - Used by pageObjects to attach metadata to selectors
     *
     * @param selector
     * @param isHidden - Defaults false; true if test should not worry about the isDisplayed() result
     * @param skip - Defaults false; true if test should not test this (used for elements that require specific workflow, like tooltips)
     * @returns {{element: *, hidden: *, skip: *, testableElement: *}}
     */
    this.selector = function(selector, isHidden, skip, raw) {
        if (typeof isHidden == 'undefined') { isHidden = false;}
        if (typeof skip == 'undefined') { skip = false;}
        if (typeof raw == 'undefined') { raw = {};}

        return {
            element: selector,
            hidden: isHidden,
            skip: skip,
            raw: raw
        }
    };

    // TODO/WIP - raw-selector paradigm; have raw selectors on EVERY selector without having to define them twice. Will require refactor of all selectors
    // raw-paradigm version of the selector object; ingests an object-of-strings to build selectors
    // Will hook self up to global selector object by reading what pageObject the selector was defined from (to fix intellisense completion)
    // Use ECMA6's rest parameters to handle snowflake additions..? (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters)
    this.rSelector = function(params) {
        // Argument validation
        if (!params.raw) {
            throw new Error('Missing raw object param in selector definition!\n', params);
        }
        if (typeof params.raw != 'object') {
            throw new Error('Raw param in selector definition is not an object!\n', params)
        }

        // Loops through the raw object and builds an element
        var buildElement = function(raw) {

        };

        return {
            raw: raw,
            element: buildElement(raw),
            hidden: isHidden,
            skip: skip
        }
    };

    /**
     * @description - Eats array of selector objects and returns just the elements
     *
     * @param items
     * @returns {{}}
     */
    this.buildElements = function(items) {
        var eles = {};

        for (var item in items) {
            if (items.hasOwnProperty(item)) {
                if (items[item].hasOwnProperty('element')) {
                    eles[item] = items[item].element;
                }
            }
        }

        return eles;
    };


    /**
     * @description - Eats an ElementsArrayFinder and will filter on 'attribute' against 'identifier' via a 'comparator',
     * comparator defaults to '=='
     *
     * @param elements
     * @param attribute
     * @param identifier
     * @param comparator
     *
     * @returns ElementFinder{}
     */
    this.filterByAttribute = function(elements, attribute, identifier, comparator) {
        return elements.filter(function(elem) {
            return elem.getAttribute(attribute).then(function(result) {
                if (result == null || result == 'null') {
                    throw new Error ('filterByAttribute() FAILED: Desired attribute (' + attribute + ') is not ' +
                        'an attribute of desired element');
                }

                switch (comparator) {
                    case '==':
                    case 'undefined':
                    case undefined:
                        //console.log('DEBUG filterByAttribute - result vs identifier', result, identifier);
                        return result == identifier;
                        break;

                    case '>':
                        //console.log('DEBUG ATTRIBUTE FILTER', result ,'>', identifier);
                        return result > parseFloat(identifier);
                        break;

                    case '<':
                        //console.log('DEBUG ATTRIBUTE FILTER', result ,'<', identifier);
                        return result < parseFloat(identifier);
                        break;
                }
            });
        });
    };

    /**
     * @description - Eats an ElementsArrayFinder and will filter on 'cssValue' against 'identifier'. NOT Async since it's used from POs
     *
     * @param elements
     * @param cssValue
     * @param identifier
     * @param comparator
     * @returns {*}
     */
    this.filterByCssValue = function(elements, cssValue, identifier, comparator) {
        return elements.filter(function(elem) {
            return elem.getCssValue(cssValue).then(function(result) {

                if (result == null || result == 'null') {
                    throw new Error ('filterByAttribute() FAILED: Desired CSS Value (' + cssValue + ') is not ' +
                        'a CSS Value of desired element');
                }
                switch (comparator) {
                    case '==':
                    case 'undefined':
                    case undefined:
                        return result == identifier;
                        break;

                    case '!=':
                        //console.log('DEBUG CSS FILTER', result ,'!=', identifier);
                        return result != identifier;
                        break;

                    case '>':
                        //console.log('DEBUG CSS FILTER', result ,'>', identifier);
                        return result > parseFloat(identifier);
                        break;

                    case '<':
                        //console.log('DEBUG CSS FILTER', result ,'<', identifier);
                        return result < parseFloat(identifier);
                        break;
                }
            });
        });
    };

    /**
     * @description - Eats an ElementsArrayFinder and will filter on it's text via getText() against 'identifier'. NOT Async since it's used from POs
     *
     * @param elements
     * @param identifier
     * @param includes
     * @returns ElementsArrayFinder{[]}
     */
    this.filterByGetText = function(elements, identifier, includes) {
        //console.log('DEBUG elements', elements);

        return elements.filter(function(elem) {
            return elem.getText().then(function(text) {
                if (includes) {
                    //console.log('DEBUG - from filterGetByText INCLUDES\n', text, 'vs', identifier, '('+ text.includes(identifier) +')');

                    return text.includes(identifier);

                } else {
                   // console.log('DEBUG - from filterGetByText\n', text, 'vs', identifier);

                    return text == identifier;
                }
            });
        });
    };

    /**
     * @description - Eats an ElementsArrayFinder and will filter on the result of a isDisplayed() against 'displayed'
     *
     * @param elements
     * @param displayed - true: return objects if they are displayed, false: return objects if they are NOT displayed
     * @returns {*}
     */
    this.filterByDisplayed = function(elements, displayed) {
        return elements.filter(function(elem) {
            return elem.isDisplayed().then(function(result) {
                return result == displayed;
            });
        });
    };


    this.clickOffsetFromOrigin = function(element, xVal, yVal) {
        browser.actions()
            .mouseMove(element, {x: xVal, y: yVal})
            .click()
            .perform();
    };


    this.asyncNav = function(URL, goalElement, toggleAngular) {

        // Arg handling
        if (toggleAngular == undefined || 'undefined') { toggleAngular = false; }

        var defer = protractor.promise.defer();

        // If need to navigate to non-angular page...
        if (toggleAngular) {
            tools.toggleAngularSync(true);

            browser.driver.get(URL);

            defer.fulfill(_this.WD_waitOnElementPresent(goalElement));

            return defer.promise;

        } else {
            browser.get(URL);

            defer.fulfill(_this.waitOnElementPresent(goalElement));

            return defer.promise;
        }
    };


    /**
     *  Pauses test execution until the URL matches "url"
     *
     *  @param {string} url - the desired url
     *  @param {int} timeout - the desired timeout period in ms
     */
    this.waitOnFuzzyUrl = function(url, timeout) {
        return browser.wait(function() {
            return browser.getCurrentUrl().then(function(actualUrl) {
                return actualUrl.includes(url);
            }, timeout);
        });
    };


    // Waits for a UI element to finish loading
    this.waitOnElementPresent = function(ele) {

        browser.wait(function() {
            return browser.isElementPresent(ele);
        }, 30000);
    };


    // WebDriverJS - waits for a non-angular UI element to finish loading
    this.WD_waitOnElementPresent = function(ele) {

        browser.driver.wait(function() {
             return browser.isElementPresent(ele);
        }, 30000);
    };


    /**
     * @description - toggles the inherit waitForAngular checks that Protractor natively performs. Required for interacting
     * with non-angular pages and iframes.
     *
     * true = non-angular
     * false = angular
     */
    this.toggleAngularSync = function(wantOff) {

        if (browser.ignoreSynchronization != wantOff) {

            browser.ignoreSynchronization = wantOff;
        }
    };


    /**
     * @description - Simple handler that checks if a checkbox is active or not, and achieves the desired result
     *
     * @param checkbox - the checkbox element
     * @param wantChecked - boolean that determines whether the test author wants the checkbox made active or not
     */
    this.setCheckBox = function(checkbox, wantChecked) {
        //console.log('DEBUG - setCheckBox:', checkbox);

        var setCheck = function(cb) {
            cb.isSelected().then(function (status) {

                if (status != wantChecked && status != undefined) {
                    //cb.getOuterHtml().then(function (out) {
                    //    console.log('\nDEBUG - SETTING CHECKBOX:', out, '\nSTATUS', status, 'WANT CHECKED:', wantChecked);
                    //});
                    cb.click();
                } else {
                    //console.log('DEBUG - setCheckbox failure', status, 'wantChecked:', wantChecked);
                }
            });
        };

        // If a promise is received, resolve it first
        if (protractor.promise.isPromise(checkbox)) {
            checkbox.then(function(checkboxActual) {
                setCheck(checkboxActual);
            });
        } else {
            setCheck(checkbox);
        }
    };


    /**
     * @description Poops out the result of a getAttribute as a string
     * @description Good for places where you'd have to write a function to resolve the promise first, like jasmine's hidden error output
     *
     * @param element - the unresolved selector
     * @param {string} attr - what is passed into getAttribute(). Defaults to outerHTML
     * @returns {string}
     */
    this.getAttrOutput = function(element, attr) {
        attr = (typeof attr !== 'undefined') ? attr : 'outerHTML';

        return element.getAttribute(attr).then(function(html) {
            return html;
        });
    };


    // Shameless copypasta from mozilla, returns a random integer
    this.getRandomInt = function(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };


    // Get random element from desired array
    this.getRandomValueInArray = function(array) {
        var randySavage = _this.getRandomInt(0, array.length - 1);
        return array[randySavage];
    };


    /**
     * @description - injects some JS that modifies the 'display' property of the desired element
     */
    this.hideElement = function(element, value) {
        return browser.driver.executeScript("arguments[0].setAttribute('display', arguments[2]);", element.getWebElement());
    };


    /**
     * @description - injects some JS that deletes the desired element from the DOM
     */
    this.deleteElement = function(element) {
        return browser.driver.executeScript("arguments[0].parentElement.removeChild(arguments[0])", element.getWebElement());
    };


    /**
     * @description - wipes out local storage
     */
    this.clearLocalStorage = function() {
        browser.executeScript('window.localStorage.clear();')
    };


    /**
     * @description - parses self for references to the external testData_.json file (testData)
     * and checks to see if each hook actually has the data it needs. If not, the test returns 0
     * and sends a skip to the reporter.
     *
     * A promise'd version of this was attempted first, but since jasmine's it()s handle inserting
     * themselves into controlFlow, wrapping them inside a promise messed that up.
     *
     * it() declaration: https://github.com/jasmine/jasmine/blob/master/src/core/Env.js - line 464
     *
     * @param fnString - a string consisting of the abstract function-in-test
     */
    this.canRun = function(fnString, desc, fn, timeout) {

         // console.log('\n################################################## PARSING THIS ##################################################',
         // '\n', fnString,
         // '\n ############################################################################################################\n');

        var tdRgx = /testData[\.\w]*/g;

        var matches = fnString.match(tdRgx);

        var slicedMatch = '';

        // Loop through each match and check against the JSON; return if missing in the JSON
        if (matches !== null) {
            for (var i = 0; i < matches.length; i++) {

                // Have to slice off "testData" because I suck at Regex :(
                slicedMatch = matches[i].slice(9);

                if (!lo.has(testData, slicedMatch)) {

                    // Increment skip counter
                    testsSkipped++;

                    console.log('Desired data', slicedMatch, 'skipping this test.',
                        '\nTotal tests skipped:', testsSkipped );

                    break;
                }

                // If no matches, all references to the testData file have been validated
                if (i + 1 == matches.length) {
                    it(desc, function() {
                        fn();
                    }, timeout);
                }
            }

            // If test has no references to the testData file, fire off test
        } else {
            it(desc, function() {
                fn();
            }, timeout);
        }
    };


    /**
     *  @description - Used by It() to determine if a test needs a pending bug fix or work in order to pass once again
     *  Simply add a case-insensitive variation of "fail" or "TODO" to the description of a test in order to skip it
     *
     *  @param desc - the description from the test/spec
     *
     *  @returns bool
     */
    this.shouldRun = function(desc) {

        var failRgx = /FAIL(s|ing|ed|ure)?/ig;
        var todoRgx = /TODO/ig;

         /*
            TODO (BM-556)
            Capture ticket numbers from the description and/or new meta-data array
            Query JIRA For those tickets and look at <ticket#>.status.name. If Resolved, Done, or Closed, this test can run (assuming description checks pass)
            If status = Ready for Test or Testing, run as well, and then update it's status to Resolved
            Could also add a tag in JIRA for issues that are regressed from this suite
            Multiple tickets can be assigned to a test if we take the meta-data approach
         */

        if (failRgx.test(desc) == true || todoRgx.test(desc) == true) {

            // Increment the global skip-tracker
            testsSkipped++;
            return true;
        } else {
            return false;
        }
    };


    /**
     * @description - Loops through ingested array-of-anonymous-functions, runs each one, reports on requirement failures, returns end-result (default true)
     *
     * @param reqs - array of anonymous functions; should always return booleans
     * @returns {boolean}
     */
    this.validateRequirements = function(reqs) {
        var shouldSkip = true;
        var failedReqs = '';
        var snapTestsSkipped = testsSkipped;

        for (var i=0; i < reqs.length; i++) {

            // If the anonymous function in reqs is false, return false and exit the loop
            if (!reqs[i]()) {

                // Increment testSkip counter, but never more than one per test despite amount of requirement failures
                if (snapTestsSkipped === testsSkipped) { testsSkipped++; }

                // Add to string of failed requirements for output below
                failedReqs = failedReqs + reqs[i].toString() + '\n';

                shouldSkip = false;
            }
        }

        if (!shouldSkip) {
            console.log('\n############################################## Test Requirements Not Met ##############################################' +
                '\n' + failedReqs +
                '\nTotal tests skipped: ' + testsSkipped + '\n');
        }

        return shouldSkip;
    };


    /*
     * Jasmine's customMatcher object - all new customMatchers go in here

        Contents:
            isValidSelector
     */
    this.customMatchers = {

        /**
         *
         * @description - This matcher is used to check the validity of a selector/locator. At the base level it
         * @description - performs a isDisplayed() check that, upon failure, returns which selector is invalid
         *
         * Note that the decision to use isDisplayed() was more or less arbitrary: ANY validation will fail if the selector is bad
         *
         * @param element - the selector element being validated
         * @param name - a string representation of the selector; passed right through for useful output
         * @param parent(optional) - a parent element to be used to validate the workflow context of the selector
         * @param parentName(optional) - string representation of the parent element; passed right through for error output
         * @param nonVisibleElement - defaults to false, if made true the check will use isPresent() instead of isDisplayed(); good for elements that aren't visible
         *
         * @TODO - Figure out how to make the stack trace point to the selector that failed, somehow
         *
         * @returns {{}}
         */
        isValidSelector: function() {

            return {

                compare: function(element, name, parent, parentName, ignoreVisibility) {
                    console.log('Validating selector:', name);

                    // Argument Handling ------------------------------------------------

                    // Have to build an array of arguments, since the arguments object is drunk
                    var argArray = Array.prototype.slice.call(arguments);

                    for ( var i = 0; i < argArray.length; i++ ) {

                        // If any optional args specified
                        if (i > 1) {

                            // If boolean, must be ignoreVisibility
                            if (typeof argArray[i] == 'boolean') {
                                    ignoreVisibility = argArray[i];
                            }

                            // If object, this must be the parent element
                            else if (typeof argArray[i] == 'object') {
                                parent = argArray[i];
                            }

                            // If string, must be parentName
                            else if (typeof argArray[i] == 'string') {
                                parentName = argArray[i];
                            }

                            // TODO - optional: If only an object or a string specified, fail and complain - need both to check vs. parent!
                        }
                    }
                    // -----------------------------------------------------------------

                    var result = {};

                    // TODO - Get the pageObject from the 'name' param (regex out before the dot), and validate we're on the correct page via URL, grandparent, or parent check
                    // kick back with "Workflow Invalid: +name+ not found on <currentURL>, or: "Workflow Invalid: +name+ not found inside +parent+


                    // Handler for $$()/elementAll(); just gets the first one found and sets element to that
                    if (Array.isArray(element)) {

                        // If empty, the selector is bad!
                        if (element.length == 0 ) {

                            result.message = 'Selector: "' + name + '" (multi-selector) is invalid; needs to be rebuilt';

                            // Fail the assertion and return
                            result.pass = false;
                            return result;

                        } else {

                            element = element[0];
                        }
                    }

                    result.pass = element.isDisplayed().then(function(displayed) {

                        // All good!
                        if (displayed) {
                            result.message = 'Valid selector and workflow!';

                            return true;

                        // Selector good, but element not visible...but we don't care
                        } else if(ignoreVisibility){
                            result.message = name + ' is good, but is hidden and we don\'t care';

                            return true;

                        // Selector good, but element not visible, and we DO care
                        } else {
                            result.message = name + ' is good, but is hidden; adjust workflow.';

                            return false;
                        }

                        // Selector is bad; isDisplayed() could not locate element
                    }, function(err) {
                        result.message = 'Selector: "' + name + '" is invalid; needs to be rebuilt.';

                        return false;
                    });

                    return result;
                }
            }
        }
    }
};

module.exports = new tools();
