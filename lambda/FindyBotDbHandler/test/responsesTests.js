'use strict';

const assert = require('assert');
const ItemListResponse = require('../responses/itemListResponse');
const ErrorResponse = require('../responses/errorResponse');

describe('Response Tests', () => { 

    it('Item List Response with 2 items.', () => {
        const item1 = {
            name: 'item 1',
            quantity: 1,
            row: 0,
            col: 1
        };
        const item2 = {
            name: 'item 2',
            quantity: 2,
            row: 8,
            col: 3
        };
        const itemListResponse = new ItemListResponse([
            item1,
            item2
        ]);

        assert.equal(itemListResponse.success, true, 'Success should have been true.');
        assert.equal(itemListResponse.count, 2, 'Response count was incorrect.');
        assert.equal(itemListResponse.items.length, 2, 'Item array length was incorrect.');
        assert.deepStrictEqual(itemListResponse.items, [item1, item2], 'Item payload was incorrect.');
        assert.equal(itemListResponse.toPayload(), JSON.stringify({command: 'ShowItems', count: 2, items: [item1, item2]}));
    });

    it('Item List Response with invalid payload.', () => {
        const itemListResponse = new ItemListResponse(null);

        assert.equal(itemListResponse.success, false, 'Success should have been false.');
        assert.equal(itemListResponse.command, 'Error', 'Command should have been error.');
        assert.ok(itemListResponse.message ? itemListResponse.message.length : false, 'Error message missing.');
        assert.equal(itemListResponse.toPayload(), JSON.stringify({command: 'Error', message: itemListResponse.message}));
    });

    it('Error Response test.', () => {
        const errorMessage = 'This is an error message.';
        const itemListResponse = new ErrorResponse(errorMessage);

        assert.equal(itemListResponse.success, false, 'Success should have been false.');
        assert.equal(itemListResponse.command, 'Error', 'Command should have been error.');
        assert.equal(itemListResponse.message, errorMessage, 'Error message incorrect.');
        assert.equal(itemListResponse.toPayload(), JSON.stringify({command: 'Error', message: errorMessage}));
    });

});