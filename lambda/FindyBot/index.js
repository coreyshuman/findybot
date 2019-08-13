/**
 
 Copyright 2019 Corey Shuman

*/

'use strict';

const Database = require('./myDb');
const CommandParser = require('./commandParser');
const ParticleApi = require('./particleApi');
//import * as Database from './myDb';

console.log("Starting Findy Bot...");
console.log(Database);

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = async function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);
        context.myDb = new Database();
        context.particleApi = new ParticleApi();
        const client = await context.myDb.connect();
        context.parser = new CommandParser(context.myDb);
        event.session.logId = await context.myDb.logQuery(event);
        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */
		 
//     if (event.session.application.applicationId !== "amzn1.echo-sdk-ams.app.05aecccb3-1461-48fb-a008-822ddrt6b516") {
//         context.fail("Invalid Application ID");
//      }

        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse({sessionAttributes, speechletResponse}));
                });
        } else if (event.request.type === "IntentRequest") {
            const responseObject = await onIntent(context,
                event.request,
                event.session
                );
                const response = buildResponse(responseObject);
                // run in parallel
                context.myDb.logCommand(event.request.intent.name,
                    event.request.intent, 
                    response);
                context.succeed(response);
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
        await context.myDb.logError(e);
    }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId
        + ", sessionId=" + session.sessionId);

    // add any session init logic here
}

/**
 * Called when the user invokes the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log("onLaunch requestId=" + launchRequest.requestId
        + ", sessionId=" + session.sessionId);

    var cardTitle = "Finder Bot!"
    var speechOutput = "Welcome to Finder Bot! Ask Finder Bot to search for items.";
    callback(session.attributes,
        buildSpeechletResponse(cardTitle, speechOutput, "", true));
}

/**
 * Called when the user specifies an intent for this skill.
 */
async function onIntent(context, intentRequest, session) {
    console.log("onIntent requestId=" + intentRequest.requestId
        + ", sessionId=" + session.sessionId);

    var intent = intentRequest.intent,
        intentName = intentRequest.intent.name;

    

    // dispatch custom intents to handlers here
    if (intentName == 'InsertItemIntent') {
        return await handleInsertItem(context, intent, session);
    } else if (intentName == 'FindItemIntent') {
        return await handleFindItem(context, intent, session);
    }
    else {
        throw "Invalid intent";
    }

}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId
        + ", sessionId=" + session.sessionId);

    // Add any cleanup logic here
}

async function handleInsertItem(context, intent, session) {
    console.log(intent);
    let speechletResponse = buildSpeechletResponseWithoutCard("Item could not be inserted", "Try Again", true);
    // todo parse this nicely
    const res = await context.parser.parseInsertCommand(intent.slots.item.value);
    await context.particleApi.highlightItem(res);
    console.log(res);
    if(res.success) {
        speechletResponse = buildSpeechletResponseWithoutCard(`Item ${res.items[0].name} Inserted, Row ${res.items[0].row}, Column ${res.items[0].col}`, "", "true");
    } else {
        speechletResponse = buildSpeechletResponseWithoutCard("Item could not be inserted. " + res.message, "Try Again", true);
    }

    return {sessionAttributes: session.attributes, speechletResponse};
}

async function handleFindItem(context, intent, session) {
    let speechletResponse = buildSpeechletResponseWithoutCard("Item could not be found.", "", true);
    const res = await context.parser.parseFindItem(intent.slots.item.value);
    await context.particleApi.highlightItem(res);
    console.log(res);
    if(res.success) {
        if(res.count > 0) {
            speechletResponse = buildSpeechletResponseWithoutCard(`Item ${res.items[0].name} Found, Row ${res.items[0].row}, Column ${res.items[0].col}`, "", "true");
        } else {
            speechletResponse = buildSpeechletResponseWithoutCard("Could not find item.", "", true);
        }
    } else {
        speechletResponse = buildSpeechletResponseWithoutCard("Could not find item. " + res.message, "", true);
    }

    return {sessionAttributes: session.attributes, speechletResponse};
}

// ------- Helper functions to build responses -------

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title: title,
            content: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildSpeechletResponseWithoutCard(output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildResponse(responseObject) {
    return {
        version: "1.0",
        sessionAttributes: responseObject.sessionAttributes,
        response: responseObject.speechletResponse
    };
}