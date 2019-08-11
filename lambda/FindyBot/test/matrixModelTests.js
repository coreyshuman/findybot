'use strict';

const assert = require('assert');
const MatrixModel = require('../matrixModel');


describe('Matrix Model Tests', () => { 

    it('find next available top box (2,1)', () => {
        const matrixModel = new MatrixModel();
        const maxRow = matrixModel.topRows;
        const maxCol = matrixModel.topCols;

        for(let r = 0; r < maxRow; r++) {
            for(let c = 0; c < maxCol; c++) {
                matrixModel.addItem(r, c);
                // break out
                if(r >= 2 && c >= 0) {
                    r = maxRow;
                    c = maxCol;
                }
            }
        }

        const expected = {row: 2, col: 1};
        const res = matrixModel.getNextAvailableBox(true);

        assert.deepStrictEqual(res, expected, 'getNextAvailable failed.');
    });

    it('find next available bottom box (9,3)', () => {
        const matrixModel = new MatrixModel();
        const maxRow = matrixModel.topRows + matrixModel.bottomCols;
        const maxCol = matrixModel.bottomCols;

        for(let r = 0; r < maxRow; r++) {
            for(let c = 0; c < maxCol; c++) {
                matrixModel.addItem(r, c);
                // break out
                if(r >= 9 && c >= 2) {
                    r = maxRow;
                    c = maxCol;
                }
            }
        }

        const expected = {row: 9, col: 3};
        const res = matrixModel.getNextAvailableBox(false);

        assert.deepStrictEqual(res, expected, 'getNextAvailable failed.');
    });

});