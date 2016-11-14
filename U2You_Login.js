/**
 * Environment setup
 */

// Requires
var globalData = require ('../common/globalData.js');
var loginPage = require('../pageObjects/loginPage.js');
var commonData = require('../common/commonData.js');
var forgotPasswordPage = require ('../pageObjects/forgotPasswordPage.js');
var dashboardPage = require('../pageObjects/summaryPage.js');

// Hookup environment test data
commonData.setupTestData(browser.params.environment);

/**
 * @name Basic UI login testing
 * @see https://fathom.aha.io/features/AMPM-30
 * @copyright Copyright (c) 2014, 2015 FATHOM Water Management, Inc. All Right Reserved
 */

describe ('Base tests on /#/login', function() {

    // Setup
    beforeEach(function() {
        loginPage.get();
        globalData.resizeWindowToStandard();
    });

    if (commonData.U2You_Login.verifiesRequiredElements) {
        it ('Verifying required elements are displayed', function(){

            loginPage.validate();
        });
    }
    else {
        console.log('TEST DISABLED: Verifying required elements are displayed');
    }

    if (commonData.U2You_Login.invalidInputName) {
        it('Testing invalid username inputs', function () {

            var userName = "kksmfgvls(*&%^   $#@!$%^YUTHGFDEWRYUKHJGFDrgfbdasgfbvdieufdkjsaoifeudjksowiurefjdi439523457ifhsdlkfhsdkfhur34hr9348r7fiusdaclkvsbdf)fnlsfnlkvbfsnvosnon34254352435@$#%$@#%$@#%$@#%#$@%67knsdlfkndsfnsdlfkmnsjdfksfs 345#%#$%#%34 3519iewiasfjzlkvnlfngAJANSDLKJBASDKASDH(^*^%^%E&*UMJHkbib)";
            var password = "nuh uh uh you didn't say the magic word";
            loginPage.login(userName, password);

            expect(loginPage.loginErrorMessage.isDisplayed()).toBe(true,
                'Login Error Message not displayed');
        });
    }
    else {
        console.log('TEST DISABLED: Testing invalid username inputs');
    }

    if (commonData.U2You_Login.validUserInvalidPass) {
        it('Testing valid username with invalid password inputs', function() {

            loginPage.login("test1@test.com", "not the right password");

            expect(loginPage.loginErrorMessage.isDisplayed()).toBe(true,
                'Login Error Message not displayed');
        });
    }
    else{
        console.log('TEST DISABLED: Testing valid username with invalid password inputs');
    }

    if (commonData.U2You_Login.invalidUserValidPass) {
        it('Testing invalid username with invalid password inputs', function() {

            loginPage.login("thisshouldnot@work.com", commonData.primaryUserPassword);

            expect(loginPage.loginErrorMessage.isDisplayed()).toBe(true,
                'Login Error Message not displayed');
        });
    }
    else {
        console.log('TEST DISABLED: Testing invalid username with invalid password inputs');

    }

    if (commonData.U2You_Login.signInNormal) {
        it('Signing in with RESIDENTIAL user ', function () {

            loginPage.login(commonData.primaryEmailAddress, commonData.primaryUserPassword);

            // Validation
            loginPage.validateSuccessfulLogin('user', commonData.primaryEmailAddress);
        });
    }
    else {
        console.log('TEST DISABLED: Signing in with normal user');
    }

    if(commonData.U2You_Login.signInCommercial) {
        it('Signing in with COMMERCIAL user', function() {

            loginPage.login(commonData.commercialEmailAddress, commonData.commercialUserPassword);

            // Validation
            loginPage.validateSuccessfulLogin('commercial', commonData.commercialEmailAddress);
        });
    }

    if (commonData.U2You_Login.signInCSR) {
        it('Signing in with CSR user', function () {

            loginPage.login(commonData.CSREmailAddress, commonData.primaryUserPassword);

            // Validation
            loginPage.validateSuccessfulLogin('csr', commonData.CSREmailAddress);
        });
    }
    else {
        console.log('TEST DISABLED: Signing in with CSR user');
    }

    if (commonData.U2You_Login.verifyRememberMe) {
        it('Verifies Remember Me checkbox functionality', function () {

            loginPage.rememberMeCheckbox.click();
            loginPage.login(commonData.primaryEmailAddress, commonData.primaryUserPassword);

            loginPage.validateSuccessfulLogin('user', commonData.primaryEmailAddress);

            var currentUrl;
            // Cache current URL before logging out
            browser.getCurrentUrl().then(function(url) {
                    currentUrl = url;
                    dashboardPage.logoutButton.click();
                }
                // After logging out, get new URL, then wait until new one doesn't equal the old
            ).then(function() {
                    browser.wait(function() {
                        return browser.getCurrentUrl().then(function (url) {
                            return url !== currentUrl;
                        });
                    });
                }
            ).then(function() {
                    // Wait for /#/login to load
                    var currentURL;
                    browser.getCurrentUrl().then(function(url) {
                        currentURL = url;

                        loginPage.get();

                        browser.wait(function () {
                            return browser.getCurrentUrl().then(function (url) {
                                return url !== currentUrl;
                            });
                        });
                        // See if remembered username input is still in field
                        expect(loginPage.userNameField.getAttribute('value')).toEqual(commonData.primaryEmailAddress,
                            'Remembered username is not in the field');
                    });
                });

            // Uncheck Remember Me field
            loginPage.rememberMeCheckbox.click();
        });
    }
    else {
        console.log('TEST DISABLED: Verifies Remember Me checkbox functionality');
    }

    if (commonData.U2You_Login.unconfirmedAccount) {
        it('Verifies inability to login to unconfirmed account', function() {

            // Populate login fields with unconfirmed account info
            loginPage.userNameField.clear();
            loginPage.userNameField.sendKeys(commonData.unconfirmedEmailAddress);
            loginPage.passwordField.clear();
            loginPage.passwordField.sendKeys(commonData.unconfirmedUserPassword);

            // Submit credentials
            loginPage.signInButton.click();

            expect(loginPage.loginErrorMessage.getText()).toMatch(loginPage.unconfirmedErrorMessageText);
        });
    }
    else {
        console.log('TEST DISABLED: Verifies inability to login to unconfirmed account');
    }
});
