const CommandModel = require('./commandModel');
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
    // Todo: Singularize item
    async parseInsertCommand(cmd) {
        const commandModel = new CommandModel();
        cmd = cmd.toLowerCase();

        const boxInfo = getBoxInfo(cmd);
        console.log(boxInfo);
        if(boxInfo.hasBox) {
            commandModel.box = boxInfo.size;
        }
        const tagsInfo = getTagsInfo(cmd);
        console.log(tagsInfo);
        const itemInfo = getItemInfo(cmd, boxInfo, tagsInfo);
        console.log(itemInfo);
        // todo - prepare tags
        
        const existingItems = await this.client.findItem(itemInfo.itemName);
        console.log(existingItems);
        if(existingItems) {
            existingItems[0].success = true;
            return existingItems[0];
        }

        const matrix = new MatrixModel();
        const consumedBoxes = await this.client.findConsumedBoxes();
        console.log(consumedBoxes);
        if(consumedBoxes) {
            for(const box in consumedBoxes) {
                matrix.addItem(box.row, box.col);
            }
        }

        const nextAvailableBox = matrix.getNextAvailableBox(!(boxInfo.hasBox && boxInfo.size == 'L'));
        console.log(nextAvailableBox);
        if(nextAvailableBox == null) {
            return {success: false, message: "No available containers."};
        }
        
        const id = await this.client.insertItem(itemInfo.itemName,
            itemInfo.itemName,
            1,
            !(boxInfo.hasBox && boxInfo.size == 'L'),
            nextAvailableBox.row,
            nextAvailableBox.col);

        console.log("id= " + id);
        return {success: true, name: itemInfo.itemName, row: nextAvailableBox.row, col: nextAvailableBox.col};
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
}

function getBoxInfo(cmd) {
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
                const searchString = `${prefix} ${boxType.name} ${name}`;
                const index = cmd.indexOf(searchString);
                if(index != -1) {
                    return {hasBox: true, size: boxType.size, boxIndex: index};
                }
            }
        }
    }

    return {hasBox: false, size: null, boxIndex: null};
}

function getTagsInfo(cmd) {
    return {hasTags: false, tagsIndex: null, tags: []};
}

function getItemInfo(cmd, boxInfo, tagsInfo) {
    let itemName = cmd;
    if(boxInfo.hasBox && tagsInfo.hasTags) {
        itemName = cmd.substring(0, tagsInfo.tagsIndex < boxInfo.boxIndex ? tagsInfo.tagIndex : boxInfo.boxIndex);
    } else if (boxInfo.hasBox) {
        itemName = cmd.substring(0, boxInfo.boxIndex);
    } else if (tagsInfo.hasTags) {
        itemName = cmd.substring(0, tagsInfo.tagsIndex);
    }
    
    return {itemName};
}