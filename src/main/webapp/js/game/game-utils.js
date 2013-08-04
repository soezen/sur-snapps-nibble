var init = 2;
var length = 8;
var strokeWidth = 1;
var totalLength = length + (2 * strokeWidth);

var SnakeStatus = {
    RUNNING: 'RUNNING',
    PAUSED: 'PAUSED',
    END_LEVEL: 'END_LEVEL',
    END_GAME: 'END_GAME',
    NEW: 'NEW'};
var Direction = {
    RIGHT: 'RIGHT',
    DOWN: 'DOWN',
    LEFT: 'LEFT',
    UP: 'UP'};

// TODO SUR maxBlocks on field
var bonusTypes = [
    { name: 'speedup', chance: 0.5},
    { name: 'speeddown', chance: 0.05 },
    { name: 'snakeadd', chance: 0.4 },
    { name: 'snakeremove', chance: 0.02 },
    { name: 'nothing', chance: 0.3 }
];
var types = {
    speedup: {
        score: 5,
        gameOver: false,
        color: 'red',
        bonus: ['speedup'],
        next: ['random'],
        nextAmount: 1,
        nextTypes: bonusTypes
    },
    speeddown: {
        score: 1,
        gameOver: false,
        color: 'yellow',
        bonus: ['snakeadd', 'speeddown'],
        next: ['random'],
        nextAmount: 1,
        nextTypes: bonusTypes
    },
    snakeadd: {
        score: 3,
        gameOver: false,
        color: 'lightgreen',
        bonus: ['snakeadd'],
        next: ['random'],
        nextAmount: 2,
        nextTypes: bonusTypes
    },
    snakeremove: {
        score: 10,
        gameOver: false,
        color: 'blue',
        bonus: ['snakeremove'],
        next: ['random'],
        nextAmount: 3,
        nextTypes: bonusTypes
    },
    nothing: {
        score: 1,
        gameOver: false,
        color: 'orange',
        next: ['random'],
        nextAmount: 'min',
        nextTypes: bonusTypes
    },
    wall: {
        gameOver: true,
        color: 'black'
    }
};

function getCanvasWidth(columns) {
    return (columns * totalLength) + (init);
}

function getCanvasHeight(rows) {
    return (rows * totalLength) + (init);
}

function getCoordinates(location) {
    return {
        x: init + (location.x * totalLength),
        y: init + (location.y * totalLength)
    }
}
