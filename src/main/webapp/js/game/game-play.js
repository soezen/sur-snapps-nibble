var currentGame;
var currentLevel = 0;

function getCurrentLevel() {
    return currentGame.levels[currentLevel];
}

function isLastLevel() {
    return currentLevel == currentGame.levels.length - 1;
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

function loadLevel(stage, level) {
    var snakeLayer = null;
    var bonusLayer = null;
    var updateLayers = [];

    function loadStage() {
        stage.destroyChildren();

        var layer = new Kinetic.Layer({});
        layer.add(new Kinetic.Rect({ x: 0, y: 0, height: stage.getHeight(), width: stage.getWidth(), fill: 'darkgray'}));
        stage.add(layer);

        bonusLayer = new Kinetic.Layer({});
        snakeLayer = new Kinetic.Layer({});
        stage.add(snakeLayer);
        stage.add(bonusLayer);
        updateLayers = [ snakeLayer, bonusLayer ];
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
                    newLocation.x = currentGame.columns - 1;
                } else if (newLocation.x > currentGame.columns - 1) {
                    newLocation.x = 0;
                }
                if (newLocation.y < 0) {
                    newLocation.y = currentGame.rows - 1;
                } else if (newLocation.y > currentGame.rows - 1) {
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
                    return true;
                },
                move: function (self, dir, others) {
                    var newLocation = nextLocation(dir, 1);

                    if (containsLocation(others, newLocation)) {
                        // snake ran into itself
                        return false;
                    }

                    if (game.onLocation(newLocation)) {
                        location = newLocation;
                        //noinspection JSUnresolvedFunction
                        rect.setX(getCoordinates(location).x);
                        //noinspection JSUnresolvedFunction
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
        var speed = 10; // TODO SUR change this
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

    function isLocationFree(location) {
        return !objectHasKey(level.blocks, location.y + 'x' + location.x)
            && !containsLocation(snake.blocks, location);
    }

    function getRandomFreeLocation() {
        var location = {};
        do {
            location.x = Math.floor(Math.random() * currentGame.columns);
            location.y = Math.floor(Math.random() * currentGame.rows);
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
                return nextType;
            }
        }
        return block.type.nextTypes[0];
    }

    function placeNextBlock(block) {
        if (Object.keys(level.blocks).length < level.maxBlocks) {
            var newLocation = getRandomFreeLocation();
            var newType = block.type;
            if (block.type.next == 'random') {
                newType = getNextBonusType(block);
            }
            level.blocks[newLocation.y + 'x' + newLocation.x] = createNewBlock(newType, newLocation);
        }
    }

    function removeBlock(location) {
        var block = level.blocks[location.y + 'x' + location.x];
        block.rect.destroy();
        delete level.blocks[location.y + 'x' + location.x];
    }

    function updateScore(block) {
        currentGame.stats.score += block.type.points;
    }

    function updateBlocks() {
        currentGame.stats.blocks++;
    }

    function updateStats() {
        $("#blocks").val(currentGame.stats.blocks);
        $("#score").val(currentGame.stats.score);
        $("#goal").val(getCurrentLevel().goal.amount + ' ' + getCurrentLevel().goal.type);
    }

// TODO SUR fix random generation of bonus blocks
    function processBonus(block) {
        var bonusses = block.type.bonus;
        for (var key in bonusses) {
            if (bonusses.hasOwnProperty(key)) {
                var bonus = bonusses[key];
                if (bonus == 'snakeadd') {
                    if (Object.keys(snake.blocks).length < level.maxBlocks) {
                        snake.addBlock(block);
                    }
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

    function placeMinBlocks(block) {
        while (Object.keys(level.blocks).length <= level.minBlocks) {
            placeNextBlock(block);
        }
    }

    function load() {
        bonusLayer.destroyChildren();
        var walls = 0;
        for (var key in level.blocks) {
            if (level.blocks.hasOwnProperty(key)) {
                var block = level.blocks[key];

                var newBlock = createNewBlock(block.type, block.location);
                if (isNaN(newBlock.type.nextAmount)) {
                    walls++;
                }
                level.blocks[key] = newBlock;
            }
        }
        level.minBlocks += walls;
        level.maxBlocks = ((currentGame.rows * currentGame.columns) - walls) / 2;

        placeMinBlocks({
            type: {
                next: 'random',
                nextTypes: level.bonusTypes
            }
        });

        if (getCurrentLevel().goal.type == 'seconds') {
            timer.setLimit(getCurrentLevel().goal.amount);
        }

        updateStats();
        console.log('level loaded');
    }

// TODO SUR add forum so you can have feedback from users
    // TODO SUR create interface to assign bonuses to blocks

    function isGoalReached() {
        var goal = level.goal;
        var reached = false;

        if (goal.type == 'points') {
            reached = currentGame.stats.score >= goal.amount;
        } else if (goal.type == 'blocks') {
            reached = currentGame.stats.blocks >= goal.amount;
        } else if (goal.type == 'seconds') {
            reached = timer.current() >= goal.amount;
        }

        if (reached) {
            console.log('level completed');
            this.status = SnakeStatus.END_LEVEL;
            currentGame.stats.blocks = 0;
            snakeMove.stop();
            if (!isLastLevel()) {
                currentLevel++;
                document.removeEventListener('keydown', game.start);
                loadLevel(stage, getCurrentLevel());
                $("#status").val("LEVEL COMPLETE");
            }
        }
    }

    loadStage();
    var snake = createSnake();
    var status = SnakeStatus.NEW;
    var timer = new Timer(document.getElementById('seconds'), function () {
        isGoalReached();
    });
    var snakeMove = new Kinetic.Animation(function () {

        function endGame() {
            snake.head.destroy();
            status = SnakeStatus.END_GAME;
            snakeMove.stop();
            gameStorage.addGameScore({
                time: getTime(),
                duration: timer.current(),
                user: gameSession.getCurrentUser(),
                game: currentGame.label,
                score: currentGame.stats.score
            });
            console.log('game over');
            timer.stop();
            $("#status").val("GAME OVER");
        }

        if (!snake.move()) {
            endGame();
        }
    }, updateLayers);
// TODO SUR add bonus types: add or remove time
    var game = {
        status: status,
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
                    timer.pause();
                    status = SnakeStatus.PAUSED;
                    snakeMove.stop();
                    $("#status").val("PAUSED");
                } else if (status == SnakeStatus.END_GAME) {
                    $("#status").val("GAME OVER");
                    timer.stop();
                    document.removeEventListener('keydown', game.start);
                } else if (status == SnakeStatus.PAUSED) {
                    $("#status").val("PLAYING");
                    timer.start();
                    status = SnakeStatus.RUNNING;
                    snakeMove.start();
                } else if (status == SnakeStatus.NEW) {
                    $("#status").val("PLAYING");
                    timer.start();
                    status = SnakeStatus.RUNNING;
                    snakeMove.start();
                }
            }
        },
        onLocation: function (location) {
            var block = level.blocks[location.y + 'x' + location.x];
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
            isGoalReached();

            for (var i = 0; i < block.type.next.amount; i++) {
                placeNextBlock(block);
            }

            if (block.type.next.amount == 'min') {
                placeMinBlocks(block);
            }
            return true;
        }
    };
    document.addEventListener('keydown', game.start);
    load();
    bonusLayer.draw();
    return game;
}

function getBlockLayer(name) {
    var games = gameStorage.getGames();
    var game = games[name];
    game.stats = {
        score: 0,
        blocks: 0
    };

    if (isUndefined(game)) {
        console.log('game not found: ' + name);
        return false;
    }

    return game;
}