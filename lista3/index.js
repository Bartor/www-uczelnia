import {Puzzle, PuzzleControls, puzzleMixup} from "./puzzle/Puzzle.js";

const images = [
    {thumb : 'content/JPEG/1.jpg', full: 'content/1.png'},
    {thumb : 'content/JPEG/2.jpg', full: 'content/2.png'},
    {thumb : 'content/JPEG/3.jpg', full: 'content/3.png'}
];

function resizeCanvas(canvas, imageToDraw) {
    if (window.innerHeight > window.innerWidth) {
        if (window.innerHeight*0.4 > window.innerWidth) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerWidth;
        } else {
            canvas.height = window.innerHeight*0.4;
            canvas.width = window.innerHeight*0.4;
        }
    } else {
        canvas.height = window.innerWidth*0.4;
        canvas.width = window.innerWidth*0.4;
    }
    if (imageToDraw) {
        let ctx = canvas.getContext('2d');
        ctx.drawImage(imageToDraw, 0, 0, imageToDraw.naturalWidth, imageToDraw.naturalHeight, 0, 0, canvas.height, canvas.width);
    }
}

function newGame(rows, columns, image, container) {
    let canvas = document.createElement('canvas');

    while (container.firstChild) container.removeChild(container.firstChild);
    container.append(canvas);
    resizeCanvas(canvas);

    let game = new Puzzle(canvas, rows, columns);
    new PuzzleControls(game, canvas);

    game.setOnWin(() => alert('You won!'));
    game.loadImage(image);
    game.draw();

    return {
        game: game,
        canvas: canvas
    };
}

function generateGallery(images, container, imageCanvas, gameContainer) {
    let data = {
        game: null,
        image: null,
        canvas: null,
    };
    images.forEach(image => {
        let img = document.createElement('img');
        img.src = image.thumb;
        img.addEventListener('click', () => {
            let rows = Number(document.getElementById('rows').value);
            let cols = Number(document.getElementById('columns').value);

            loadImage(image.full).then((image) => {
                resizeCanvas(imageCanvas, image);
                let result = newGame(rows, cols, image, gameContainer);
                data.game = result.game;
                data.canvas = result.canvas;
                data.image = image;
            }).catch(err => {
                console.error(err);
                alert('There was an error! Is the url correct?');
            });
        });
        container.append(img);
    });
    return data;
}

function loadImage(source) {
    let image = new Image();
    let promise = new Promise((resolve, reject) => {
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', err => reject(err));
    });
    image.src = source;
    return promise;
}

window.addEventListener('load', () => {
    const canvasContainer = document.getElementById('canvas-container');
    const imageCanvas = document.getElementById('image');
    const mixUpButton = document.getElementById('mix');
    const gallery = document.getElementById('gallery');

    const data = generateGallery(images, gallery, imageCanvas, canvasContainer);

    window.addEventListener('resize', () => {
        if (data.image) {
            resizeCanvas(imageCanvas, data.image);
        }
        if (data.canvas) {
            resizeCanvas(data.canvas);
        }
        if (data.game) {
            data.game.draw();
        }
    });

    mixUpButton.addEventListener('click', event => {
        event.preventDefault();
        let iterations = Number(document.getElementById('iterations').value);
        let cool = document.getElementById('cool').checked;

        mixUpButton.enabled = false;
        puzzleMixup(iterations, data.game, cool, 2000, () => {
            mixUpButton.enabled = false;
        });
    });
});
