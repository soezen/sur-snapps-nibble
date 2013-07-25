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


function loadGame(menuItem) {
    var gameSelect = document.getElementById("games");
    var currentGame = gameSelect.options[gameSelect.selectedIndex].value;
    gameSession.setCurrentGame(currentGame);
    openPage(menuItem);
}

// TODO SUR remove this
function createTestGame(rows, columns) {
    var fillColor = '#000000';
    var blocks = {};

    for (var row = 0; row < rows; row++) {
        blocks[row + 'x' + 0] = createNewBlock(fillColor, { x: 0, y: row });
        blocks[row + 'x' + (columns - 1)] = createNewBlock(fillColor, { x: columns - 1, y: row });
    }
    for (var col = 1; col < columns - 1; col++) {
        blocks[0 + 'x' + col] = createNewBlock(fillColor, { x: col, y: 0 });
        blocks[(rows - 1) + 'x' + col] = createNewBlock(fillColor, { x: col, y: rows - 1 });
    }

    for (var key in blocks) {
        if (blocks.hasOwnProperty(key)) {
            var block = blocks[key];
            block.config = {
                gameOver: true
            }
        }
    }

    var colors = ['yellow', 'lightgreen', 'red', 'orange'];
    var randomColor = colors[Math.floor(Math.random() * colors.length)];
    blocks['7x10'] = createNewBlock(randomColor, { x: 10, y: 7 });
    blocks['7x10'].config = {
        gameOver: false,
        nextBlock: 'random',
        nextColor: 'random',
        nextAmount: 1,
        score: 5,
        bonus: ['snake'],
        colors: colors
    };
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
        columns: 20
    };
    storage.games = games;
    localStorage.snakeGame = JSON.stringify(storage);
}

function createNewBlock(fillColor, location) {
    return {
        location: location,
        color: fillColor
    }
}

function createNewGame(stage, user, speed) {
    var updateLayers = [];
    var game = {
        blocks: {},
        rows: 0,
        columns: 0
    };
    var init = 2;
    var length = 8;
    var strokeWidth = 1;
    var totalLength = length + (2 * strokeWidth);

    function getCoordinates(row, column) {
        return {
            x: init + (column * totalLength),
            y: init + (row * totalLength)
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

            var next = false;
            var location = newLocation;
            var blockDirection = false;
            var rect = new Kinetic.Rect({
                x: getCoordinates(location.y, location.x).x,
                y: getCoordinates(location.y, location.x).y,
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
                        rect.setX(getCoordinates(location.y, location.x).x);
                        rect.setY(getCoordinates(location.y, location.x).y);

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
                        next = createSnakeBlock(nextLocation(blockDirection, -1), block.color);
                    } else {
                        next.addBlock(block);
                    }
                }
            };
        }

        // TODO SUR allow user to specify speed (if game allows it)
        // TODO SUR show game config in leaderboard

        var stepCount = 0;
        var head = createSnakeBlock({ x: 1, y: 1 }, '#8ED6FF');
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
        if (block.config.nextBlock == 'random') {
            delete game.blocks[block.location.y + 'x' + block.location.x];
            var newLocation = getRandomFreeLocation();
            block.location = newLocation;
            game.blocks[newLocation.y + 'x' + newLocation.x] = block;
            if (!isUndefined(block.rect)) {
                block.rect.setX(getCoordinates(block.location.y, block.location.x).x);
                block.rect.setY(getCoordinates(block.location.y, block.location.x).y);
            }
        }
    }

    function colorNextBlock(block) {
        if (block.config.nextBlock == 'random') {
            var colors = block.config.colors;
            block.color = colors[Math.floor(Math.random() * colors.length)];
            block.rect.setFill(block.color);
        }
    }

    function updateScore(block) {
        outGame.score += block.config.score;
        document.getElementById("score").value = outGame.score;
    }

    function processBonus(block) {
        var bonusses = block.config.bonus;
        for (var key in bonusses) {
            if (bonusses.hasOwnProperty(key)) {
                var bonus = bonusses[key];
                if (bonus == 'snake') {
                    addSnakeBonus(block);
                }
            }
        }
    }

    function setGame(inGame) {
        game = inGame;
        stage.setWidth((inGame.columns * totalLength) + (2 * init));
        stage.setHeight((inGame.rows * totalLength) + (2 * init));
    }

    function addSnakeBonus(block) {
        snake.addBlock(block);
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
            speed: speed
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
            if (block.config.gameOver) {
                return false;
            }
            updateScore(block);
            processBonus(block);
            placeNextBlock(block);
            colorNextBlock(block);

            return true;
        },
        loadGame: function (inGame) {
            setGame(inGame);
            var kineticLayer = new Kinetic.Layer({});
            updateLayers.push(kineticLayer);

            stage.add(kineticLayer);

            for (var key in game.blocks) {
                if (game.blocks.hasOwnProperty(key)) {
                    var block = game.blocks[key];
                    var location = block.location;
                    block.rect = new Kinetic.Rect({
                        x: getCoordinates(location.y, location.x).x,
                        y: getCoordinates(location.y, location.x).y,
                        width: length,
                        height: length,
                        fill: block.color,
                        stroke: 'black',
                        strokeWidth: strokeWidth
                    });
                    kineticLayer.add(block.rect);
                }
            }

            kineticLayer.draw();
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