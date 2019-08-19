/**
 
 Copyright 2019 Corey Shuman

*/

'use strict';

const {AlexaSpeech, AlexaSpeechParams} = require('./alexa');

const {promisify} = require('util');
const AWS = require('aws-sdk');
AWS.config.region = 'us-east-1';
const lambda = new AWS.Lambda();
const lambdaInvoke = promisify(lambda.invoke.bind(lambda));

console.log('Starting Findy Bot...');

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = async function (event, context) {
    try {
        let alexaResponse = undefined;
        console.log('event.session.application.applicationId=' + event.session.application.applicationId);

        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === 'LaunchRequest') {
            const speechParams = await onLaunch(event.request, event.session);
            console.log('LaunchRequest', speechParams)
            alexaResponse = AlexaSpeech.getResponse(event.session, speechParams);
        } else if (event.request.type === 'IntentRequest') {
            const speechParams = await onIntent(context, event.request, event.session);
            alexaResponse = AlexaSpeech.getResponse(event.session, speechParams);
                // run in parallel
                /*
                context.myDb.logCommand(event.request.intent.name,
                    event.request.intent, 
                    response);
                */
        } else if (event.request.type === 'SessionEndedRequest') {
            onSessionEnded(event.request, event.session);
        }

        context.succeed(alexaResponse);

    } catch (e) {
        context.fail('Exception: ' + e); // todo - is this correct format?
        //await context.myDb.logError(e);
    }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log('onSessionStarted requestId=' + sessionStartedRequest.requestId
        + ', sessionId=' + session.sessionId);

    // add any session init logic here
}

/**
 * Called when the user invokes the skill without specifying what they want.
 */
async function onLaunch(launchRequest, session) {
    console.log('onLaunch requestId=' + launchRequest.requestId
        + ', sessionId=' + session.sessionId);
/*
    const params = {
        FunctionName: process.env.DB_FUNCTION,
        InvocationType: 'RequestResponse',
        LogType: 'Tail',
        Payload: '{ "name" : "Corey2" }'
    };
    
    try {
        const response = await lambdaInvoke(params);
        console.log('findybotDbHandler said '+ response.Payload);
    } catch(e) {
        console.error(e);
        throw e;
    }

    const params1 = {
        FunctionName: process.env.PARTICLE_FUNCTION,
        InvocationType: 'RequestResponse',
        LogType: 'Tail',
        Payload: '{ "name" : "Corey2" }'
    };

    try {
        const response = await lambdaInvoke(params1);
        console.log('paricleApiHandler said '+ response.Payload);
    } catch(e) {
        console.error(e);
        throw e;
    }
*/
    return new AlexaSpeechParams('Finder Bot!',
        'Welcome to Finder Bot! Ask Finder Bot to search for items.'
    );
}

/**
 * Called when the user specifies an intent for this skill.
 */
async function onIntent(context, intentRequest, session) {
    console.log('onIntent requestId=' + intentRequest.requestId
        + ', sessionId=' + session.sessionId);

    var intent = intentRequest.intent,
        intentName = intentRequest.intent.name;

    let commandToExecute = null;
    // whitelist map Alexa intents to appropriate parser
    switch(intentName) {
        case 'InsertItemIntent':    commandToExecute = parseInsertItemCommand; break;
        case 'FindItemIntent':      commandToExecute = parseFindItemCommand; break;
    }

    if(commandToExecute !== null) {
        return await commandToExecute(context, intent, session);
    }

    throw 'Invalid intent';
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log('onSessionEnded requestId=' + sessionEndedRequest.requestId
        + ', sessionId=' + session.sessionId);

    // Add any cleanup logic here
}

async function handleInsertItem(context, intent, session) {
    console.log(intent);
    let speechletResponse = buildSpeechletResponseWithoutCard('Item could not be inserted', 'Try Again', true);
    /*
    // todo parse this nicely
    const res = await context.parser.parseInsertCommand(intent.slots.item.value);
    await context.particleApi.highlightItem(res);
    console.log(res);
    if(res.success) {
        speechletResponse = buildSpeechletResponseWithoutCard(`Item ${res.items[0].name} Inserted, Row ${res.items[0].row}, Column ${res.items[0].col}`, '', 'true');
    } else {
        speechletResponse = buildSpeechletResponseWithoutCard('Item could not be inserted. ' + res.message, 'Try Again', true);
    }
*/
    return {sessionAttributes: session.attributes, speechletResponse};
}

async function handleFindItem(context, intent, session) {
    let speechletResponse = buildSpeechletResponseWithoutCard('Item could not be found.', '', true);
    /*
    const res = await context.parser.parseFindItem(intent.slots.item.value);
    await context.particleApi.highlightItem(res);
    console.log(res);
    if(res.success) {
        if(res.count > 0) {
            speechletResponse = buildSpeechletResponseWithoutCard(`Item ${res.items[0].name} Found, Row ${res.items[0].row}, Column ${res.items[0].col}`, '', 'true');
        } else {
            speechletResponse = buildSpeechletResponseWithoutCard('Could not find item.', '', true);
        }
    } else {
        speechletResponse = buildSpeechletResponseWithoutCard('Could not find item. ' + res.message, '', true);
    }
*/
    return {sessionAttributes: session.attributes, speechletResponse};
}

