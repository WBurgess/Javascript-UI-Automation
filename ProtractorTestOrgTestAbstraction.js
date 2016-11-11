//Example of organization of toggling tests in protractor & environment setup

// Create an environment object - holds environment-specific variables
this.devTestData = {
        name: 'Dev',

        URL: 'https://env.u2you.gwfathom.com',

        // Primary account
        primaryEmailAddress: 'FathomQA@mailinator.com',
        primaryFirstName: 'WillTestFirst',
        primaryLastName: 'WillTestLast',
        primaryUserName: (this.primaryFirstName + ' ' + this.primaryLastName),
        primaryPhoneNumber: '1112223333',

        primaryStreetAddress: {
            street: '21410 N. 19th Avenue', ste: 'Suite 201', city: 'Phoenix',
            state: 'Arizona', stateAbrv: 'AZ', zip: '85027'
        },

        primaryUserPassword: 'Password123!',
        primarySecurityQuestion: 'What did the 5 fingers say to the face?',
        primarySecurityAnswer: 'SLAP!',
        primaryNumberOfOccupants: '1',
        primaryThreshold: '1000',
        primaryUsageUnitsValue: '0',
        primaryUsageUnitsValue_Text: 'Gallons',
        primaryUserAccountNumber: '001839424',
        primaryAccountType: 'RESIDENTIAL'
}

// Create 'test toggle objects' for each file that list tests inside each file
// Test toggle objects
    this.U2You_NewUser = {
        verifiesRequiredElements:           false,
        createResidentialUser:              false,
        createCommercialUser:               false,
        createAccountNumberDifferentEmails: false,
        checkShowMeButtons:                 false
    };

    this.U2You_Balance = {
        verifiesRequiredElements:           false,
        verifiesChartAccuracy:              false,
        verifiesLegendColors:               false,
        verifiesLegendText:                 false,
        verifiesDonutTooltipData:           false
    };
    
// Finally, hook up environment data to test variables. Each file will always
// run a 'setupTestData()' which will hookup environment data to the tests
// This function will also toggle tests on/off for each environment
this.setupTestData = function(testData) {
        console.log('Running Environment Setup for: ' + testData.name);

        this.baseURL = testData.URL;

        this.primaryEmailAddress = testData.primaryEmailAddress;
        this.primaryFirstName = testData.primaryFirstName;
        this.primaryLastName = testData.primaryLastName;
        this.primaryUserName = testData.primaryFirstName + ' ' + testData.primaryLastName;
        this.primaryPhoneNumber = testData.primaryPhoneNumber;
        this.primaryAddress = testData.primaryAddress;
        this.primaryUserPassword = testData.primaryUserPassword;
        this.primarySecurityQuestion = testData.primarySecurityQuestion;
        this.primarySecurityAnswer = testData.primarySecurityAnswer;
        this.primaryNumberOfOccupants = testData.primaryNumberOfOccupants;
        this.primaryThreshold = testData.primaryThreshold;
        this.primaryUsageUnitsValue = testData.primaryUsageUnitsValue;
        this.primaryUsageUnitsValue_Text = testData.primaryUsageUnitsValue_Text;
        this.primaryUserAccountNumber = testData.primaryUserAccountNumber;

        this.CSREmailAddress = testData.CSREmailAddress;
        this.CSRPassword = testData.CSRPassword;
        this.CSRFirstName = testData.CSRFirstName;
        this.CSRLastName = testData.CSRLastName;
        this.CSRUserName = testData.CSRUserName;

        this.adminEmailAddress = testData.adminEmailAddress;
        this.adminPassword = testData.adminPassword;
        this.adminFirstName = testData.adminFirstName;
        this.adminLastName = testData.adminLastName;
        this.adminUserName = testData.adminUserName;

        this.altEmailAddress = testData.altEmailAddress;
        this.altUserPassword = testData.altUserPassword;
        this.altUserAccount = testData.altUserAccount;

        this.unconfirmedEmailAddress = testData.unconfirmedEmailAddress;
        this.unconfirmedUserPassword = testData.unconfirmedUserPassword;

        this.inactiveAccountNumber = testData.inactiveAccountNumber;

        this.timeZoneDifference = testData.timeZoneDifference;

        // Toggle specific tests for each environment
        switch (testData.name) {
            case 'Dev':
                // NewUser
                this.U2You_NewUser.verifiesRequiredElements =           true;
                this.U2You_NewUser.createResidentialUser =              true;
                this.U2You_NewUser.createCommercialUser =               true;
                this.U2You_NewUser.createAccountNumberDifferentEmails = true;
                this.U2You_NewUser.checkShowMeButtons =                 true;

                // Balance
                this.U2You_Balance.verifiesRequiredElements =           true;
                this.U2You_Balance.verifiesChartAccuracy =              true;
                this.U2You_Balance.verifiesLegendColors =               true;
                this.U2You_Balance.verifiesLegendText =                 true;
                this.U2You_Balance.verifiesDonutTooltipData =           true;
                
                break;
        }
}

// The tests are then wrapped by if statements that check the values stored here
if (commonData.testFile.verifiesDonutTooltipData) {
        it('Verifies donut tooltip accuracy', function() {
            console.log('TEST: Verifying donut data accuracy');

            // Pop the tooltip on the donut
            var donutStroke = balancePage.getElementFromTable('donut', 'stroke', '', '1');
            summaryPage.popTooltip(donutStroke, balancePage.donutTooltip);

            browser.sleep(1000);

            expect((balancePage.donutTooltip).getText()).toEqual(detailWaterAmount,
                'Inner text of donut tooltip does not equal ' + detailWaterAmount);
        });
}

