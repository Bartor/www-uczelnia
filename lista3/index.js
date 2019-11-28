import {Puzzle, PuzzleControls, puzzleMixup} from "./puzzle/Puzzle.js";

window.addEventListener('load', () => {
    const canvas = document.querySelector('canvas');
    const image = document.querySelector('img');

    const game = new Puzzle(canvas);
    game.loadImage(image);
    game.draw(canvas);

    const controls = new PuzzleControls();
    controls.onPuzzle(game).fromInput(canvas);

    document.querySelector('#mixup').addEventListener('click', event => {
        event.preventDefault();
        let iterations = Number(document.getElementById('iterations').value);
        let cool = document.getElementById('cool').checked;

        if (cool) event.target.disabled = true;
        puzzleMixup(iterations, game, cool, 2000);
        if (cool) setTimeout(() => event.target.disabled = false, 2000);
    });
});
