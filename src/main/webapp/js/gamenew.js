function createGame(form) {
    var name = form.find("input#name").val();
    var rows = form.find("input#rows").val();
    var columns = form.find("input#columns").val();
    gameStorage.addGame({
        id: name,
        label: name,
        rows: rows,
        columns: columns,
        blocks: [], // TODO SUR get from gui
        minBlocks: 1 // TODO SUR onload game make sure minBlocks is applied
    });
    openPage({
        dataset: {
            page: 'gameoverview'
        }
    });
    // TODO SUR default select the newly created game
}

function validateGameName($el, value, callback) {
    var valid = true;
    var message = '';
    if (nullOrEmpty(value)) {
        valid = false;
        message = 'Incorrect length [3-50]'
    } else if (gameNameNotUnique(value)) {
        valid = false;
        message = 'Name has already been used'
    }
    callback({
        value: value,
        valid: valid,
        message: message
    });
}

function gameNameNotUnique(name) {
    var games = gameStorage.getGames();
    return objectHasKey(games, name);
}

var fieldStage = new Kinetic.Stage({
    container: 'gamefield'
})

function updateGameField() {
    var rows = Number(document.getElementById("rows").value);
    var columns = Number(document.getElementById("columns").value);

    fieldStage.destroyChildren();
    var bottomLayer = new Kinetic.Layer({});
    var topLayer = new Kinetic.Layer({});
    fieldStage.add(bottomLayer);
    fieldStage.add(topLayer);
    var init = 2;
    var length = 8;
    var strokeWidth = 1;
    var totalLength = length + (2 * strokeWidth);
    fieldStage.setWidth((init * 2) + (columns * totalLength));
    fieldStage.setHeight((init * 2) + (rows * totalLength));

    for (var row = 0; row < rows; row++) {
        for (var column = 0; column < columns; column++) {
            var rect = new Kinetic.Rect({
                x: getCoordinates(init, totalLength, { y: row, x: column }).x,
                y: getCoordinates(init, totalLength, { y: row, x: column }).y,
                width: length,
                height: length,
                fill: 'white',
                stroke: 'black',
                strokeWidth: strokeWidth
            });
            // TODO SUR allow drag
            rect.on('click', function (evt) {
                this.setFill('black');
                // TODO SUR toggle
                // TODO SUR add or remove in blocks array
                bottomLayer.draw();
            });
            bottomLayer.add(rect);
        }
    }
    bottomLayer.draw();
    topLayer.draw();
}

// TODO SUR remove this
function createTestGame(rows, columns) {
    var blocks = {};

    for (var row = 0; row < rows; row++) {
        blocks[row + 'x' + 0] = createNewBlock(types.wall, { x: 0, y: row });
        blocks[row + 'x' + (columns - 1)] = createNewBlock(types.wall, { x: columns - 1, y: row });
    }
    for (var col = 1; col < columns - 1; col++) {
        blocks[0 + 'x' + col] = createNewBlock(types.wall, { x: col, y: 0 });
        blocks[(rows - 1) + 'x' + col] = createNewBlock(types.wall, { x: col, y: rows - 1 });
    }

    var randomType = bonusTypes[Math.floor(Math.random() * bonusTypes.length)];
    blocks['7x10'] = createNewBlock(types[randomType.name], { x: 10, y: 7 });

    var storage = JSON.parse(localStorage.snakeGame);
    var games = storage.games;
    if (isUndefined(games)) {
        games = {};
    }
    // TODO SUR when creating game by gui, id and label are determined by gui, use id as key of object
    games.test = {
        id: 'test',
        label: 'test',
        blocks: blocks,
        rows: 20,
        columns: 20,
        minBlocks: 0
    };
    storage.games = games;
    localStorage.snakeGame = JSON.stringify(storage);
}
