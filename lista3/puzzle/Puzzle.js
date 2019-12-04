class PuzzlePiece {
    constructor(serialNumber, image, xOffset, yOffset, width, height) {
        this.serialNumber = serialNumber;
        this.image = image;
        this.xOffset = xOffset;
        this.yOffset = yOffset;
        this.width = width;
        this.height = height;
        this.hovered = false;
    }

    draw(ctx, x, y, height, width) {
        if (this.hovered) {
            ctx.save();
            ctx.globalAlpha = 0.5;
        }
        ctx.drawImage(this.image, this.xOffset, this.yOffset, this.width, this.height, x, y, height, width);
        if (this.hovered) {
            ctx.restore();
        }
    }
}

class NullPiece {
    constructor(serialNumber, color) {
        this.serialNumber = serialNumber;
        this.color = color;
    }

    draw(ctx, x, y, width, height) {
        ctx.fillStyle = this.color;
        ctx.fillRect(x, y, width, height);
    }
}

export class Puzzle {
    constructor(canvas, rows = 4, columns = 4) {
        this.beingMixed = false;

        this.rows = rows;
        this.columns = columns;
        this.canvas = canvas;

        this.onWin = null;

        this.pieces = [];
        this.nullPosition = {
            row: -1, col: -1
        };
    }

    setOnWin(cb) {
        this.onWin = cb;
    }

    loadImage(image) {
        let pieceHeight = image.naturalHeight / this.rows;
        let pieceWidth = image.naturalWidth / this.columns;

        let nullFlag = false;
        for (let r = 0; r < this.rows; r++) {
            this.pieces.push([]);
            for (let c = 0; c < this.columns; c++) {
                let serial = r * this.columns + c;
                if ((!nullFlag && (Math.random() < 1 / (this.rows + this.columns) || r === this.rows - 1 && c === this.columns - 1))) {
                    this.pieces[r].push(new NullPiece(serial, '#8a1200'));
                    this.nullPosition.row = r;
                    this.nullPosition.col = c;
                    nullFlag = true;
                } else {
                    this.pieces[r].push(new PuzzlePiece(serial, image, pieceWidth * c, pieceHeight * r, pieceWidth, pieceHeight));
                }
            }
        }
    }

    canSwapWithNull(row, col) {
        if (row === this.nullPosition.row) {
            if (Math.abs(col - this.nullPosition.col) === 1 && col > -1 && col < this.columns) {
                return true;
            }
        } else if (Math.abs(row - this.nullPosition.row) === 1 && row > -1 && row < this.rows) {
            if (col === this.nullPosition.col) {
                return true;
            }
        }
        return false;
    }

    swapNullWith(row, col) {
        if (this.canSwapWithNull(row, col)) {
            this.pieces[row][col].hovered = false;
            [this.pieces[row][col], this.pieces[this.nullPosition.row][this.nullPosition.col]] =
                [this.pieces[this.nullPosition.row][this.nullPosition.col], this.pieces[row][col]];
            this.nullPosition.row = row;
            this.nullPosition.col = col;

            if (!this.beingMixed && this.checkWon()) {
                if (this.onWin) this.onWin();
            }
        } else {
            throw `Swapping (${this.nullPosition.row}, ${this.nullPosition.col}) and (${row}, ${col}) is impossible`;
        }
    }

    draw(canvasElement = this.canvas) {
        let ctx = canvasElement.getContext('2d');
        ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);

        let pieceHeight = canvasElement.height / this.rows;
        let pieceWidth = canvasElement.width / this.columns;

        this.pieces.forEach((row, r) => {
            row.forEach((piece, c) => {
                piece.draw(ctx, pieceWidth * c, pieceHeight * r, pieceWidth, pieceHeight);
            });
        })
    }

    redrawPiece(row, column, canvasElement = this.canvas) {
        let ctx = canvasElement.getContext('2d');
        let pieceHeight = canvasElement.height / this.rows;
        let pieceWidth = canvasElement.width / this.columns;

        ctx.clearRect(pieceWidth * column, pieceHeight * row, pieceWidth, pieceHeight);
        this.pieces[row][column].draw(ctx, pieceWidth * column, pieceHeight * row, pieceWidth, pieceHeight);
    }

    checkWon() {
        let previousSerial = -1;
        for (let row of this.pieces) {
            for (let piece of row) {
                if (piece.serialNumber < previousSerial) return false;
                previousSerial = piece.serialNumber;
            }
        }
        return true;
    }
}

export class PuzzleControls {
    constructor(puzzle, element) {
        this.puzzle = puzzle;
        element.addEventListener('click', event => {
            let row = Math.floor(event.layerY / (element.height / puzzle.rows));
            let col = Math.floor(event.layerX / (element.width / puzzle.columns));

            try {
                this.puzzle.swapNullWith(row, col);
                this.puzzle.draw();
            } catch (e) {
                console.log(`You can't do it! ${e}`);
            }
        });
        element.addEventListener('pointermove', event => {
            let row = Math.floor(event.layerY / (element.height / puzzle.rows));
            let col = Math.floor(event.layerX / (element.width / puzzle.columns));

            this.puzzle.pieces.forEach((piecesRow, r) => piecesRow.forEach((piece, c) => {
                if (piece.hovered !== (r === row && c === col) && puzzle.canSwapWithNull(r, c)) {
                    piece.hovered = r === row && c === col;
                    this.puzzle.redrawPiece(r, c);
                }
            }));
        });
    }
}

export function puzzleMixup(iterations, puzzle, cool = false, time = 2000, cb) {
    if (puzzle.beingMixed) return;
    puzzle.beingMixed = true;

    let i = iterations;
    let nullRow = puzzle.nullPosition.row;
    let nullCol = puzzle.nullPosition.col;

    while (i-- > 0) {
        let row, col;
        let ii = i;
        if (Math.random() > 0.5) { // swap rows/columns
            col = nullCol;
            if (nullRow === puzzle.rows - 1) {
                row = nullRow - 1;
            } else if (nullRow === 0) {
                row = 1;
            } else {
                row = nullRow + (Math.random() > 0.5 ? -1 : 1);
            }
        } else {
            row = nullRow;
            if (nullCol === puzzle.columns - 1) {
                col = nullCol - 1;
            } else if (nullCol === 0) {
                col = 1;
            } else {
                col = nullCol + (Math.random() > 0.5 ? -1 : 1);
            }
        }
        if (cool) {
            setTimeout(() => {
                puzzle.swapNullWith(row, col);
                puzzle.draw();
                if (ii === 0 && cb) {
                    puzzle.beingMixed = false;
                    cb();
                }
            }, time / iterations * (iterations - i));
        } else {
            puzzle.swapNullWith(row, col);
        }
        nullCol = col;
        nullRow = row;
    }
    if (!cool) puzzle.beingMixed = false;
    puzzle.draw();
}
