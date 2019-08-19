'use strict';

module.exports = class CommandParser {
    static parseCommand(commandName, command) {
        const commandFunctionName = `parse${commandName}Command`;
        const commandFunction = CommandParser[commandFunctionName];
        if(!commandFunction) {
            throw `No handler exists for command ${commandName}`;
        }

        const result = commandFunction(command);
        result.command = commandName;
        return result;
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
    static parseInsertCommand(cmd) {
        cmd = cmd.toLowerCase();

        try {
            const countInfo = CommandParser.getCountInfo(cmd);
            const boxInfo = CommandParser.getBoxInfo(countInfo.subcommand);
            const tagInfo = CommandParser.getTagInfo(boxInfo.subcommand);
            // todo - singularize item
            const itemName = tagInfo.subcommand;
            const nameKey = CommandParser.getNameKey(itemName);

            // add item name to tags
            tagInfo.tags = tagInfo.tags.concat(itemName.split(' '));
            
            return {
                count: countInfo.count,
                name: itemName,
                nameKey,
                boxSize: boxInfo.boxSize,
                tags: tagInfo.tags
            };
            
        } catch(e) {
            console.error(e); 
        }
    }

    static async parseFindItem(cmd) {
        cmd = cmd.toLowerCase();

        const countInfo = CommandParser.getCountInfo(cmd);
        const boxInfo = CommandParser.getBoxInfo(countInfo.subcommand);
        const tagInfo = CommandParser.getTagInfo(boxInfo.subcommand);
        // todo - singularize item
        const itemName = tagInfo.subcommand;
        const nameKey = CommandParser.getNameKey(itemName);

        
    }

    static getCountInfo(cmd) {
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

    static getBoxInfo(cmd) {
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
    
    static getTagInfo(cmd) {
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

    static getNameKey(name) {
        return name.split(' ').join('_');
    }
}
