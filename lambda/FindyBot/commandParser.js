'use strict';

const MatrixModel = require('./matrixModel');

module.exports = class CommandParser {
    constructor(client) {
        this.client = client;
    }

    // 1. Check if item exists, if yes, return the box it's in.
    // 2. Query for currently used boxes, find an empty box if one exists, and return it's row/column location
    // 3. Insert an entry into the Items table with the row/column info
    // 4. If successful, insert entries into the Tags table with the words from the item name as tags
    // 4. Return a response with data indicating the insert was successful, and the row/column info
    //
    // Format of info can be:
    // a. "[count] <item name>"
    // b. "[count] <item name> into a <small box|big box> with tags <tag0 tag1 tag2 ...>"
    // c. "[count] <item name> with tags <tag0 tag1 tag2 ...> into a <small box|big box>"
    //
    async parseInsertCommand(cmd) {
        cmd = cmd.toLowerCase();

        try {
            const countInfo = this.getCountInfo(cmd);
            const boxInfo = this.getBoxInfo(countInfo.subcommand);
            const tagInfo = this.getTagInfo(boxInfo.subcommand);
            // todo - singularize item
            const itemName = tagInfo.subcommand;
            const nameKey = this.getNameKey(itemName);

            // add item name to tags
            tagInfo.tags = tagInfo.tags.concat(itemName.split(' '));
            
            const existingItems = await this.client.findItem(nameKey);
            // item already exists, update tag and return
            if(existingItems) {
                await this.client.insertTags(nameKey, tagInfo.tags);
                existingItems[0].success = true;
                return existingItems[0];
            }

            const matrix = new MatrixModel();
            const consumedBoxes = await this.client.findConsumedBoxes();
            if(consumedBoxes) {
                for(const box in consumedBoxes) {
                    matrix.addItem(consumedBoxes[box].row, consumedBoxes[box].col);
                }
            }

            const nextAvailableBox = matrix.getNextAvailableBox(boxInfo.boxSize === 'S');
            if(nextAvailableBox == null) {
                return {success: false, message: "No available containers."};
            }
            
            try {
                await this.client.query('BEGIN');
                await this.client.insertItem(nameKey,
                    itemName,
                    countInfo.count,
                    boxInfo.boxSize === 'S',
                    nextAvailableBox.row,
                    nextAvailableBox.col);

                await this.client.insertTags(nameKey, tagInfo.tags);
                await this.client.query('COMMIT');
            } catch(e) {
                try {
                    await this.client.query('ROLLBACK');
                } catch(e) {}
                throw e;
            }

            return {success: true, nameKey, name: itemName, row: nextAvailableBox.row, col: nextAvailableBox.col};

        } catch(e) {
            console.error(e); 
            try {
                await this.client.logError(e);
            } catch(e) { 
                console.error(e); 
            }
            return {success: false, message: "Database error occurred."};
        }
    }

    async parseFindItem(cmd) {
        cmd = cmd.toLowerCase();

        const existingItems = await this.client.findItem(itemInfo.itemName);
        console.log(existingItems);
        if(existingItems) {
            existingItems[0].success = true;
            return existingItems[0];
        }
        
        return {success: false, message: "Item not found."};
    }

    getCountInfo(cmd) {
        const response = {
            count: 1, 
            command: cmd, 
            parsedCommand: null,
            subcommand: cmd
        };
        const edgeCases = [
            {word: 'for', count: 4},
            {word: 'a', count: 1},
            {word: 'an', count: 1},
            {word: 'to', count: 2},
            {word: 'too', count: 2}

        ];
        const firstToken = cmd.split(' ')[0];
        const count = parseInt(firstToken);
        if(isNaN(count) || !isFinite(count)) {
            for(const edge in edgeCases) {
                if(firstToken === edgeCases[edge].word) {
                    response.count = edgeCases[edge].count;
                    response.parsedCommand = firstToken;
                    response.subcommand = cmd.substring(firstToken.length).trim();
                    return response;
                }
            }
        } else {
            response.count = count;
            response.parsedCommand = firstToken;
            response.subcommand = cmd.substring(firstToken.length).trim();
        }
        return response;
    }

    getBoxInfo(cmd) {
        const response = {
            boxSize: 'S', 
            command: cmd, 
            parsedCommand: null,
            subcommand: cmd
        };
        const boxPrefixes = ['into a', 'in a'];
        const boxTypes = [
            {name: 'big', size: 'L'},
            {name: 'large', size: 'L'},
            {name: 'small', size: 'S'},
            {name: 'little', size: 'S'},
        ];
        const boxNames = ['box', 'container'];
        for(const prefix in boxPrefixes) {
            for(const boxType in boxTypes) {
                for(const name in boxNames) {
                    const searchString = `${boxPrefixes[prefix]} ${boxTypes[boxType].name} ${boxNames[name]}`;
                    const index = cmd.indexOf(searchString);
                    if(index != -1) {
                        response.boxSize = boxTypes[boxType].size;
                        response.parsedCommand = searchString;
                        response.subcommand = cmd.substring(0, index).trim();
                        if(cmd.length > index + searchString.length) {
                            response.subcommand += cmd.substring(index + searchString.length);
                        }
                        return response;
                    }
                }
            }
        }
    
        return response;
    }
    
    getTagInfo(cmd) {
        const response = {
            tags: [], 
            command: cmd, 
            parsedCommand: null,
            subcommand: cmd
        };
        const tagPrefix = ['with tags', 'with tag'];
        for(const prefix in tagPrefix) {
            const searchString = tagPrefix[prefix];
            const index = cmd.indexOf(searchString);
            if(index != -1) {
                const tags = cmd.substring(index + searchString.length).trim().split(' ');
                response.tags = tags;
                response.parsedCommand = cmd.substring(index);
                response.subcommand = cmd.substring(0, index).trim();
                return response;
            }
        }
    
        return response;
    }

    getNameKey(name) {
        return name.split(' ').join('_');
    }
}
