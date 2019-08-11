'use strict';

const assert = require('assert');
const CommandParser = require('../commandParser');

const client = {};
const commandParser = new CommandParser(client);

describe('Command Parser Tests', () => {
    it('test', () => {
        assert.ok(true, 'fail');
    });

    it('parse count, with count', () => {
        const cmd = '5 prototype boards in a small box tags clear red';
        const expected = {
            count: 5, 
            command: cmd, 
            parsedCommand: '5',
            subcommand: cmd.substring(2)
        };
        const response = commandParser.getCountInfo(cmd);
        assert.deepStrictEqual(response, expected, 'Parse failed: ' + cmd);
    });

    it('parse count, edge case for', () => {
        const cmd = 'for cars';
        const expected = {
            count: 4, 
            command: cmd, 
            parsedCommand: 'for',
            subcommand: cmd.substring(4)
        };
        const response = commandParser.getCountInfo(cmd);
        assert.deepStrictEqual(response, expected, 'Parse failed: ' + cmd);
    });

    it('parse count, edge case a', () => {
        const cmd = 'a car';
        const expected = {
            count: 1, 
            command: cmd, 
            parsedCommand: 'a',
            subcommand: cmd.substring(2)
        };
        const response = commandParser.getCountInfo(cmd);
        assert.deepStrictEqual(response, expected, 'Parse failed: ' + cmd);
    });

    it('parse count, edge case an', () => {
        const cmd = 'an apple';
        const expected = {
            count: 1, 
            command: cmd, 
            parsedCommand: 'an',
            subcommand: cmd.substring(3)
        };
        const response = commandParser.getCountInfo(cmd);
        assert.deepStrictEqual(response, expected, 'Parse failed: ' + cmd);
    });

    it('parse count, no count', () => {
        const cmd = 'prototype board in a large box with tags clear red';
        const expected = {
            count: 1, 
            command: cmd, 
            parsedCommand: null,
            subcommand: cmd
        };
        const response = commandParser.getCountInfo(cmd);
        assert.deepStrictEqual(response, expected, 'Parse failed: ' + cmd);
    });

    it('parse box, in a large box', () => {
        const cmd = 'prototype board in a large box with tags clear red';
        const expected = {
            boxSize: 'L', 
            command: cmd, 
            parsedCommand: 'in a large box',
            subcommand: 'prototype board with tags clear red'
        };
        const response = commandParser.getBoxInfo(cmd);
        assert.deepStrictEqual(response, expected, 'Parse failed: ' + cmd);
    });

    it('parse box, into a big container', () => {
        const cmd = 'prototype board with tags clear red into a big container';
        const expected = {
            boxSize: 'L', 
            command: cmd, 
            parsedCommand: 'into a big container',
            subcommand: 'prototype board with tags clear red'
        };
        const response = commandParser.getBoxInfo(cmd);
        assert.deepStrictEqual(response, expected, 'Parse failed: ' + cmd);
    });

    it('parse box, in a small container', () => {
        const cmd = 'prototype board with tags clear red in a small container';
        const expected = {
            boxSize: 'S', 
            command: cmd, 
            parsedCommand: 'in a small container',
            subcommand: 'prototype board with tags clear red'
        };
        const response = commandParser.getBoxInfo(cmd);
        assert.deepStrictEqual(response, expected, 'Parse failed: ' + cmd);
    });

    it('parse box, into a little box', () => {
        const cmd = 'prototype board into a little box with tags clear red';
        const expected = {
            boxSize: 'S', 
            command: cmd, 
            parsedCommand: 'into a little box',
            subcommand: 'prototype board with tags clear red'
        };
        const response = commandParser.getBoxInfo(cmd);
        assert.deepStrictEqual(response, expected, 'Parse failed: ' + cmd);
    });

    it('parse box, no box with tags', () => {
        const cmd = 'prototype board with tags clear red';
        const expected = {
            boxSize: 'S', 
            command: cmd, 
            parsedCommand: null,
            subcommand: 'prototype board with tags clear red'
        };
        const response = commandParser.getBoxInfo(cmd);
        assert.deepStrictEqual(response, expected, 'Parse failed: ' + cmd);
    });

    it('parse box, no box no tags', () => {
        const cmd = 'prototype board';
        const expected = {
            boxSize: 'S', 
            command: cmd, 
            parsedCommand: null,
            subcommand: 'prototype board'
        };
        const response = commandParser.getBoxInfo(cmd);
        assert.deepStrictEqual(response, expected, 'Parse failed: ' + cmd);
    });

    it('parse tags, with tags', () => {
        const cmd = 'prototype board with tags clear red solder';
        const expected = {
            tags: ['clear', 'red', 'solder'], 
            command: cmd, 
            parsedCommand: 'with tags clear red solder',
            subcommand: 'prototype board'
        };
        const response = commandParser.getTagInfo(cmd);
        assert.deepStrictEqual(response, expected, 'Parse failed: ' + cmd);
    });

    it('parse tags, with tag', () => {
        const cmd = 'prototype board with tag clear red';
        const expected = {
            tags: ['clear', 'red'], 
            command: cmd, 
            parsedCommand: 'with tag clear red',
            subcommand: 'prototype board'
        };
        const response = commandParser.getTagInfo(cmd);
        assert.deepStrictEqual(response, expected, 'Parse failed: ' + cmd);
    });

    it('parse tags, no tag', () => {
        const cmd = 'prototype board';
        const expected = {
            tags: [], 
            command: cmd, 
            parsedCommand: null,
            subcommand: 'prototype board'
        };
        const response = commandParser.getTagInfo(cmd);
        assert.deepStrictEqual(response, expected, 'Parse failed: ' + cmd);
    });
});

