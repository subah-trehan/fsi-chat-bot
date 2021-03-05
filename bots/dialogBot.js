// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
const { BotFrameworkAdapter,MemoryStorage, ConversationState, UserState } = require('botbuilder');
const { ActivityHandler } = require('botbuilder');

const ORG_ID = 'orgID';
const SANDBOX_NAME = 'sandboxName';
const ECID = 'ecid';
const storage = new MemoryStorage();
class DialogBot extends ActivityHandler {
    /**
     *
     * @param {ConversationState} conversationState
     * @param {UserState} userState
     * @param {Dialog} dialog
     */
    constructor(conversationState, userState, dialog) {
        super();
        global.ecid ="";
        global.orgID ="";
        global.sandboxName ="";
        global.eeIngestUrl = '';
        global.getProfileUrl = '';
        global.loggedInUser = '';
        global.accountId = '';
        global.action=0;
        global.repeatSelection = false;
        global.endSelection = false;
        if (!conversationState) throw new Error('[DialogBot]: Missing parameter. conversationState is required');
        if (!userState) throw new Error('[DialogBot]: Missing parameter. userState is required');
        if (!dialog) throw new Error('[DialogBot]: Missing parameter. dialog is required');

        this.conversationState = conversationState;
        this.userState = userState;
        this.dialog = dialog;
        this.dialogState = this.conversationState.createProperty('DialogState');
        this.orgID = userState.createProperty(ORG_ID);
        this.sandboxName = userState.createProperty(SANDBOX_NAME);
        this.ecid = userState.createProperty(ECID);
        
        
        this.onMessage(async (context, next) => {
            console.log('Running dialog with Message Activity.');
            console.log("");

            // Run the Dialog with the new message Activity.
            await this.dialog.run(context, this.dialogState);

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
        
        
          this.onEvent(async (turnContext) => { 
             ecid = turnContext["_activity"].value.ecid;
             orgID = turnContext["_activity"].value.orgID;
             sandboxName = turnContext["_activity"].value.sandboxName;
             eeIngestUrl = 'https://adobeioruntime.net/api/v1/web/demoteam/demo-system/setChatbotEvent.json?sandboxName='+sandboxName+'&orgID='+orgID+'&ecid='+global.ecid;
             getProfileUrl= 'https://adobeioruntime.net/api/v1/web/demoteam/demo-system/get-profile-info?ecid='+ecid+'&orgID='+orgID+'&sandboxName='+sandboxName;
              console.log("###");
            // await next();
           
        });
    }

    /**
     * Override the ActivityHandler.run() method to save state changes after the bot logic completes.
     */
    async run(context) {
        await super.run(context);

        // Save any state changes. The load happened during the execution of the Dialog.
        await this.conversationState.saveChanges(context, false);
        await this.userState.saveChanges(context, false);
    }
}

module.exports.DialogBot = DialogBot;
