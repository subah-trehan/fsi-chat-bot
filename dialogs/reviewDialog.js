// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ChoicePrompt, ComponentDialog, WaterfallDialog } = require('botbuilder-dialogs');
const { InterestReviewSelectionDialog, INTEREST_REVIEW_SELECTION_DIALOG } = require('./reviewInterestSelectionDialog');
const { ReviewRatingDialog, REVIEW_RATING_DIALOG } = require('./reviewRatingDialog');
const { ReviewSelectionDialog, REVIEW_SELECTION_DIALOG } = require('./reviewSelectionDialog');
//const { RepeatSelectionDialog, REPEAT_SELECTION_DIALOG } = require('./repeatSelectionDialog');
const { UserProfile } = require('../userProfile');
const REVIEW_DIALOG = 'REVIEW_DIALOG';

const CHOICE_PROMPT = 'CHOICE_PROMPT';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';

class ReviewDialog extends ComponentDialog {
    constructor() {
        super(REVIEW_DIALOG);

        this.doneOption = 'done';
        this.reviewOptionSelected = 'value-reviewOptionSelected';
        this.reviewOptions = ['Yes', 'No'];
        
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
        //this.addDialog(new InterestReviewSelectionDialog());
        
      // this.addDialog(new RepeatSelectionDialog());
        this.addDialog(new ReviewRatingDialog());
      
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.selectionStep.bind(this),
            this.loopStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    async selectionStep(stepContext) {
        stepContext.values.userInfo = new UserProfile();
        // Continue using the same selection list, if any, from the previous iteration of this dialog.
        const list = Array.isArray(stepContext.options) ? stepContext.options : [];
        stepContext.values[this.reviewOptionSelected] = list;

        // Create a prompt message.
        let message = '';

        // Create the list of options to choose from.
        const options = this.reviewOptions.filter(function(item) { return item !== list[0]; })
            //: this.companyOptions.slice();
       // options.push(this.doneOption);

        // Prompt the user for a choice.
        return await stepContext.prompt(CHOICE_PROMPT, {
            prompt: message,
            retryPrompt: 'Please select the topic:',
            choices: options
        });
    }

    async loopStep(stepContext) {
        // Retrieve their selection list, the choice they made, and whether they chose to finish.
        var list = stepContext.values[this.reviewOptionSelected];
        const choice = stepContext.result;
        const done = choice.value === this.doneOption;
        
        if (!done) {
           
            list.push(choice.value);
        }

        if (done || list.length > 0) {
          const userProfile = stepContext.values.userInfo;
          console.log("reaching here")
          userProfile.review= stepContext.result.value || [];
           console.log("reaching here1")
            // If they're done, exit and return their list.
            if(`${ list[0] }` == this.reviewOptions[1]){
                list =[];
                  console.log(`reviewDialog ${ list[0] }`)
                 return await stepContext.beginDialog(REVIEW_RATING_DIALOG);
            }
            if(`${ list[0] }` == this.reviewOptions[0]){
                 list =[];
                 console.log(`reviewDialog ${ list[0] }`)
                  return  await stepContext.endDialog(userProfile);
                 //  return await stepContext.beginDialog(REPEAT_SELECTION_DIALOG);
            }
            
        } else {
            // Otherwise, repeat this dialog, passing in the list from this iteration.
            return await stepContext.replaceDialog(REVIEW_DIALOG, list);
        }
    }
}

module.exports.ReviewDialog = ReviewDialog;
module.exports.REVIEW_DIALOG = REVIEW_DIALOG;
