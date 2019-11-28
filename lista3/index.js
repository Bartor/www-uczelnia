import {Puzzle, PuzzleControls, puzzleMixup} from "./puzzle/Puzzle.js";

window.addEventListener('load', () => {
    let canvas = document.querySelector('canvas');
    const img = document.querySelector('img');

    const mixupButton = document.getElementById('mixup');
    const newGameButton = document.getElementById('newGame');

    const toggleButtons = (state) => {
        mixupButton.disabled = !state;
        newGameButton.disabled = !state;
    };

    let getGame;
    const newGame = (rows, columns, image, cb) => {
        let newCanvas = document.createElement('canvas');
        newCanvas.height = 500;
        newCanvas.width = 500;
        newCanvas.id = 'canvas';
        canvas.parentNode.replaceChild(newCanvas, canvas);
        canvas = newCanvas;

        let game = new Puzzle(canvas, rows, columns);
        let controls = new PuzzleControls(game, canvas);

        game.setOnWin(() => alert('You won!'));

        let prevSrc = img.src;
        img.onload = () => {
            game.loadImage(img);
            game.draw(canvas);
            if (cb) cb();
        };
        img.onerror = (err) => {
            alert('This image doesn\'t seem to load... Going back to previous image');
            img.src = prevSrc;
            if (cb) cb();
        };

        img.src = image;
        getGame = () => game;
        return game;
    };
    newGame(4, 4, img.src);

    mixupButton.addEventListener('click', event => {
        event.preventDefault();
        let iterations = Number(document.getElementById('iterations').value);
        let cool = document.getElementById('cool').checked;

        if (cool)  {
            toggleButtons(false);
        }
        puzzleMixup(iterations, getGame(), cool, 2000, () => {
            toggleButtons(true);
        });
    });

    newGameButton.addEventListener('click', event => {
        event.preventDefault();
        let rows = Number(document.getElementById('rows').value);
        let cols = Number(document.getElementById('columns').value);
        let imgS = document.getElementById('imageSource').value;

        toggleButtons(false);
        newGame(rows, cols, imgS, () => {
            toggleButtons(true);
        });
    });
});
