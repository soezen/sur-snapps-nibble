// TODO SUR remove this?
function loadGame(menuItem) {
    var gameSelect = document.getElementById("games");
    var currentGame = gameSelect.options[gameSelect.selectedIndex].value;
    gameSession.setCurrentGame(currentGame);
    openPage(menuItem);
}

function updateGameDetails() {
    var gameSelect = document.getElementById("games");
    var currentGame = gameSelect.options[gameSelect.selectedIndex].value;
    var game = gameStorage.getGames()[currentGame];
    document.getElementById("dimensions").value = game.rows + 'x' + game.columns;
}

function createNewGame(stage, user, inSpeed) {
    var bonusLayer = new Kinetic.Layer({});
    var snakeLayer = new Kinetic.Layer({});
    stage.add(snakeLayer);
    var updateLayers = [ snakeLayer, bonusLayer ];
    var currentLevel = 0;
    var game = {
        levels: [],
        rows: 0,
        columns: 0,
        minBlocks: 0
    };

    function getLevel(lvl) {
        return game.levels[lvl];
    }

    function isLastLevel() {
        return currentLevel == game.levels.length - 1;
    }

    function createSnake() {
        snakeLayer.destroyChildren();
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
                x: getCoordinates(init, totalLength, location).x,
                y: getCoordinates(init, totalLength, location).y,
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
                    return true;
                },
                move: function (self, dir, others) {
                    var newLocation = nextLocation(dir, 1);

                    if (containsLocation(others, newLocation)) {
                        // snake ran into itself
                        return false;
                    }

                    if (outGame.onLocation(newLocation)) {
                        location = newLocation;
                        //noinspection JSUnresolvedFunction
                        rect.setX(getCoordinates(init, totalLength, location).x);
                        //noinspection JSUnresolvedFunction
                        rect.setY(getCoordinates(init, totalLength, location).y);

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
                },
                removeBlock: function (isHead) {
                    if (!next) {
                        if (!isHead) {
                            return this.destroy();
                        }
                    } else {
                        if (next.removeBlock(false)) {
                            next = false;
                        }
                    }
                    return false;
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
            removeBlock: function () {
                head.removeBlock(true)
            },
            speedUp: function () {
                if (speed > 0) {
                    speed--;
                }
            },
            speedDown: function () {
                if (speed < 11) {
                    speed++;
                }
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
        return !objectHasKey(getLevel(currentLevel).blocks, location.y + 'x' + location.x)
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

    function getNextBonusType(block) {
        var random = Math.floor(Math.random() * 100);
        var max = 0;
        for (var i = 0; i < block.type.nextTypes.length; i++) {
            var nextType = block.type.nextTypes[i];
            max += (nextType.chance * 100);
            if (random <= max) {
                return nextType.name;
            }
        }
        return block.type.nextTypes[0].name;
    }

    function placeNextBlock(block) {
        var newLocation = getRandomFreeLocation();
        var newType = block.type;
        if (block.type.next == 'random') {
            newType = types[getNextBonusType(block)];
        }
        getLevel(currentLevel).blocks[newLocation.y + 'x' + newLocation.x] = createNewBlock(newType, newLocation);
    }

    function removeBlock(location) {
        var block = getLevel(currentLevel).blocks[location.y + 'x' + location.x];
        block.rect.destroy();
        delete getLevel(currentLevel).blocks[location.y + 'x' + location.x];
    }

    function updateScore(block) {
        outGame.stats.score += block.type.score;
    }

    function updateBlocks() {
        outGame.stats.blocks++;
    }

    function updateStats() {
        document.getElementById("blocks").value = outGame.stats.blocks;
        document.getElementById("score").value = outGame.stats.score;
    }

    function processBonus(block) {
        var bonusses = block.type.bonus;
        for (var key in bonusses) {
            if (bonusses.hasOwnProperty(key)) {
                var bonus = bonusses[key];
                if (bonus == 'snakeadd') {
                    snake.addBlock(block);
                }
                if (bonus == 'snakeremove') {
                    snake.removeBlock();
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
            x: getCoordinates(init, totalLength, location).x,
            y: getCoordinates(init, totalLength, location).y,
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
        stage.setWidth(getCanvasWidth(game.columns));
        stage.setHeight(getCanvasHeight(game.rows));
    }

    function placeMinBlocks(level, block) {

        while (Object.keys(level.blocks).length <= level.minBlocks) {
            placeNextBlock(block);
        }
    }

    function loadLevel(lvl) {
        bonusLayer.destroyChildren();
        var level = getLevel(lvl);

        for (var key in level.blocks) {
            if (level.blocks.hasOwnProperty(key)) {
                var block = level.blocks[key];

                var newBlock = createNewBlock(block.type, block.location);
                if (isNaN(newBlock.type.nextAmount)) {
                    level.minBlocks++;
                }
                level.blocks[key] = newBlock;
            }
        }

        placeMinBlocks(level, {
            type: {
                next: 'random',
                nextTypes: bonusTypes
            }
        });
        console.log('level loaded');
    }

    function isGoalReached() {
        var goal = getLevel(currentLevel).goal;
        var reached = false;

        if (goal.type == 'points') {
            return outGame.stats.score >= goal.amount;
        } else if (goal.type == 'blocks') {
            return outGame.stats.blocks >= goal.amount;
        } else if (goal.type == 'time') {
            // TODO SUR implement and also show on screen
        }

        return reached;
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
                game: game.label,
                speed: outGame.config.speed,
                score: outGame.stats.score
            });
            console.log('game over');
        }

        if (!snake.move()) {
            endGame();
        }
    }, updateLayers);

    var outGame = {
        user: user,
        stats: {
            score: 0,
            blocks: 0
        },
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
            var block = getLevel(currentLevel).blocks[location.y + 'x' + location.x];
            if (isUndefined(block)) {
                return true;
            }
            if (block.type.gameOver) {
                return false;
            }
            updateBlocks();
            removeBlock(block.location);
            updateScore(block);
            processBonus(block);
            updateStats();
            if (isGoalReached()) {
                console.log('level completed');
                this.status = SnakeStatus.PAUSED;
                outGame.stats.blocks = 0;
                snakeMove.stop();
                if (!isLastLevel()) {
                    currentLevel++;
                    loadLevel(currentLevel);
                    snake = createSnake();
                    snakeLayer.draw();
                }
            }

            for (var i = 0; i < block.type.nextAmount; i++) {
                placeNextBlock(block);
            }

            if (block.type.nextAmount == 'min') {
                placeMinBlocks(getLevel(currentLevel), block);
            }
            return true;
        },
        loadGame: function (inGame) {
            setGame(inGame);
            bonusLayer = new Kinetic.Layer({});
            updateLayers.push(bonusLayer);

            stage.add(bonusLayer);
            loadLevel(currentLevel);
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