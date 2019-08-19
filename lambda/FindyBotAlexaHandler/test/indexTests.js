'use strict';

const assert = require('assert');
const { handler } = require('../index');
const {AlexaSpeech, AlexaSpeechParams} = require('../alexa');

describe('Alexa full integration tests.', () => {
    it('Launch request, new session', (done) => {
        const alexaRequest = {
            version: '1.0',
            session: {
                new: true,
                sessionId: 'amzn1.echo-api.session.123456789012',
                application: {
                    applicationId: 'amzn1.ask.skill.987654321'
                },
                user: {
                    userId: 'amzn1.ask.account.testUser'
                },
                attributes: {}
            },
            context: {
                AudioPlayer: {
                    playerActivity: 'IDLE'
                },
                System: {
                    application: {
                        applicationId: 'amzn1.ask.skill.987654321'
                    },
                    user: {
                        userId: 'amzn1.ask.account.testUser'
                    },
                    device: {
                        supportedInterfaces: {
                            AudioPlayer: {}
                        }
                    }
                }
            },
            request: {
                type: 'LaunchRequest',
                requestId: 'amzn1.echo-api.request.1234',
                timestamp: '2016-10-27T18:21:44Z',
                locale: 'en-US'
            }
        };

        const expectedResponse = AlexaSpeech.getResponse(alexaRequest.session, 
            new AlexaSpeechParams('Finder Bot!',
                'Welcome to Finder Bot! Ask Finder Bot to search for items.'));

        const context = {
            succeed: (response) => {
                assert.deepStrictEqual(response, expectedResponse, 'Default succeed response failed.');
                done();
            },
            fail: (error) => {
                assert.fail(error ? error.messsage ? error.message : error : 'context.fail() called with no error info.');
            }
        };

        console.log('call handler');
        handler(alexaRequest, context)
            .catch(error => {
                assert.fail(error? error.messsage ? error.message : error : 'Unhandled exception thrown with no info.');
            });
    });


});