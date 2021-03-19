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
        global.streamingEnpointUrl="";
        global.tenantID="";
        global.schemaID = "93ee928c3766396daccb4145ef904429acb288f408bbbd94";
        global.formData = {};
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
             eeIngestUrl ="https://dashboard-test.adobedemo.com/api/aep";
             getProfileUrl="https://dashboard.adobedemo.com/api/aep/profile";
             let coreResults = await axios({
                  url: global.eeIngestUrl,
                  params: {
                    orgId:orgID,
                    sandboxName:sandboxName
                  },
                  method: 'GET',
                   headers:  { 'x-access-token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsZGFwSUQiOiJoZWxpdW0iLCJlbWFpbCI6ImhlbGl1bUBhZG9iZS5jb20iLCJpYXQiOjE1ODEwMjg2MjMsImV4cCI6MTYxMjU2NDYyM30.oNwhwkfkOr42aw6vv2MY0ahTML2B-SCxG9YxKig4tb8'}
                });
             streamingEnpointUrl = coreResults.data.result.streamingEnpointUrl;
             tenantID = coreResults.data.result.tenantID;
             schemaID = "93ee928c3766396daccb4145ef904429acb288f408bbbd94";
             let dataSets = coreResults.data.result.dataSets;
             console.log('streamingEnpointUrl : '+streamingEnpointUrl + '   tenantID: '+tenantID);
             //getDatasetByName
             let datasetID = Object.entries(dataSets).find(obj => obj[1].name === "Demo System - Event Dataset for Website (FSI v1.0)")[0].replace(/%/g, "");

             //Update XDM schema
             formData = {
               "header": {
                       "datasetId": dataSets[datasetID].id,
                       "imsOrgId": orgID,
                       "source": {
                         "name": "web"
                       },
                       "schemaRef": {
                         "id": "https://ns.adobe.com/"+tenantID+"/schemas/"+schemaID,
                         "contentType": "application/vnd.adobe.xed-full+json;version=1"
                       }
                     },
                     "body": {
                       "xdmMeta": {
                         "schemaRef": {
                           "id": "https://ns.adobe.com/"+tenantID+"/schemas/"+schemaID,
                           "contentType": "application/vnd.adobe.xed-full+json;version=1"
                         }
                       },
                       "xdmEntity": {
                         "_id": ""+Date.now(),
                         "timestamp": ""+new Date().toISOString()
                         //"eventType": "Bot - Interested in - "+choice.value

                         }
                       }
                     }

             //ingestData();
            // await next();

        });
    }

    async ingestData(){
      //Call AEP API to get streamingEndpoint ,enant id, datasets
      let coreResults = await axios({
           url: global.eeIngestUrl,
           params: {
             orgId:orgID,
             sandboxName:sandboxName
           },
           method: 'GET',
            headers:  { 'x-access-token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsZGFwSUQiOiJoZWxpdW0iLCJlbWFpbCI6ImhlbGl1bUBhZG9iZS5jb20iLCJpYXQiOjE1ODEwMjg2MjMsImV4cCI6MTYxMjU2NDYyM30.oNwhwkfkOr42aw6vv2MY0ahTML2B-SCxG9YxKig4tb8'}
         });
      streamingEnpointUrl = coreResults.data.result.streamingEnpointUrl;
      tenantID = coreResults.data.result.tenantID;
      schemaID = "93ee928c3766396daccb4145ef904429acb288f408bbbd94";
      let dataSets = coreResults.data.result.dataSets;
      console.log('streamingEnpointUrl : '+streamingEnpointUrl + '   tenantID: '+tenantID);
      //getDatasetByName
      let datasetID = Object.entries(dataSets).find(obj => obj[1].name === "Demo System - Event Dataset for Website (FSI v1.0)")[0].replace(/%/g, "");

      //Update XDM schema
      formData = {
        "header": {
                "datasetId": dataSets[datasetID].id,
                "imsOrgId": orgID,
                "source": {
                  "name": "web"
                },
                "schemaRef": {
                  "id": "https://ns.adobe.com/"+tenantID+"/schemas/"+schemaID,
                  "contentType": "application/vnd.adobe.xed-full+json;version=1"
                }
              },
              "body": {
                "xdmMeta": {
                  "schemaRef": {
                    "id": "https://ns.adobe.com/"+tenantID+"/schemas/"+schemaID,
                    "contentType": "application/vnd.adobe.xed-full+json;version=1"
                  }
                },
                "xdmEntity": {
                  "_id": ""+Date.now(),
                  "timestamp": ""+new Date().toISOString()
                  //"eventType": "Bot - Interested in - "+choice.value

                  }
                }
              }

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
