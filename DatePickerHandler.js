// DatePicker handler from Fathom's U2You project

this.selectDate = function(day, month, year) {
        var datePicker = element(by.css('[class="datepicker datepicker-dropdown dropdown-menu datepicker-orient-left datepicker-orient-top"]'));
        var datePicker_Days = element(by.css('[class="datepicker-days"]'));
        var datePicker_Months = element(by.css('[class="datepicker-months"]'));
        var datePicker_Years = element(by.css('[class="datepicker-years"]'));
        var paneSwitcher = datePicker.element(by.css('[class="datepicker-switch"]'));
        var previousButton_Months = datePicker_Months.element(by.css('[class="prev"]'));
        var nextButton_Months = datePicker_Months.element(by.css('[class="next"]'));
        var nextButton = element(by.css('[class="next"]'));
        var _this = this;

        // Set default date
        day = day || '1';
        month = month || 'Jan';
        year = year || '2015';

        // Open the date picker
        this.paymentDate.click();

        // Get current date
        this.paymentDate.getAttribute('value').then(function(currentDate) {

            // Split date by spaces to get year
            var currentDateSplit = currentDate.split(" ");
            console.log('Current Date: ' + currentDate + '\nCurrent Year: ' + currentDateSplit[2]);

            // Changes to backslashes after initial form change; must re-split
            if (typeof currentDateSplit[2] == 'undefined') {
                currentDateSplit = currentDate.split("/");
                console.log('Re-split Current Year: ' + currentDateSplit[2]);
            }

            // If something was passed in for year, select a new year, month, and day
            if (typeof year !== 'undefined') {
                paneSwitcher.click();

                // Take difference of years and click 'prev' or 'next' button accordingly
                var intYear = parseInt(year);
                if (intYear < currentDateSplit[2]) {
                    var goalYear = currentDateSplit[2] - intYear;

                    // IFFE loop to click the button however many times necessary
                    for (var i = 0; i < goalYear; i++) {
                        (function() {
                                previousButton_Months.click();
                            } (i)
                        );
                    }
                }
                if (intYear > currentDateSplit[2]) {
                    goalYear = intYear - currentDateSplit[2];

                    // IFFE loop to click the button however many times necessary
                    for (var j = 0; j < goalYear; j++) {
                        (function() {
                                nextButton_Months.click();
                            } (j)
                        );
                    }
                }

                datePicker_Months.element(by.cssContainingText('[class="month"]', month)).click();
                datePicker_Days.element(by.cssContainingText('[class="day"]', day)).click();

                // If nothing was passed in for year, but something was passed in for month, select new month and day
            } else if (typeof month !== 'undefined') {
                paneSwitcher.click();
                datePicker.element(by.cssContainingText('[class="month"]', month)).click();
                datePicker_Days.element(by.cssContainingText('[class="day"]', day)).click();

                // If only day was passed in, just select a new day
            } else {
                datePicker.element(by.cssContainingText('[class="day"]', day)).click();
            }
            _this.paymentAmount.click();
        });
    }
