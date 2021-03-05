// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ChoicePrompt , ComponentDialog, NumberPrompt, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');
const { UserProfile } = require('../userProfile');
const { ReviewRatingDialog, REVIEW_RATING_DIALOG } = require('./reviewRatingDialog');
const APPLICATION_STATUS_DIALOG = 'APPLICATION_STATUS_DIALOG';

const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
const TEXT_PROMPT = 'TEXT_PROMPT';
const NUMBER_PROMPT = 'NUMBER_PROMPT';
const CHOICE_PROMPT = 'CHOICE_PROMPT';
class ApplicationStatusDialog extends ComponentDialog {
    constructor() {
        super(APPLICATION_STATUS_DIALOG);
        //this.addDialog(new TextPrompt(TEXT_PROMPT));
        this.doneOption = 'done';
        this.reviewOptionSelected = 'value-reviewOptionSelected';
        this.reviewOptions = ['Yes', 'No'];
         this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new ReviewRatingDialog());
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            
            this.getApplicationStatus.bind(this),
            this.confirmSelectionStep.bind(this),
             this.retrieveConfirmSelectionStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

       async getApplicationStatus(stepContext) {
           console.log("accoundID in status",accountId)
        await stepContext.context.sendActivity(`Your application number ${accountId } is approved.`);
        await stepContext.context.sendActivity('Is there anything else I can help you with today?');
       return await stepContext.next();
    }

async confirmSelectionStep(stepContext) {
        stepContext.values.userInfo = new UserProfile();
        const list = Array.isArray(stepContext.options) ? stepContext.options : [];
        stepContext.values[this.reviewOptionSelected] = list;
        let message = '';
        const options = this.reviewOptions.filter(function(item) { return item !== list[0]; })
        return await stepContext.prompt(CHOICE_PROMPT, {
            prompt: message,
            retryPrompt: 'Please select the topic:',
            choices: options
        });
    }
     async retrieveConfirmSelectionStep(stepContext) {
        // Retrieve their selection list, the choice they made, and whether they chose to finish.
        var list = stepContext.values[this.reviewOptionSelected];
        const choice = stepContext.result;
        const done = choice.value === this.doneOption;
        
        if (!done) {
           
            list.push(choice.value);
        }

        if (done || list.length > 0) {
          const userProfile = stepContext.values.userInfo;
          userProfile.review= stepContext.result.value || [];
            if(`${ list[0] }` == this.reviewOptions[1]){
                list =[];
                  console.log(`reviewDialog ${ list[0] }`)
                return await stepContext.beginDialog(REVIEW_RATING_DIALOG);
                // return await stepContext.next();
            }
            if(`${ list[0] }` == this.reviewOptions[0]){
                 list =[];
                 global.repeatSelection = true ;
               //  console.log(`reviewDialog ${ list[0] }`)
                  return await stepContext.endDialog();
            }
            
        } 
    }
    
    
}

module.exports.ApplicationStatusDialog = ApplicationStatusDialog;
module.exports.APPLICATION_STATUS_DIALOG = APPLICATION_STATUS_DIALOG;
