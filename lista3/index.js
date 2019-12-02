import {Puzzle, PuzzleControls, puzzleMixup} from "./puzzle/Puzzle.js";

const images = [
    {thumb : 'content/JPEG/1.jpg', full: 'content/1.png'},
    {thumb : 'content/JPEG/2.jpg', full: 'content/2.png'},
    {thumb : 'content/JPEG/3.jpg', full: 'content/3.png'}
];

window.addEventListener('load', () => {
    let canvas = document.querySelector('canvas');
    const img = document.getElementById('image');

    const gallery = document.getElementById('gallery');

    const mixupButton = document.getElementById('mixup');
    const newGameButton = document.getElementById('newGame');

    const toggleButtons = (state) => {
        mixupButton.disabled = !state;
        newGameButton.disabled = !state;
    };

    let getGame;
    const newGame = (rows, columns) => {
        let newCanvas = document.createElement('canvas');
        newCanvas.height = 500;
        newCanvas.width = 500;
        newCanvas.id = 'canvas';
        canvas.parentNode.replaceChild(newCanvas, canvas);
        canvas = newCanvas;

        let game = new Puzzle(canvas, rows, columns);
        new PuzzleControls(game, canvas);

        game.setOnWin(() => alert('You won!'));
        getGame = () => game;
        game.loadImage(img);
        game.draw();
    };

    const generateGalleries = (imgs, container) => {
        imgs.forEach(image => {
            let imgg = document.createElement('img');
            imgg.src = image.thumb;
            imgg.addEventListener('click', () => {
                loadImage(image.full).then(() => {
                    newGame();
                }).catch(err => {
                    console.error(err);
                    alert('There was an error! Is the url correct?');
                    toggleButtons(true);
                })
            });
            container.append(imgg);
        });
    };

    const loadImage = src => {
        let now = false;
        if (img.src === src) now = true;
        let promise = new Promise((resolve, reject) => {
            if (now) {
                resolve();
                return;
            }
            img.addEventListener('load', () => resolve());
            img.addEventListener('error', err => reject(err));
        });
        img.src = src;
        return promise;
    };

    generateGalleries(images, gallery);

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

        if (imgS === '') {
            imgS = img.src;
        }

        toggleButtons(false);
        loadImage(imgS).then(() => {
            newGame(rows, cols);
            toggleButtons(true);
        }).catch(err => {
            console.error(err);
            alert('There was an error! Is the url correct');
            toggleButtons(true);
        });
    });
});