describe('Command Insert Test', () => { 
    it('inserts into next empty small container 0,1', async () => { 
        const cmd = '4 prototype board into a small container with tags green solder';
        const name = 'prototype board';
        const nameKey = 'prototype_board';
        client.findItem = () => {return Promise.resolve(null)};
        client.findConsumedBoxes = () => {return Promise.resolve([{row: 0, col: 0}])};
        client.insertItem = (_nameKey, _name, _count, _isSmall, _row, _col) => {
            const insertExpected = {
                nameKey,
                name,
                count: 4,
                isSmall: true,
                row: 0,
                col: 1
            };
            const insert = {
                nameKey: _nameKey,
                name: _name,
                count: _count,
                isSmall: _isSmall,
                row: _row,
                col: _col
            };
            assert.deepStrictEqual(insert, insertExpected, 'insertItem parameters incorrect.');
            return Promise.resolve(nameKey)
        
        };

        const expected = {
            success: true, 
            id: nameKey,
            nameKey,
            name, 
            row: 0, 
            col: 1
        };
        try {
            const response = await commandParser.parseInsertCommand(cmd);
            assert.deepStrictEqual(response, expected, "parseInsertCommand failed: " + cmd);
        } catch(e) {
            throw e;
        }

    });

    it('inserts into next empty large container 8,2', async () => { 
        const cmd = '44 prototype circuit board into a big container with tags green solder';
        const name = 'prototype circuit board';
        const nameKey = 'prototype_circuit_board';
        client.findItem = () => {return Promise.resolve(null)};
        client.findConsumedBoxes = () => {return Promise.resolve([{row: 8, col: 0}, {row: 8, col: 1}])};
        client.insertItem = (_nameKey, _name, _count, _isSmall, _row, _col) => {
            const insertExpected = {
                nameKey,
                name,
                count: 44,
                isSmall: false,
                row: 8,
                col: 2
            };
            const insert = {
                nameKey: _nameKey,
                name: _name,
                count: _count,
                isSmall: _isSmall,
                row: _row,
                col: _col
            };
            assert.deepStrictEqual(insert, insertExpected, 'insertItem parameters incorrect.');
            return Promise.resolve(nameKey)
        
        };

        const expected = {
            success: true, 
            id: nameKey,
            nameKey,
            name, 
            row: 8, 
            col: 2
        };
        try {
            const response = await commandParser.parseInsertCommand(cmd);
            assert.deepStrictEqual(response, expected, "parseInsertCommand failed: " + cmd);
        } catch(e) {
            throw e;
        }

    });

});