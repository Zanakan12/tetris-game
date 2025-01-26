// Code complet pour un jeu Tetris affichant les lettres sur la grille
document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('#grid');

    // Création de la grille (10x20 + 10 cellules invisibles pour les collisions)
    for (let i = 0; i < 200; i++) {
        const cell = document.createElement('div');
        grid.appendChild(cell);
    }
    for (let i = 0; i < 10; i++) {
        const cell = document.createElement('div');
        cell.classList.add('taken');
        grid.appendChild(cell);
    }

    const squares = Array.from(document.querySelectorAll('#grid div'));
    const width = 10;

    // Définition des Tetrominos personnalisés (lettres)
    const customTetrominoes = {
        L: [
            [1, width + 1, width * 2 + 1, 2],
            [width, width + 1, width + 2, width * 2 + 2],
            [1, width + 1, width * 2 + 1, width * 2],
            [width, width * 2, width * 2 + 1, width * 2 + 2]
        ],
        T: [
            [1, width, width + 1, width + 2],
            [1, width + 1, width * 2 + 1, width + 2],
            [width, width + 1, width + 2, width * 2 + 1],
            [1, width, width + 1, width * 2 + 1]
        ],
        I: [
            [1, width + 1, width * 2 + 1, width * 3 + 1],
            [width, width + 1, width + 2, width + 3],
            [1, width + 1, width * 2 + 1, width * 3 + 1],
            [width, width + 1, width + 2, width + 3]
        ],
        O: [
            [0, 1, width, width + 1],
            [0, 1, width, width + 1],
            [0, 1, width, width + 1],
            [0, 1, width, width + 1]
        ]
    };

    const letters = Object.keys(customTetrominoes);
    let currentPosition = 4;
    let currentRotation = 0;
    let random = Math.floor(Math.random() * letters.length);
    let currentLetter = letters[random];
    let current = customTetrominoes[currentLetter][currentRotation];

    // Dessiner le Tetromino (lettre)
    function draw() {
        current.forEach(index => {
            const square = squares[currentPosition + index];
            square.classList.add('block', currentLetter); // Ajoute la classe de la lettre
            square.textContent = currentLetter; // Affiche la lettre
        });
    }

    // Effacer le Tetromino (lettre)
    function undraw() {
        current.forEach(index => {
            const square = squares[currentPosition + index];
            square.classList.remove('block', currentLetter); // Supprime la classe de la lettre
            square.textContent = ''; // Supprime la lettre
        });
    }

    // Déplacement vers le bas
    function moveDown() {
        undraw();
        currentPosition += width;
        draw();
        freeze();
    }

    // Gérer les collisions et geler les blocs
    function freeze() {
        if (current.some(index => squares[currentPosition + index + width].classList.contains('taken'))) {
            current.forEach(index => squares[currentPosition + index].classList.add('taken'));
            startNewTetromino();
        }
    }

    // Déplacer à gauche
    function moveLeft() {
        undraw();
        const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0);
        if (!isAtLeftEdge) currentPosition -= 1;
        if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition += 1;
        }
        draw();
    }

    // Déplacer à droite
    function moveRight() {
        undraw();
        const isAtRightEdge = current.some(index => (currentPosition + index) % width === width - 1);
        if (!isAtRightEdge) currentPosition += 1;
        if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition -= 1;
        }
        draw();
    }

    // Faire pivoter le Tetromino
    function rotate() {
        undraw();
        currentRotation = (currentRotation + 1) % customTetrominoes[currentLetter].length;
        current = customTetrominoes[currentLetter][currentRotation];
        draw();
    }

    // Lancer un nouveau Tetromino (lettre)
    function startNewTetromino() {
        random = Math.floor(Math.random() * letters.length);
        currentLetter = letters[random];
        current = customTetrominoes[currentLetter][currentRotation];
        currentPosition = 4;
        draw();
    }

    // Contrôles clavier
    document.addEventListener('keydown', e => {
        if (e.keyCode === 37) moveLeft();
        else if (e.keyCode === 39) moveRight();
        else if (e.keyCode === 38) rotate();
        else if (e.keyCode === 40) moveDown();
    });

    // Lancer le premier Tetromino
    startNewTetromino();

    // Déplacement automatique
    setInterval(moveDown, 1000);
});
