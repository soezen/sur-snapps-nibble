function GameStorage() {
    if (arguments.callee._singletonInstance) {
        return arguments.callee._singletonInstance;
    }
    arguments.callee._singletonInstance = this;

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
    };
    this.getHighscore = function () {
        var storage = getStorage();
        var highscore = 0;
        if (isUndefined(storage.highscore)) {
            storage.highscore = highscore;
            saveStorage(storage);
        } else {
            highscore = storage.highscore;
        }
        return highscore;
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