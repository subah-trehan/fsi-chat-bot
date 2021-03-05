// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ChoicePrompt, ComponentDialog, WaterfallDialog } = require('botbuilder-dialogs');

const REVIEW_RATING_DIALOG = 'REVIEW_RATING_DIALOG';

const CHOICE_PROMPT = 'CHOICE_PROMPT';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
const axios = require("axios");

class ReviewRatingDialog extends ComponentDialog {
    constructor() {
        super(REVIEW_RATING_DIALOG);

        // Define a "done" response for the company selection prompt.
        this.doneOption = 'done';

        // Define value names for values tracked inside the dialogs.
        this.ratingSelected = 'value-ratingSelected';

        // Define the company choices for the company selection prompt.
        this.ratingOptions = ['1', '2', '3','4','5'];

        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
       
        //this.addDialog(new ReviewSelectionDialog());
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.selectionStep.bind(this),
            this.loopStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    async selectionStep(stepContext) {
        // Continue using the same selection list, if any, from the previous iteration of this dialog.
        const list = Array.isArray(stepContext.options) ? stepContext.options : [];
        stepContext.values[this.ratingSelected] = list;

        // Create a prompt message.
        let message = 'Did you like talking to me today? Please leave us your feedback so we can use it to improve our services.';
       /* if (list.length === 0) {
            message = `Hey \`${ userProfile.name }\` ,Please choose an option to learn more, or \`${ this.doneOption }\` to finish.`;
        } else {
            message = `You have selected **${ list[0] }**. You can review an additional option, or choose \`${ this.doneOption }\` to finish.`;
        }*/

        // Create the list of options to choose from.
        const options = this.ratingOptions.filter(function(item) { return item !== list[0]; })
            //: this.companyOptions.slice();
        options.push(this.doneOption);

        // Prompt the user for a choice.
        return await stepContext.prompt(CHOICE_PROMPT, {
            prompt: message,
            retryPrompt: 'Did you like talking to me today? Please leave us your feedback. We will use it to improve our services. Thank you.',
            choices: options
        });
    }

    async loopStep(stepContext) {
        // Retrieve their selection list, the choice they made, and whether they chose to finish.
        var list = stepContext.values[this.ratingSelected];
        const choice = stepContext.result;
        const done = choice.value === this.doneOption;

        if (!done) {
            // If they chose a company, add it to the list.
            list.push(choice.value);
        }

        if (done || list.length > 0) {
            
             //eeIngestUrl = eeIngestUrl + '&rating='+choice.value;
             let ratingUrl = eeIngestUrl + '&rating='+choice.value;
             console.log("ratingUrl -final:"+ratingUrl);
             console.log("eeIngestUrl -global:"+global.eeIngestUrl);
             let results = await axios.get(ratingUrl); 
             console.log("####results :######"+results.data.body);
            // If they're done, exit and return their list.
             return await stepContext.endDialog();
            
        } else {
            // Otherwise, repeat this dialog, passing in the list from this iteration.
            return await stepContext.replaceDialog(REVIEW_RATING_DIALOG, list);
        }
    }
}

module.exports.ReviewRatingDialog = ReviewRatingDialog;
module.exports.REVIEW_RATING_DIALOG = REVIEW_RATING_DIALOG;
