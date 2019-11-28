import {Puzzle, PuzzleControls} from "./puzzle/Puzzle.js";

window.addEventListener('load', () => {
    const canvas = document.querySelector('canvas');
    const image = document.querySelector('img');

    const game = new Puzzle(canvas);
    game.loadImage(image);
    game.draw(canvas);

    const controls = new PuzzleControls();
    controls.onPuzzle(game).fromInput(canvas);

    window.swap = (x, y) => {
        game.swapNullWith(x, y);
        game.draw(canvas);
    }
});
