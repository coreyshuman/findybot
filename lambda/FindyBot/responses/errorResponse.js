'use strict';

module.exports = class ErrorResponse {
    constructor(message) {
        this.success = false;
        this.message = message ? message : 'Unknown error occurred.';
        this.command = 'Error';
    }

    toPayload() {
        return JSON.stringify({
            command: this.command,
            message: this.message
        });
    }
}