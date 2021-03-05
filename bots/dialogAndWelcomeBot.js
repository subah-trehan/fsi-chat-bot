// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { DialogBot } = require('./dialogBot');

class DialogAndWelcomeBot extends DialogBot {
    constructor(conversationState, userState, dialog) {
        super(conversationState, userState, dialog);

        this.onMembersAdded(async (context, next) => {
          const membersAdded = context.activity.membersAdded;
            for (let cnt = 0; cnt < 1; cnt++) {
              if (membersAdded[cnt].id == context.activity.recipient.id) {
                    const reply = `Hi, I hope you are doing good today?`;
                   await context.sendActivity(reply);
                   console.log(reply)
                }
                 if (membersAdded[cnt].id != context.activity.recipient.id) {
                    const reply = `Hi, I hope you are doing good today?`;
                  context.sendActivity("");
                   console.log("hi")
                }
           }

            // By calling next() you ensure that the next BotHandler is run.
          
            await next();
        });
    }
}

module.exports.DialogAndWelcomeBot = DialogAndWelcomeBot;
