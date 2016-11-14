/**
 * Page object for /#/login
 *
 * @copyright Copyright (c) 2014 - 2016 FATHOM Water Management, Inc. All Right Reserved
 * */
var globalData = require ('./../common/globalData.js');
var commonData = require('./../common/commonData.js');
var summaryPage = require('./summaryPage.js');
var CSRInterface = require('./CSRInterface.js');
var settingsPage = require('./settingsPage.js');

var loginPage = function() {

    this.userNameField = element(by.model('username'));
    this.passwordField = element(by.model('password'));
    this.rememberMeCheckbox = element(by.model('login.rememberLogin'));
    this.signInButton = element(by.id('btn_signin'));
    this.passwordReset = element(by.css('[ng-href="#/reset"]'));
    this.signupLink = element (by.css('[ng-href="#/register"]'));
    this.loginErrorMessage = element(by.css('[ng-show="LoginError"]'));
    this.payNowButton = element(by.id('btn_payment'));
    this.titleImage = element(by.css('[class="muni-logo"]'));

    this.unconfirmedErrorMessageText = 'Account not yet confirmed.';

    // /#/logout page
    this.logInAgainButton = element(by.css('[ng-click="returnToLogin()"]'))

    this.get = function() {
        browser.get(commonData.baseURL + globalData.loginURL);
    };

    /**
     * Validates the presence of required elements of /#/login page.
     */
    this.validate = function() {

        // Check URL
        browser.getCurrentUrl().then(function(url) {
            expect(url == (commonData.baseURL + globalData.loginURL)).toBe(true,
                'Login Page validation failed: Login URL does not equal: ' + commonData.baseURL + globalData.loginURL);
        });

        // Check elements
        expect((this.rememberMeCheckbox).isDisplayed()).toBe(true,
            'Login Page validation failed: Remember Me Checkbox is not displayed');
        expect((this.userNameField).isDisplayed()).toBe(true,
            'Login Page validation failed: Username Field is not displayed');
        expect((this.passwordField).isDisplayed()).toBe(true,
            'Login Page validation failed: Password Field is not displayed');
        expect((this.passwordReset).isDisplayed()).toBe(true,
            'Login Page validation failed: Password Reset button is not displayed');
        expect((this.signupLink).isDisplayed()).toBe(true,
            'Login Page validation failed: Sign up Link is not displayed');
        expect((this.payNowButton).isDisplayed()).toBe(true,
            'Login Page validation failed: Pay Now Button is not displayed');
        expect((this.titleImage).isDisplayed()).toBe(true,
            'Login Page validation failed: Title Image is not displayed');
        
        // REST-dependent customizer tests
        this.titleImage.getAttribute('ng-src').then(function (src) {
            commonData.elementCustomizerIsValid(src, 'muni_logo',
                ['../images/logo.jpg', '../images/utilitylogo.png']);
        });
        this.contactDivPhoneNumber.getText().then(function (text) {
            commonData.elementCustomizerIsValid(text, 'login_page_help_phone');
        });
    };

    /**
     * Logs into /#/login with ingested credentials
     * @param user
     * @param password
     * @returns require('./dashboard.js')
     * @constructor
     */
    this.login = function Login(user, password) {
        this.userNameField.clear();
        this.userNameField.sendKeys(user);
        this.passwordField.sendKeys(password);
        this.signInButton.click();
        return require('./summaryPage.js')
    };

    /**
     * Validates that the user succesfully logged in. Validates off of URL and TODO - add user information block
     * @param userType - type of login: regular, CSR, admin
     * @param email - email used to login
     */
    this.validateSuccessfulLogin = function(userType, email, accountNumber) {

        browser.wait(function() {
            return browser.getCurrentUrl().then(function(url) {
                if (url != (commonData.baseURL + globalData.loginURL)
                    && url.includes(commonData.baseURL)) {
                    return true;
                }
                else {
                    throw('Login failed; login email used: ' + email +
                          '\n     URL = ' + url);
                }
            });
        });

        // Wait for the modal to be closed
        browser.wait(summaryPage.closeModalPopup()).then(function(modalResult) {
            if (modalResult) {
                switch (userType) {
                    case 'normal':
                    case 'regular':
                    case 'user':
                    case '':
                        summaryPage.collapsingSidebarFix();

                        expect((summaryPage.logoutButton).isDisplayed()).toEqual(true,
                            'Regular user login validation unsuccessful: Logout button not displayed.');
                        expect((summaryPage.homeButton).isDisplayed()).toBe(true,
                            'Regular user login validation unsuccessful: Home button not displayed.');
                        expect((summaryPage.settingsButton).isDisplayed()).toBe(true,
                            'Regular user login validation unsuccessful: Settings button not displayed.');

                        expect(summaryPage.userInfoBlock_AccountID.getText()).toMatch(accountNumber,
                            'Regular user login validation unsuccessful: getText() of account number does not match ' + accountNumber);

                        //globalData.superHandler(summaryPage.settingsButton, 'click');
                        //summaryPage.collapsingSidebarFix();

                        //expect(settingsPage.emailAddress.getAttribute('value')).toMatch(email,
                        //    'Regular user login validation unsuccessful: settingsPage email displayed does not match ' + email);

                        break;

                    case 'admin':
                        summaryPage.collapsingSidebarFix();

                        expect(browser.getCurrentUrl()).toEqual(commonData.baseURL + globalData.summaryURL,
                            'Admin login validation unsuccessful: Current URL incorrect.');
                        expect((CSRInterface.masqueradeAccountNumber).isDisplayed()).toEqual(true,
                            'Admin login validation unsuccessful: Masquerade Account Number field is not displayed');
                        expect((CSRInterface.masqueradeUnloadProfileButton).isDisplayed()).toEqual(true,
                            'Admin login validation unsuccessful: Masquerade Clear Profile Button field is not displayed');
                        expect((CSRInterface.masqueradeLoadProfileButton).isDisplayed()).toEqual(true,
                            'Admin login validation unsuccessful: Masquerade Load Profile Button field is not displayed');

                        break;

                    case 'CSR':
                    case 'csr':
                        expect(browser.getCurrentUrl()).toEqual(commonData.baseURL + globalData.summaryURL,
                            'CSR login validation unsuccessful: Current URL incorrect.');
                        expect((CSRInterface.masqueradeAccountNumber).isDisplayed()).toEqual(true,
                            'CSR login validation unsuccessful: Login validation unsuccessful: Masquerade Account Number field is not displayed');
                        expect((CSRInterface.masqueradeUnloadProfileButton).isDisplayed()).toEqual(true,
                            'CSR login validation unsuccessful: Masquerade Clear Profile Button field is not displayed');
                        expect((CSRInterface.masqueradeLoadProfileButton).isDisplayed()).toEqual(true,
                            'CSR login validation unsuccessful: Masquerade Load Profile Button field is not displayed');
                        expect((CSRInterface.masqueradeHeaderBar).isDisplayed()).toEqual(true,
                            'CSR login validation unsuccessful: Masquerade Header Bar is not displayed');

                        break;
                }
            }
        });
    };

    var loginMessageDialog = function() {
        this.title = element(by.id('myModalLabel'))
    };

};

module.exports = new loginPage ();
