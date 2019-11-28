class PuzzlePiece {
    constructor(image, xOffset, yOffset, width, height) {
        this.image = image;
        this.xOffset = xOffset;
        this.yOffset = yOffset;
        this.width = width;
        this.height = height;
    }

    draw(ctx, x, y, height, width) {
        ctx.drawImage(
            this.image,
            this.xOffset,
            this.yOffset,
            this.width,
            this.height,
            x,
            y,
            height,
            width
        );
    }
}

class NullPiece {
    constructor(color) {
        this.color = color;
    }

    draw(ctx, x, y, height, width) {
        ctx.fillStyle = this.color;
        ctx.fillRect(x, y, width, height);
    }
}

export class Puzzle {
    constructor(canvas, rows = 4, columns = 4) {
        this.rows = rows;
        this.columns = columns;
        this.canvas = canvas;

        this.pieces = [];
        this.nullPosition = {
            row: -1, col: -1
        };
    }

    loadImage(image) {
        let pieceHeight = image.naturalHeight / this.rows;
        let pieceWidth = image.naturalWidth / this.columns;

        let nullFlag = false;
        for (let r = 0; r < this.rows; r++) {
            this.pieces.push([]);
            for (let c = 0; c < this.columns; c++) {
                if ((!nullFlag && (Math.random() < 1 / (this.rows + this.columns) || r === this.rows - 1 && c === this.columns - 1))) {
                    this.pieces[r].push(new NullPiece('#0070ff'));
                    this.nullPosition.row = r;
                    this.nullPosition.col = c;
                    nullFlag = true;
                } else {
                    this.pieces[r].push(new PuzzlePiece(
                        image,
                        pieceWidth * c,
                        pieceHeight * r,
                        pieceWidth,
                        pieceHeight
                    ));
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
            [this.pieces[row][col], this.pieces[this.nullPosition.row][this.nullPosition.col]] =
                [this.pieces[this.nullPosition.row][this.nullPosition.col], this.pieces[row][col]];
            this.nullPosition.row = row;
            this.nullPosition.col = col;
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
                piece.draw(
                    ctx,
                    pieceWidth * c,
                    pieceHeight * r,
                    pieceWidth,
                    pieceHeight
                )
            });
        })
    }
}

export class PuzzleControls {
    constructor(rows = 4, columns = 4) {
        this.eventTarget = null;
        this.puzzle = null;
        this.handler = null;

        this.rows = rows;
        this.columns = columns;
    }

    onPuzzle(puzzle) {
        this.puzzle = puzzle;
        return this;
    }

    fromInput(element) {
        if (this.eventTarget) this.eventTarget.removeEventListener('click', this.handler);
        this.eventTarget = element;
        let handler = this.createClickHandler(this);
        this.handler = handler;
        this.eventTarget.addEventListener('click', handler);
        return this;
    }

    createClickHandler(thisArg) {
        return event => {
            if (thisArg.puzzle === null) throw 'Please attach a Puzzle';

            let row = Math.floor(event.layerY/(thisArg.eventTarget.height/thisArg.columns));
            let col = Math.floor(event.layerX/(thisArg.eventTarget.width/thisArg.rows));

            this.puzzle.swapNullWith(row, col);
            this.puzzle.draw();
        }
    }
}
