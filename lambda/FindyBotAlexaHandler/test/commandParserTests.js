'use strict';

const assert = require('assert');
const CommandParser = require('../CommandParser');


describe('Command Parser Tests', () => {
    it('parse count, with count', () => {
        const cmd = '5 prototype boards in a small box tags clear red';
        const expected = {
            count: 5, 
            command: cmd, 
            parsedCommand: '5',
            subcommand: cmd.substring(2)
        };
        const response = CommandParser.getCountInfo(cmd);
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
        const response = CommandParser.getCountInfo(cmd);
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
        const response = CommandParser.getCountInfo(cmd);
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
        const response = CommandParser.getCountInfo(cmd);
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
        const response = CommandParser.getCountInfo(cmd);
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
        const response = CommandParser.getBoxInfo(cmd);
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
        const response = CommandParser.getBoxInfo(cmd);
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
        const response = CommandParser.getBoxInfo(cmd);
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
        const response = CommandParser.getBoxInfo(cmd);
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
        const response = CommandParser.getBoxInfo(cmd);
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
        const response = CommandParser.getBoxInfo(cmd);
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
        const response = CommandParser.getTagInfo(cmd);
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
        const response = CommandParser.getTagInfo(cmd);
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
        const response = CommandParser.getTagInfo(cmd);
        assert.deepStrictEqual(response, expected, 'Parse failed: ' + cmd);
    });
});

describe('Parse commands', () => { 
    it('invalid command handler', () => { 
        try {
            const response = CommandParser.parseCommand('Hotdog', null);
            assert.fail('parseCommand expected to throw error but did not');
        } catch(e) {
            assert.strictEqual(e, 'No handler exists for command Hotdog');
        }
    });
});

describe('Parse insert commands', () => { 
    it('parse insert 4 items into small box with tags', () => { 
        const cmd = '4 prototype board into a small container with tags green solder';
        const name = 'prototype board';
        const nameKey = 'prototype_board';

        const expected = {
            command: 'Insert',
            count: 4,
            name,
            nameKey,
            boxSize: 'S',
            tags: ['green', 'solder', 'prototype', 'board']
        };
        
        const response = CommandParser.parseCommand('Insert', cmd);
        assert.deepStrictEqual(response, expected, "parseInsertCommand failed: " + cmd);
    });

    it('parse insert 12 items into large box with tags', () => { 
        const cmd = '12 bjt transistors into a large box with tags npn 60amp';
        const name = 'bjt transistors';
        const nameKey = 'bjt_transistors';

        const expected = {
            command: 'Insert',
            count: 12,
            name,
            nameKey,
            boxSize: 'L',
            tags: ['npn', '60amp', 'bjt', 'transistors']
        };
        
        const response = CommandParser.parseCommand('Insert', cmd);
        assert.deepStrictEqual(response, expected, "parseInsertCommand failed: " + cmd);
    });
});