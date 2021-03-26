// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ChoicePrompt, ComponentDialog, WaterfallDialog } = require('botbuilder-dialogs');
const { InterestReviewSelectionDialog, INTEREST_REVIEW_SELECTION_DIALOG } = require('./reviewInterestSelectionDialog');
const { ReviewRatingDialog, REVIEW_RATING_DIALOG } = require('./reviewRatingDialog');
const { ReviewDialog, REVIEW_DIALOG } = require('./reviewDialog');
const { ApplicationStatusDialog, APPLICATION_STATUS_DIALOG } = require('./applicationStatusDialog');
const { UserProfile } = require('../userProfile');
const REVIEW_SELECTION_DIALOG = 'REVIEW_SELECTION_DIALOG';
const axios = require("axios");
const CHOICE_PROMPT = 'CHOICE_PROMPT';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';

class ReviewSelectionDialog extends ComponentDialog {
    constructor() {
        super(REVIEW_SELECTION_DIALOG);

        // Define a "done" response for the selection prompt. 
        this.doneOption = 'done';

        // Define value names for values tracked inside the dialogs.
        this.optionSelected = 'value-optionSelected';

        // Define the company choices for the  selection prompt.
        this.topicOptions = ['Check my account balance', 'Learn more about our latest offers', 'Check your application status'];

        this.reviewOptionSelected = 'value-reviewOptionSelected';

        // Define value names for values tracked inside the dialogs.
        this.ratingSelected = 'value-ratingSelected';

        // Define the company choices for the company selection prompt.
        this.ratingOptions = ['1', '2', '3','4','5'];


        // Define value names for values tracked inside the dialogs.
        this.interestSelected = 'value-interestSelected';

        // Define the interest choices for the interest selection prompt.
        this.interestOptions = ['Credit Card', 'Savings', 'Insurance'];

        // Define the company choices for the  selection prompt.
        this.reviewOptions = ['Yes', 'No'];
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new InterestReviewSelectionDialog());
         this.addDialog(new ReviewDialog());
        this.addDialog(new ReviewRatingDialog());
         this.addDialog(new ApplicationStatusDialog());
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.mainSelectionStep.bind(this),
            this.retrieveMainSelectionStep.bind(this),
             this.confirmSelectionStep.bind(this),
             this.retrieveConfirmSelectionStep.bind(this),
             this.repeatSelectionStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }


    async mainSelectionStep(stepContext) {


        const list = Array.isArray(stepContext.options) ? stepContext.options : [];
        stepContext.values[this.optionSelected] = list;
        let message = '';
        const options = this.topicOptions.filter(function(item) { return item !== list[0]; })
        return await stepContext.prompt(CHOICE_PROMPT, {
            prompt: message,
            retryPrompt: 'Please choose an option from the list.',
            choices: options
        });
    }

    async retrieveMainSelectionStep(stepContext) {
        // Retrieve their selection list, the choice they made, and whether they chose to finish.
        var list = stepContext.values[this.optionSelected];
        const choice = stepContext.result;
        const done = choice.value === this.doneOption;

        if (!done) {

            list.push(choice.value);
        }

        if (done || list.length > 0) {

             var formData = global.formData;
             console.log("formdata-interest selection")
             if(formData){
             formData.body.xdmEntity.eventType = "Bot - Interested in - "+choice.value;
             formData.body.xdmEntity['_'+global.tenantID] = {
                                                       "identification":{"core" :{
                                                         "ecid": global.ecid
                                                       }},
                                                       "interactionDetails":{"core":{
                                                      "bot":{
                                                       "botTopic": choice.value
                                                         }
                                                       }
                                                     }
                                                   }

             //Ingest data in AEP using streaming end point
             let headers = {
               "Content-Type": "application/json",
             }
             let result = await axios.post(global.streamingEnpointUrl, formData, {
               headers: headers
             });
             let data = result.data;
             //let offerUrl = eeIngestUrl + '&offer='+choice.value;
             // let results = await axios.get(offerUrl);
              console.log("results",data);
            }



            // If they're done, exit and return their list.
            if(`${ list[0] }` == this.topicOptions[0]){
                list =[];
                 await stepContext.context.sendActivity('Your checking account balance is 16,500.90$');
                 await stepContext.context.sendActivity('Is there anything else I can help you with today?');
                global.action =1;
                // return await stepContext.beginDialog(REVIEW_DIALOG);
                return await stepContext.next();
            }
            if(`${ list[0] }` == this.topicOptions[1]){
                 list =[];
                  return await stepContext.beginDialog(INTEREST_REVIEW_SELECTION_DIALOG);
            }
            if(`${ list[0] }` == this.topicOptions[2]){
                 list =[];
                  return await stepContext.beginDialog(APPLICATION_STATUS_DIALOG);
            }

        } else {
            // Otherwise, repeat this dialog, passing in the list from this iteration.
            return await stepContext.replaceDialog(REVIEW_SELECTION_DIALOG);
        }
    }

      async confirmSelectionStep(stepContext) {
          console.log("global.action", global.action)
          if(global.action == 1){
        stepContext.values.userInfo = new UserProfile();
        const list = Array.isArray(stepContext.options) ? stepContext.options : [];
        stepContext.values[this.reviewOptionSelected] = list;
        let message = '';
        const options = this.reviewOptions.filter(function(item) { return item !== list[0]; })
        return await stepContext.prompt(CHOICE_PROMPT, {
            prompt: message,
            retryPrompt: 'Please choose an option from the list.',
            choices: options
        });
          }
           return await stepContext.next();
    }
     async retrieveConfirmSelectionStep(stepContext) {
        // Retrieve their selection list, the choice they made, and whether they chose to finish.
          if(global.action==1){
              global.action = 0;
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
                 // console.log(`reviewDialog ${ list[0] }`)
                return await stepContext.beginDialog(REVIEW_RATING_DIALOG);
                // return await stepContext.next();
            }
            if(`${ list[0] }` == this.reviewOptions[0]){
                 list =[];
                // console.log(`reviewDialog ${ list[0] }`)
                  return await stepContext.replaceDialog(REVIEW_SELECTION_DIALOG);
            }

        }
        }
          return await stepContext.next();
    }

     async repeatSelectionStep(stepContext) {
        // Retrieve their selection list, the choice they made, and whether they chose to finish.
          if(global.repeatSelection == true){
              global.repeatSelection = false ;
                  return await stepContext.replaceDialog(REVIEW_SELECTION_DIALOG);

        }
           return await stepContext.endDialog();
    }




}

module.exports.ReviewSelectionDialog = ReviewSelectionDialog;
module.exports.REVIEW_SELECTION_DIALOG = REVIEW_SELECTION_DIALOG;
