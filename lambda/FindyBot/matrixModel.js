'use strict';
module.exports = class MatrixModel {
    constructor() {
        this.topRows = 8;
        this.topCols = 16;
        this.bottomRows = 6;
        this.bottomCols = 8;

        this.topItems = new Array(this.topRows);
        this.bottomItems = new Array(this.bottomRows);

        for(let i = 0; i < this.topRows; i++) {
            this.topItems[i] = new Array(this.topCols);
            for(let j = 0; j < this.topCols; j++) {
                this.topItems[i][j] = false;
            }
        }
        for(let i = 0; i < this.bottomRows; i++) {
            this.bottomItems[i] = new Array(this.bottomCols);
            for(let j = 0; j < this.bottomCols; j++) {
                this.bottomItems[i][j] = false;
            }
        }
    }

    addItem(row, col) {
        if(row < this.topRows && col < this.topCols) {
            this.topItems[row][col] = true;
        }
        else if(row < this.topRows + this.bottomRows && col < this.bottomCols) {
            this.bottomItems[row - this.topRows][col] = true;
        }
    }

    getNextAvailableBox(isSmallBox) {
        if(isSmallBox) {
            return this.getBoxAndUpdate(this.topItems, this.topRows, this.topCols);
        } else {
            const box = this.getBoxAndUpdate(this.bottomItems, this.bottomRows, this.bottomCols);
            if(box == null) return null;
            
            box.row += this.topRows;
            return box;
        }
    }

    getBoxAndUpdate(matrix, rows, cols) {
        for(let row = 0; row < rows; row++) {
            for(let col = 0; col < cols; col++) {
                if(matrix[row][col] === false) {
                    matrix[row][col] = true;
                    return {row, col};
                }
            }
        }
        return null;
    }
}