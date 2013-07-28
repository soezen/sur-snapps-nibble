var SnakeStatus = {
    RUNNING: 'R',
    PAUSED: 'P',
    ENDED: 'E',
    NEW: 'N'};
var Direction = {
    RIGHT: 'R',
    DOWN: 'D',
    LEFT: 'L',
    UP: 'U'};

// TODO SUR make these objects which also contain other data (chance, ...)
var bonusTypes = ['speedup', 'speeddown', 'snakeadd', 'nothing'];
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

function loadGame(menuItem) {
    var gameSelect = document.getElementById("games");
    var currentGame = gameSelect.options[gameSelect.selectedIndex].value;
    gameSession.setCurrentGame(currentGame);
    openPage(menuItem);
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
    blocks['7x10'] = createNewBlock(types[randomType], { x: 10, y: 7 });

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

function createNewBlock(type, location) {
    return {
        type: type,
        location: location
    };
}

function createNewGame(stage, user, inSpeed) {
    var bonusLayer = new Kinetic.Layer({});
    var updateLayers = [];
    var game = {
        blocks: {},
        rows: 0,
        columns: 0,
        minBlocks: 0
    };
    var init = 2;
    var length = 8;
    var strokeWidth = 1;
    var totalLength = length + (2 * strokeWidth);

    function getCoordinates(location) {
        return {
            x: init + (location.x * totalLength),
            y: init + (location.y * totalLength)
        };
    }

    function createSnake() {
        var snakeLayer = new Kinetic.Layer({});
        stage.add(snakeLayer);
        updateLayers.push(snakeLayer);
        var snakeGroup = new Kinetic.Group({});
        snakeLayer.add(snakeGroup);

        function createSnakeBlock(newLocation, fillColor) {
            function nextLocation(dir, factor) {
                var newLocation = { x: location.x, y: location.y };
                if (dir == Direction.RIGHT) {
                    newLocation.x += factor;
                } else if (dir == Direction.DOWN) {
                    newLocation.y += factor;
                } else if (dir == Direction.LEFT) {
                    newLocation.x -= factor;
                } else if (dir == Direction.UP) {
                    newLocation.y -= factor;
                }

                if (newLocation.x < 0) {
                    newLocation.x = game.columns - 1;
                } else if (newLocation.x > game.columns - 1) {
                    newLocation.x = 0;
                }
                if (newLocation.y < 0) {
                    newLocation.y = game.rows - 1;
                } else if (newLocation.y > game.rows - 1) {
                    newLocation.y = 0;
                }
                return newLocation;
            }

            if (isUndefined(fillColor)) {
                fillColor = '#8ED6FF';
            }

            var next = false;
            var location = newLocation;
            var blockDirection = false;
            var rect = new Kinetic.Rect({
                x: getCoordinates(location).x,
                y: getCoordinates(location).y,
                width: length,
                height: length,
                fill: fillColor,
                stroke: 'black',
                strokeWidth: strokeWidth });
            snakeGroup.add(rect);

            return {
                destroy: function () {
                    if (next) {
                        next.destroy();
                    }
                    rect.destroy();
                },
                move: function (self, dir, others) {
                    var newLocation = nextLocation(dir, 1);

                    if (containsLocation(others, newLocation)) {
                        // snake ran into itself
                        return false;
                    }

                    if (outGame.onLocation(newLocation)) {
                        location = newLocation;
                        rect.setX(getCoordinates(location).x);
                        rect.setY(getCoordinates(location).y);

                        if (next) {
                            others.push(location);
                            snake.blocks = others;
                            if (!next.move(next, blockDirection, others)) {
                                return false;
                            }
                        }
                        blockDirection = dir;
                        return true;
                    }
                    return false;
                },
                addBlock: function (block) {
                    if (!next) {
                        next = createSnakeBlock(nextLocation(blockDirection, -1));
                    } else {
                        next.addBlock(block);
                    }
                }
            };
        }

        // TODO SUR allow user to specify speed (if game allows it)
        // TODO SUR show game config in leaderboard

        var stepCount = 0;
        var speed = inSpeed;
        var head = createSnakeBlock({ x: 1, y: 1 });
        var snake = {
            blocks: [],
            direction: Direction.RIGHT,
            changedDirection: false,
            head: head,
            move: function () {
                if (stepCount == 0) {
                    if (this.changedDirection) {
                        this.direction = this.changedDirection;
                        this.changedDirection = false;
                    }
                    stepCount = speed;
                    return this.head.move(head, this.direction, []);
                } else {
                    stepCount--;
                    return true;
                }
            },
            addBlock: function (block) {
                head.addBlock(block);
            },
            speedUp: function () {
                speed--;
            },
            speedDown: function () {
                speed++;
            }
        };

        snakeLayer.draw();
        return snake;
    }

    function containsLocation(array, element) {
        for (var i = 0; i < array.length; i++) {
            if (array[i].x == element.x
                && array[i].y == element.y) {
                return true;
            }
        }
        return false;
    }

    function isLocationFree(location) {
        return !objectHasKey(game.blocks, location.y + 'x' + location.x)
            && !containsLocation(snake.blocks, location);
    }

    function getRandomFreeLocation() {
        var location = {};
        do {
            location.x = Math.floor(Math.random() * game.columns);
            location.y = Math.floor(Math.random() * game.rows);
        } while (!isLocationFree(location));
        return location;
    }

    function placeNextBlock(block) {
        var newLocation = getRandomFreeLocation();
        var newType = block.type;
        if (block.type.next == 'random') {
            newType = types[block.type.nextTypes[Math.floor(Math.random() * block.type.nextTypes.length)]];
        }
        game.blocks[newLocation.y + 'x' + newLocation.x] = createNewBlock(newType, newLocation);
    }

    function removeBlock(location) {
        var block = game.blocks[location.y + 'x' + location.x];
        block.rect.destroy();
        delete game.blocks[location.y + 'x' + location.x];
    }

    function updateScore(block) {
        outGame.score += block.type.score;
        document.getElementById("score").value = outGame.score;
    }

    function processBonus(block) {
        var bonusses = block.type.bonus;
        for (var key in bonusses) {
            if (bonusses.hasOwnProperty(key)) {
                var bonus = bonusses[key];
                if (bonus == 'snakeadd') {
                    snake.addBlock(block);
                }
                if (bonus == 'speedup') {
                    snake.speedUp();
                }
                if (bonus == 'speeddown') {
                    snake.speedDown();
                }
            }
        }
    }

    function createNewBlock(type, location) {
        var block = {
            location: location,
            type: type
        };
        block.rect = new Kinetic.Rect({
            x: getCoordinates(location).x,
            y: getCoordinates(location).y,
            width: length,
            height: length,
            fill: block.type.color,
            stroke: 'black',
            strokeWidth: strokeWidth
        });
        bonusLayer.add(block.rect);
        return block;
    }

    function setGame(inGame) {
        game = inGame;
        stage.setWidth((inGame.columns * totalLength) + (2 * init));
        stage.setHeight((inGame.rows * totalLength) + (2 * init));
    }

    var snake = createSnake();
    var status = SnakeStatus.NEW;

    var snakeMove = new Kinetic.Animation(function () {

        function endGame() {
            snake.head.destroy();
            status = SnakeStatus.ENDED;
            snakeMove.stop();
            gameStorage.addGameScore({
                time: getTime(),
                user: outGame.user,
                game: game.id,
                speed: outGame.config.speed,
                score: outGame.score
            });
            console.log('game over');
        }

        if (!snake.move()) {
            endGame();
        }
    }, updateLayers);

    var outGame = {
        user: user,
        score: 0,
        snake: snake,
        status: status,
        config: {
            speed: inSpeed
        },
        start: function (e) {
            var keyCode = e.keyCode;

            if ((keyCode == 37 || keyCode == 100 || keyCode == 81)
                && snake.direction != Direction.RIGHT) {
                snake.changedDirection = Direction.LEFT;
            } else if ((keyCode == 38 || keyCode == 104 || keyCode == 90)
                && snake.direction != Direction.DOWN) {
                snake.changedDirection = Direction.UP;
            } else if ((keyCode == 39 || keyCode == 102 || keyCode == 68)
                && snake.direction != Direction.LEFT) {
                snake.changedDirection = Direction.RIGHT;
            } else if ((keyCode == 40 || keyCode == 101 || keyCode == 83)
                && snake.direction != Direction.UP) {
                snake.changedDirection = Direction.DOWN;
            } else if (keyCode == 32) {
                if (status == SnakeStatus.RUNNING) {
                    status = SnakeStatus.PAUSED;
                    snakeMove.stop();
                } else if (status == SnakeStatus.ENDED) {
                    document.getElementById("container").innerHTML = "";
                    document.getElementById("config").style.display = "block";
                    document.removeEventListener('keydown', game.start);
                } else if (status == SnakeStatus.PAUSED) {
                    status = SnakeStatus.RUNNING;
                    snakeMove.start();
                } else if (status == SnakeStatus.NEW) {
                    status = SnakeStatus.RUNNING;
                    snakeMove.start();
                }
            }
        },
        onLocation: function (location) {
            var block = game.blocks[location.y + 'x' + location.x];
            if (isUndefined(block)) {
                return true;
            }
            if (block.type.gameOver) {
                return false;
            }
            removeBlock(block.location);
            updateScore(block);
            processBonus(block);

            for (var i = 0; i < block.type.nextAmount; i++) {
                placeNextBlock(block);
            }

            if (block.type.nextAmount == 'min') {
                while (Object.keys(game.blocks).length <= game.minBlocks) {
                    placeNextBlock(block);
                }
            }

            return true;
        },
        loadGame: function (inGame) {
            setGame(inGame);
            bonusLayer = new Kinetic.Layer({});
            updateLayers.push(bonusLayer);

            stage.add(bonusLayer);

            for (var key in game.blocks) {
                if (game.blocks.hasOwnProperty(key)) {
                    var block = game.blocks[key];
                    var newBlock = createNewBlock(block.type, block.location);
                    if (isNaN(newBlock.type.nextAmount)) {
                        game.minBlocks++;
                    }
                    game.blocks[key] = newBlock;
                }
            }

            bonusLayer.draw();
        }
    };
    document.addEventListener('keydown', outGame.start);
    return outGame;
}

function getBlockLayer(name) {
    var games = gameStorage.getGames();
    var game = games[name];

    if (isUndefined(game)) {
        console.log('game not found: ' + name);
        return false;
    }

    return game;
}