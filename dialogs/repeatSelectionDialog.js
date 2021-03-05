// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ChoicePrompt, ComponentDialog, WaterfallDialog } = require('botbuilder-dialogs');
const { InterestReviewSelectionDialog, INTEREST_REVIEW_SELECTION_DIALOG } = require('./reviewInterestSelectionDialog');
const { ReviewRatingDialog, REVIEW_RATING_DIALOG } = require('./reviewRatingDialog');
const { ReviewSelectionDialog, REVIEW_SELECTION_DIALOG } = require('./reviewSelectionDialog');
const { UserProfile } = require('../userProfile');
const REPEAT_SELECTION_DIALOG = 'REPEAT_SELECTION_DIALOG';

const CHOICE_PROMPT = 'CHOICE_PROMPT';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';

class RepeatSelectionDialog extends ComponentDialog {
    constructor() {
        super(REPEAT_SELECTION_DIALOG);

        // Define a "done" response for the selection prompt.
        this.doneOption = 'done';

        // Define value names for values tracked inside the dialogs.
        this.reviewOptionSelected = 'value-reviewOptionSelected';

        // Define the company choices for the  selection prompt.
        this.reviewOptions = ['Yes', 'No'];
        
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
        //this.addDialog(new InterestReviewSelectionDialog());
        
        this.addDialog(new ReviewSelectionDialog());
      
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.selectionStep.bind(this),
           // this.loopStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    async selectionStep(stepContext) {
         await stepContext.endDialog(userProfile);
         return await stepContext.replaceDialog(REVIEW_SELECTION_DIALOG);
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
            }
            
        } else {
            // Otherwise, repeat this dialog, passing in the list from this iteration.
            return await stepContext.replaceDialog(REVIEW_DIALOG, list);
        }
    }
}

module.exports.RepeatSelectionDialog = RepeatSelectionDialog;
module.exports.REPEAT_SELECTION_DIALOG = REPEAT_SELECTION_DIALOG;
