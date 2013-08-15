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

var types = {
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
