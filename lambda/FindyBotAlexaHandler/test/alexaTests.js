'use strict';

const assert = require('assert');
const {AlexaSpeech, AlexaSpeechParams} = require('../alexa');

describe('Alexa speech response tests.', () => {
    it('test response object', () => {
        const fakeSessionAttributes = {some: 'attributes', very: 'cool', number: 1};
        const fakeSpeechObject = {hello: 'world', title: 'alexa test'};
        const expectedResponse = {
            version: "1.0",
            sessionAttributes: fakeSessionAttributes,
            response: fakeSpeechObject
        };
        const res = AlexaSpeech.buildResponse(fakeSessionAttributes, fakeSpeechObject);

        assert.deepStrictEqual(res, expectedResponse, 'Alexa response object incorrect.');
    });

    it('test speechlet response object', () => {
        const title = 'My title';
        const message = 'My message';
        const repromptMessage = 'My reprompt message';

        const speechParams = new AlexaSpeechParams(title, message, repromptMessage);
        const expectedResponse = {
            outputSpeech: {
                type: "PlainText",
                text: message
            },
            card: {
                type: "Simple",
                title: title,
                content: message
            },
            reprompt: {
                outputSpeech: {
                    type: "PlainText",
                    text: repromptMessage
                }
            },
            shouldEndSession: true
        };

        let res = AlexaSpeech.buildSpeechletResponse(speechParams);
        assert.deepStrictEqual(res, expectedResponse, 'Default speech object incorrect.');

        res = AlexaSpeech.buildSpeechletResponse(speechParams, true);
        assert.deepStrictEqual(res, expectedResponse, 'includeCard: true incorrect.');

        res = AlexaSpeech.buildSpeechletResponse(speechParams, false);
        delete expectedResponse.card;
        assert.deepStrictEqual(res, expectedResponse, 'includeCard: false incorrect.');

        speechParams.shouldEndSession = false;
        expectedResponse.shouldEndSession = false;
        res = AlexaSpeech.buildSpeechletResponse(speechParams, false);
        assert.deepStrictEqual(res, expectedResponse, 'shouldEndSession: false incorrect.');
    });

    it('getResponse full test', () => {
        const title = 'My title';
        const message = 'My message';
        const repromptMessage = 'My reprompt message';
        const speechParams = new AlexaSpeechParams(title, message, repromptMessage);
        const fakeSessionAttributes = {some: 'attributes', very: 'cool', number: 1};
        const realSpeechObject = {
            outputSpeech: {
                type: 'PlainText',
                text: message
            },
            card: {
                type: 'Simple',
                title: title,
                content: message
            },
            reprompt: {
                outputSpeech: {
                    type: 'PlainText',
                    text: repromptMessage
                }
            },
            shouldEndSession: true
        };
        const expectedResponse = {
            version: '1.0',
            sessionAttributes: fakeSessionAttributes,
            response: realSpeechObject
        };

        let res = AlexaSpeech.getResponse(fakeSessionAttributes, speechParams);
        assert.deepStrictEqual(res, expectedResponse, 'Alexa full response incorrect.');

        res = AlexaSpeech.getResponse(fakeSessionAttributes, speechParams, true);
        assert.deepStrictEqual(res, expectedResponse, 'Alexa full response includeCard: true incorrect.');

        res = AlexaSpeech.getResponse(fakeSessionAttributes, speechParams, false);
        delete expectedResponse.response.card;
        assert.deepStrictEqual(res, expectedResponse, 'Alexa full response includeCard: false incorrect.');
    });

});