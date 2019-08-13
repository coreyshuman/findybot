'use strict';

const ErrorResponse = require('./errorResponse');

module.exports = class ItemListResponse {
    constructor(items, command) {
        if(!items || items.length === undefined) {
            return new ErrorResponse('Invalid item payload.');
        }
        this.success = true;
        this.count = items.length;
        this.items = items;
        this.command = command ? command : 'ShowItems';
    }

    toPayload() {
        return JSON.stringify({
            command: this.command,
            count: this.count,
            items: this.items
        });
    }
}