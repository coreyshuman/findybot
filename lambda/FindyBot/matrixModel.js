module.exports = class MatrixModel {
    constructor() {
        this.topRows = 8;
        this.topCols = 16;
        this.bottomRows = 6;
        this.bottomCols = 8;

        this.topItems = new Array(this.topRows).fill(0).map(() => new Array(this.topCols).fill(0));
        this.bottomItems = new Array(this.bottomRows).fill(0).map(() => new Array(this.bottomCols).fill(0));
    }

    addItem(row, col) {
        if(row < this.topRows) {
            this.topRows[row, col] = true;
        }
        else if(row < this.topRows + this.bottomRows) {
            this.bottomItems[row = this.topRows, col] = true;
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
                if(matrix[row, col] == false) {
                    matrix[row, col] = true;
                    return {row, col};
                }
            }
        }
        return null;
    }
}