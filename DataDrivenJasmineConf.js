// The usage layer added to Jasmine to support data-driven Protractor testing. I basically wrap Jasmine's it() with other "phases", essentially creating a new test definition: 'abstractTest()'
// These tests can be used along with regular 'it()' tests
// The implementation lived in DataDriveJasmineTools.js
// The phases are:
//  - Scans test description for keywords that determines if the test runs or not, and contributes decision to final output
//  - Scan test for defined data requirements from the test's 'requirements' object
//  - Look through the test, grab all the JS selectors it needs, and run simple verifications against the actual UI to see if they're still valid (not stale)
//  - If all is well, run the test!

// Actual pageObject and references have been obfuscated from their original incarnation

onPrepare: function() {

        global.testsSkipped = 0;

        global.envData = require('../EnvironmentConfigs/' + browser.params.env);

        global.testData = require('../TestDataHooks/' + browser.params.data);

        global.routes = require('./Common/Routes.js');

        global.tools = require('./Common/Tools.js');
        
        // Re-definition of it() that will toggle the test based on:
        // - explicit data requirements w/ tools.validateRequirements()
        // - inexplicit data requirements w/ tools.canRun()
        // - flags in the description (EG - "FAILS") w/ tools.shouldRun()

        // We can further extend this to contribute meta-data about suites, tests, etc. (EG the global 'testsSkipped' counter)
        global.abstractTest = function(params) {

            // Checks for "fail" and/or "todo" in the description of each test
            if (tools.shouldRun(params.desc) == false)  {

                // Check for specific data requirements of the test
                if (params.requirements) {

                    // Finally, check if all testData references are valid
                    var stringifiedTest = params.requirements.toString() + params.main.toString();
                    tools.canRun(stringifiedTest, params.desc, params.main, params.timeout);
                }

            } else {
                console.log('\n############################################## Known Failure Encountered ##############################################' +
                    '\nSkipping due to known failure: "' + params.desc + '"' +
                    '\nTotal tests skipped: ' + testsSkipped + '\n');
            }
        };
}
