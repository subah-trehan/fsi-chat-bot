// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const {
	ComponentDialog,
	DialogSet,
	DialogTurnStatus,
	WaterfallDialog
} = require('botbuilder-dialogs');
const {
	TopLevelDialog,
	TOP_LEVEL_DIALOG
} = require('./topLevelDialog');
const {
	ReviewSelectionDialog,
	REVIEW_SELECTION_DIALOG
} = require('./reviewSelectionDialog');
const MAIN_DIALOG = 'MAIN_DIALOG';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
const USER_PROFILE_PROPERTY = 'USER_PROFILE_PROPERTY';
const axios = require("axios");
const LOGGEDIN_USER = 'logggedInUserProperty';
const {
	UserProfile
} = require('../userProfile');
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
		//console.log("status", results)
		if (results && results.status === DialogTurnStatus.empty) {
			await dialogContext.beginDialog(this.id);
		}
	}

	async initialStep(stepContext) {


		var name = '';
		var ecid = global.ecid;
		var orgId = global.orgID;
		var sandboxName = global.sandboxName;
		var tenant = "_" + global.tenantID;
		try {
			let results = await axios({
				url: global.getProfileUrl,
				params: {
					ecid: ecid,
					orgId: orgId,
					sandboxName: sandboxName,
					entityIdNS: 'ecid',
					entityId: ecid
				},
				method: 'GET',
				headers: {
					'x-access-token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsZGFwSUQiOiJoZWxpdW0iLCJlbWFpbCI6ImhlbGl1bUBhZG9iZS5jb20iLCJpYXQiOjE1ODEwMjg2MjMsImV4cCI6MTYxMjU2NDYyM30.oNwhwkfkOr42aw6vv2MY0ahTML2B-SCxG9YxKig4tb8'
				}
			});
			console.log("results: " + results.data)
			if (results && Object.values(results.data.result)[0].entity.identityMap.email[0].id) {

				loggedInUser = Object.values(results.data.result)[0].entity.person.name.firstName;
				accountId = Object.values(Object.values(results.data.result)[0].entity)[2].identification.fsi.accountId;

				console.log("logged in user", loggedInUser);
			} else {
				global.loggedInUser = '';
				global.accountId = '';
			}
			console.log("Logged in user");
		} catch (e) {
			console.log("There are no profiles in AEP ", e);
			global.loggedInUser = '';
			global.accountId = '';
		}

		let coreResults = await axios({
			url: global.eeIngestUrl,
			params: {
				orgId: global.orgID,
				sandboxName: global.sandboxName
			},
			method: 'GET',
			headers: {
				'x-access-token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsZGFwSUQiOiJoZWxpdW0iLCJlbWFpbCI6ImhlbGl1bUBhZG9iZS5jb20iLCJpYXQiOjE1ODEwMjg2MjMsImV4cCI6MTYxMjU2NDYyM30.oNwhwkfkOr42aw6vv2MY0ahTML2B-SCxG9YxKig4tb8'
			}
		});
		global.streamingEnpointUrl = coreResults.data.result.streamingEnpointUrl;
		global.tenantID = coreResults.data.result.tenantID;
		global.schemaID = "93ee928c3766396daccb4145ef904429acb288f408bbbd94";
		let dataSets = coreResults.data.result.dataSets;
		//getDatasetByName
		let datasetID = Object.entries(dataSets).find(obj => obj[1].name === "Demo System - Event Dataset for Website (FSI v1.0)")[0].replace(/%/g, "");

		//Update XDM schema
		global.formData = {
			"header": {
				"datasetId": dataSets[datasetID].id,
				"imsOrgId": global.orgID,
				"source": {
					"name": "web"
				},
				"schemaRef": {
					"id": "https://ns.adobe.com/" + global.tenantID + "/schemas/" + global.schemaID,
					"contentType": "application/vnd.adobe.xed-full+json;version=1"
				}
			},
			"body": {
				"xdmMeta": {
					"schemaRef": {
						"id": "https://ns.adobe.com/" + global.tenantID + "/schemas/" + global.schemaID,
						"contentType": "application/vnd.adobe.xed-full+json;version=1"
					}
				},
				"xdmEntity": {
					"_id": "" + Date.now(),
					"timestamp": "" + new Date().toISOString()

				}
			}
		}


		return await stepContext.beginDialog(TOP_LEVEL_DIALOG);
	}


	async finalStep(stepContext) {

		if (stepContext.result && stepContext.result.review == 'Yes') {

			return await stepContext.beginDialog(REVIEW_SELECTION_DIALOG);
		} else {
			console.log("final step")
			await stepContext.context.sendActivity(`Thank you and have a nice day.`);
			//return await stepContext.endDialog(userProfile);
			return await stepContext.endDialog();
		}
	}
}

module.exports.MainDialog = MainDialog;
module.exports.MAIN_DIALOG = MAIN_DIALOG;
