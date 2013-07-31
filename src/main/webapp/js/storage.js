function GameStorage() {
    if (arguments.callee._singletonInstance) {
        return arguments.callee._singletonInstance;
    }
    arguments.callee._singletonInstance = this;

    this.getGames = function () {
        var storage = getStorage();
        var games = {};
        if (isUndefined(storage)) {
            return games;
        }

        if (!isUndefined(storage.games)) {
            games = storage.games;
        } else {
            storage.games = games;
            saveStorage(storage);
        }
        return games;
    };
    this.addGame = function (game) {
        var storage = getStorage();
        storage.games[game.id] = game;
        saveStorage(storage);
    };
    this.getUsers = function () {
        var storage = getStorage();
        var users = [];
        if (isUndefined(storage)) {
            return users;
        }

        if (!isUndefined(storage.users)) {
            users = storage.users;
        } else {
            storage.users = users;
            saveStorage(storage);
        }
        return users;
    };
    this.addUser = function (user) {
        var storage = getStorage();
        var users = this.getUsers();
        users.push(user);
        storage.users = users;
        saveStorage(storage);
    };
    this.removeUser = function (user) {
        var storage = getStorage();
        var users = this.getUsers();
        var index = users.indexOf(user);
        users.splice(index, 1);
        storage.users = users;
        saveStorage(storage);

        this.clearScores(user);
    };
    this.getScores = function () {
        var storage = getStorage();
        var scores = [];
        if (isUndefined(storage)) {
            return scores;
        }

        if (!isUndefined(storage.scores)) {
            scores = storage.scores;
        } else {
            storage.scores = scores;
            saveStorage(storage);
        }
        return scores;
    };
    this.addGameScore = function (score) {
        var storage = getStorage();
        var scores = this.getScores();
        scores.push(score);
        storage.scores = scores;

        var highScore = this.getHighScore();
        if (score.score > highScore) {
            storage.highScore = score.score;
        }
        saveStorage(storage);
    };
    this.getHighScore = function () {
        var storage = getStorage();
        var highScore = 0;
        if (isUndefined(storage.highScore)) {
            storage.highScore = highScore;
            saveStorage(storage);
        } else {
            highScore = storage.highScore;
        }
        return highScore;
    };
    this.clearScores = function (user) {
        var storage = getStorage();
        if (isUndefined(user)) {
            storage.scores = [];
        } else {
            var newScores = [];
            for (var i = 0; i < storage.scores.length; i++) {
                if (storage.scores[i].user != user) {
                    newScores.push(storage.scores[i]);
                }
            }
            storage.scores = newScores;
        }
        saveStorage(storage);
    };

    function getStorage() {
        if (isUndefined(localStorage.snakeGame)) {
            saveStorage({});
        }
        return JSON.parse(localStorage.snakeGame);
    }

    function saveStorage(snakeGame) {
        localStorage.snakeGame = JSON.stringify(snakeGame);
    }

    return arguments.callee._singletonInstance;
}

function SessionStorage() {
    if (arguments.callee._singletonInstance) {
        return arguments.callee._singletonInstance;
    }
    arguments.callee._singletonInstance = this;

    this.loginUser = function (user) {
        var storage = getStorage();
        storage.currentUser = user;
        saveStorage(storage);
    };
    this.getCurrentUser = function () {
        var storage = getStorage();
        return storage.currentUser;
    };
    this.getCurrentPage = function () {
        var storage = getStorage();
        return storage.currentPage;
    };
    this.setCurrentPage = function (page) {
        var storage = getStorage();
        storage.currentPage = page;
        saveStorage(storage);
    };
    this.getCurrentGame = function () {
        return getStorage().currentGame;
    };
    this.setCurrentGame = function (game) {
        var storage = getStorage();
        storage.currentGame = game;
        saveStorage(storage);
    }

    function getStorage() {
        if (isUndefined(sessionStorage.snakeGame)) {
            saveStorage({});
        }
        return JSON.parse(sessionStorage.snakeGame);
    }

    function saveStorage(session) {
        sessionStorage.snakeGame = JSON.stringify(session);
    }

    return arguments.callee._singletonInstance;
}