// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ComponentDialog, DialogSet, DialogTurnStatus, WaterfallDialog } = require('botbuilder-dialogs');
const { TopLevelDialog, TOP_LEVEL_DIALOG } = require('./topLevelDialog');
const { ReviewSelectionDialog, REVIEW_SELECTION_DIALOG } = require('./reviewSelectionDialog');
const MAIN_DIALOG = 'MAIN_DIALOG';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
const USER_PROFILE_PROPERTY = 'USER_PROFILE_PROPERTY';
const axios = require("axios");
const LOGGEDIN_USER = 'logggedInUserProperty';
const { UserProfile } = require('../userProfile');
class MainDialog extends ComponentDialog {
    constructor(userState) {
        
        super(MAIN_DIALOG);
        this.userState = userState;
        this.userProfileAccessor = userState.createProperty(USER_PROFILE_PROPERTY);
         this.logggedInUserProperty = userState.createProperty(LOGGEDIN_USER);
        this.addDialog(new TopLevelDialog());
        this.addDialog(new ReviewSelectionDialog());
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.initialStep.bind(this),
            this.finalStep.bind(this)
        ]));
        
        this.initialDialogId = WATERFALL_DIALOG;
    }

    /**
     * The run method handles the incoming activity (in the form of a TurnContext) and passes it through the dialog system.
     * If no dialog is active, it will start the default dialog.
     * @param {*} turnContext
     * @param {*} accessor
     */
    async run(turnContext, accessor) {
         console.log("main dialog");
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);
 
        const dialogContext = await dialogSet.createContext(turnContext);
        const results = await dialogContext.continueDialog();
        console.log("status", results)
        if (results && results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }

    async initialStep(stepContext) {
        var name = '';
         try {
         let results = await axios.get(global.getProfileUrl); 
        // if(results && (Object.values(results)[5])[0] && (Object.values(results)[5])[0].entity ){
        console.log("email",Object.values(Object.values(Object.values(results)[5])[0].entity)[0].identification.core.email); 
        if(results && Object.values(Object.values(results)[5])[0].entity && Object.values(Object.values(Object.values(results)[5])[0].entity)[0].identification.core.email){
            console.log("inside");
           console.log("####accountid :######"+Object.values(Object.values(Object.values(results)[5])[0].entity)[0].identification.fsi.accountId);
                    console.log("#### name:######"+Object.values(Object.values(results)[5])[0].entity.person.name.firstName);
                               console.log("####email :######"+Object.values(Object.values(Object.values(results)[5])[0].entity)[0].identification.core.email);
       
              loggedInUser = Object.values(Object.values(results)[5])[0].entity.person.name.firstName;
              accountId = Object.values(Object.values(Object.values(results)[5])[0].entity)[0].identification.fsi.accountId ;
          
           console.log("logged in user",loggedInUser);
         }
         else{
              global.loggedInUser = '';
               global.accountId = '';
         }
        console.log("Logged in user");
         }catch(e){
             console.log("There are no profiles in AEP ");
             global.loggedInUser = '';
               global.accountId = '';
         }
        return await stepContext.beginDialog(TOP_LEVEL_DIALOG);
    }

    async finalStep(stepContext) {
      
        if( stepContext.result && stepContext.result.review == 'Yes'){
       console.log("acknowledgementStep:condition1")
        return await stepContext.beginDialog(REVIEW_SELECTION_DIALOG);
        } else{
      console.log("final step")
       await stepContext.context.sendActivity(`Thank you and have a nice day.`);
       //return await stepContext.endDialog(userProfile);
        return await stepContext.endDialog();
        }
    }
}

module.exports.MainDialog = MainDialog;
module.exports.MAIN_DIALOG = MAIN_DIALOG;
