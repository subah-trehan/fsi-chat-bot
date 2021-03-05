// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ChoicePrompt, ComponentDialog,TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');
const { ReviewRatingDialog, REVIEW_RATING_DIALOG } = require('./reviewRatingDialog');
const INTEREST_REVIEW_SELECTION_DIALOG = 'INTEREST_REVIEW_SELECTION_DIALOG';
const { ReviewDialog, REVIEW_DIALOG } = require('./reviewDialog');
const CHOICE_PROMPT = 'CHOICE_PROMPT';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
const TEXT_PROMPT = 'TEXT_PROMPT';
const axios = require("axios");
const { UserProfile } = require('../userProfile');

class InterestReviewSelectionDialog extends ComponentDialog {
    constructor() {
        super(INTEREST_REVIEW_SELECTION_DIALOG);

        // Define a "done" response for the interest selection prompt.
        this.doneOption = 'No'; 

        // Define value names for values tracked inside the dialogs.
        this.interestSelected = 'value-interestSelected';
        // Define value names for values tracked inside the dialogs.
        this.reviewOptionSelected = 'value-reviewOptionSelected';

        // Define the company choices for the  selection prompt.
        this.reviewOptions = ['Yes', 'No'];
        // Define the interest choices for the interest selection prompt.
        this.interestOptions = ['Credit Card', 'Savings', 'Insurance','No']; 
         
        this.addDialog(new ReviewDialog());
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
         this.addDialog(new TextPrompt(TEXT_PROMPT));
        this.addDialog(new ReviewRatingDialog());
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.promptInterestSelectionStep.bind(this),
            this.retreiveInterestSelectionStep.bind(this),
             this.continueWithSelectedInterest.bind(this),
             this.confirmSelectionStep.bind(this),
             this.retrieveConfirmSelectionStep.bind(this),
             
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    async promptInterestSelectionStep(stepContext) {
        // Continue using the same selection list, if any, from the previous iteration of this dialog.
        const list = Array.isArray(stepContext.options) ? stepContext.options : [];
        stepContext.values[this.interestSelected] = list;

        // Create a prompt message.
        let message = 'Would you like to learn more about our lastest offers?';
        const options = this.interestOptions.filter(function(item) { return item !== list[0]; })
        return await stepContext.prompt(CHOICE_PROMPT, {
            prompt: message,
            retryPrompt: 'Would you like to learn more about our latest offers?',
            choices: options
        });
    }

    async retreiveInterestSelectionStep(stepContext) {
        var list = stepContext.values[this.interestSelected];
        const choice = stepContext.result;
        const done = choice.value === this.doneOption;
 console.log("retreiveInterestSelectionStep");
        if (!done) {
            // If they chose a company, add it to the list.
            list.push(choice.value);
        }

        if (!done && list.length > 0) {
            list =[];
             let offerUrl = eeIngestUrl + '&offer='+choice.value;
             let results = await axios.get(offerUrl); 
              if (!loggedInUser) {
             stepContext.values.userInfo = new UserProfile();
            const promptOptions = { prompt: 'Please share your email address for further communication.' };
            return await stepContext.prompt(TEXT_PROMPT, promptOptions); 
            }
             return await stepContext.next();
             
              
            
        } else {
            console.log("end Selection");
            //return await stepContext.replaceDialog(INTEREST_REVIEW_SELECTION_DIALOG, list);
            endSelection = true ;
             return await stepContext.beginDialog(REVIEW_RATING_DIALOG);
        }
    }
    
      async continueWithSelectedInterest(stepContext) {
          if(endSelection){
                endSelection = false;
                return await stepContext.endDialog();
               
          }
        await stepContext.context.sendActivity('I created a case and our consulant will get back to you today with the offer details.');
               await stepContext.context.sendActivity('Is there anything else I can help you with today?');
             return await stepContext.next();
    }
    
       async confirmSelectionStep(stepContext) {
        stepContext.values.userInfo = new UserProfile();
        
        const list = Array.isArray(stepContext.options) ? stepContext.options : [];
        stepContext.values[this.reviewOptionSelected] = list;
        let message = '';
        const options = this.reviewOptions.filter(function(item) { return item !== list[0]; })
        console.log("confirmSelectionStep")
        return await stepContext.prompt(CHOICE_PROMPT, {
            prompt: message,
            retryPrompt: 'Please select the topic:',
            choices: options
        });
    }
     async retrieveConfirmSelectionStep(stepContext) {
        console.log("retrieveConfirmSelectionStep")
        var list = stepContext.values[this.reviewOptionSelected];
        const choice = stepContext.result;
        const done = choice.value === this.doneOption;
        console.log('retrieveConfirmSelectionStep',choice.value)
        if (!done) {
           console.log('here',choice.value)
            list.push(choice.value);
        }
list.push(choice.value);
        if (list.length > 0) {
              console.log('here1',choice.value)
          const userProfile = stepContext.values.userInfo;
          userProfile.review= stepContext.result.value || [];
            if(`${ list[0] }` == this.reviewOptions[1]){
                list =[];
                  console.log('here2',choice.value)
                 // console.log(`reviewDialog ${ list[0] }`)
                return await stepContext.beginDialog(REVIEW_RATING_DIALOG);
                 //return await stepContext.next();
            }
            if(`${ list[0] }` == this.reviewOptions[0]){
                 list =[];
                   console.log('here3',choice.value)
                global.repeatSelection = true ;
               //  console.log(`reviewDialog ${ list[0] }`)
               if(!loggedInUser){
                    return await stepContext.replaceDialog(INTEREST_REVIEW_SELECTION_DIALOG);
               }else{
                  return await stepContext.endDialog();
                  
               }
            }
            
        } 
    }
}

module.exports.InterestReviewSelectionDialog = InterestReviewSelectionDialog;
module.exports.INTEREST_REVIEW_SELECTION_DIALOG = INTEREST_REVIEW_SELECTION_DIALOG;
