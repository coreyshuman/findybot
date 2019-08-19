class AlexaSpeechParams {
    constructor(title, message, repromptText = "") {
        this.title = title;
        this.message = message;
        this.repromptText = repromptText;
        this.shouldEndSession = true;
    }
}

class AlexaSpeech {
    static getResponse(sessionAttributes, speechParams, includeCard = true) {
        return this.buildResponse(sessionAttributes, this.buildSpeechletResponse(speechParams, includeCard));
    }

    static buildSpeechletResponse(speechParams, includeCard = true) {
        const response = {
            outputSpeech: {
                type: "PlainText",
                text: speechParams.message
            },
            reprompt: {
                outputSpeech: {
                    type: "PlainText",
                    text: speechParams.repromptText
                }
            },
            shouldEndSession: speechParams.shouldEndSession
        }

        if(includeCard) {
            response.card = {
                type: "Simple",
                title: speechParams.title,
                content: speechParams.message
            };
        }

        return response;
    }
    
    static buildResponse(sessionAttributes, response) {
        return {
            version: "1.0",
            sessionAttributes,
            response
        };
    }
}

module.exports = {AlexaSpeech, AlexaSpeechParams};