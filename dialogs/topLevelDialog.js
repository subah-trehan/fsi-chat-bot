// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
const { BotFrameworkAdapter,MemoryStorage, ConversationState, UserState } = require('botbuilder');
const { ComponentDialog, NumberPrompt, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');
const { ReviewSelectionDialog, REVIEW_SELECTION_DIALOG } = require('./reviewSelectionDialog');
const { InterestReviewSelectionDialog, INTEREST_REVIEW_SELECTION_DIALOG } = require('./reviewInterestSelectionDialog');
const { UserProfile } = require('../userProfile');
const axios = require("axios");
const TOP_LEVEL_DIALOG = 'TOP_LEVEL_DIALOG';

const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
const TEXT_PROMPT = 'TEXT_PROMPT';
const NUMBER_PROMPT = 'NUMBER_PROMPT';
const memoryStorage = new MemoryStorage();
class TopLevelDialog extends ComponentDialog {
    constructor() {
        super(TOP_LEVEL_DIALOG);
        this.addDialog(new TextPrompt(TEXT_PROMPT));
         this.addDialog(new TextPrompt(NUMBER_PROMPT));
       this.addDialog(new InterestReviewSelectionDialog());

        //this.addDialog(new ReviewSelectionDialog());
         this.addDialog(new ReviewSelectionDialog());
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
           // this.startSelectionStep.bind(this),
           // this.emailStep.bind(this),
             this.startSelectionStep1.bind(this),
            this.acknowledgementStep.bind(this)
        ]));
        
        this.initialDialogId = WATERFALL_DIALOG;
    }

    async nameStep(stepContext) {
        //console.log("##ecid in dialog##",global.ecid);
        // Create an object in which to collect the user's information within the dialog.
        stepContext.values.userInfo = new UserProfile();

  //console.log("hruntime details",turnContext.turnState.runtimeDetails.value.orgID);
        const promptOptions = { prompt: 'What\'s your name?' };

        // Ask the user to enter their name.
        return await stepContext.prompt(TEXT_PROMPT, promptOptions); 
    }

    async emailStep(stepContext) {
        // Set the user's name to what they entered in response to the name prompt.
        //stepContext.values.userInfo.name = stepContext.result;
        console.log("checking if user is logged in")
        if (!loggedInUser) {
            console.log("not logged in")
             stepContext.values.userInfo = new UserProfile();
             stepContext.values.userInfo.name = stepContext.result;
           const promptOptions = { prompt: 'What\'s your email address?' }; 
        return await stepContext.prompt(NUMBER_PROMPT, promptOptions);
            
        
    }
     return await stepContext.next();
    }

    async startSelectionStep(stepContext) {
        // Set the user's age to what they entered in response to the age prompt.
       // stepContext.values.userInfo.age = stepContext.result;
 console.log("checking if user is logged in")
        if (!loggedInUser) {
            console.log("not logged in")
             stepContext.values.userInfo = new UserProfile();
             
            //await stepContext.context.sendActivity('Welcome');
            const promptOptions = { prompt: 'What\'s your name?' };
            return await stepContext.prompt(TEXT_PROMPT, promptOptions); 
            
        
    }
     return await stepContext.next();
    }

  async startSelectionStep1(stepContext) {
           
            if (loggedInUser ) {
             console.log("startSelectionStep1 , loggedinuser")
            await stepContext.context.sendActivity(`I am ready ${loggedInUser }. How can I help you?`);
           // return await stepContext.next();
           stepContext.values.accountId = accountId ;
            return await stepContext.beginDialog(REVIEW_SELECTION_DIALOG);
        } else {
             //stepContext.values.userInfo.name = stepContext.result;
            // await stepContext.context.sendActivity(`Hey ${ stepContext.values.userInfo.name } `);
            // Otherwise, start the review selection dialog.
            return await stepContext.beginDialog(INTEREST_REVIEW_SELECTION_DIALOG);
        }

  
    }

    async acknowledgementStep(stepContext) {
        // Set the user's company selection to what they entered in the review-selection dialog.
        const userProfile = stepContext.userInfo;
       //userProfile.result= stepContext.result || [];
       
       
     return await stepContext.endDialog(userProfile);
        // Exit the dialog, ret  urning the collected user information.
      
    }
}

module.exports.TopLevelDialog = TopLevelDialog;
module.exports.TOP_LEVEL_DIALOG = TOP_LEVEL_DIALOG;
