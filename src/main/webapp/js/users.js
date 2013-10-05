var gameStorage = new GameStorage();
var gameSession = new SessionStorage();

function selectUser() {
    var players = document.getElementById('players');
    if (!isUndefined(players.selectedOptions)) {
        login(players.selectedOptions[0].value);
    } else {
        login(players.options[players.selectedIndex].value);
    }
    return true;
}

function login(username) {
    gameSession.loginUser(username);
    var menuItem = {
        dataset: {
            page: 'dashboard'
        }
    };
    openPage(menuItem);
}

function loginAdmin($el, value, callback) {
    callback({
        value: value,
        valid: value == 'b00lean:isValid?',
        message: 'incorrect password'
    });
}

function logout(menuItem) {
    login(undefined);
    openPage(menuItem);
}

function loadSession() {
    var currentUser = gameSession.getCurrentUser();
    var currentPage = gameSession.getCurrentPage();
    var loggedIn = !isUndefined(currentUser);
    var isAdmin = currentUser == 'admin';

    var menuItems = document.getElementById('menu').getElementsByTagName('li');
    $(menuItems).each(function () {
        var view = this.dataset.view;
        var page = "home";
        if (this.getElementsByTagName('a').length == 1) {
            page = this.getElementsByTagName("a")[0].dataset.page;
        }
        if (view == 'all'
            || (loggedIn && (view == 'user'))
            || (!loggedIn && view == 'anonymous')
            || (loggedIn && isAdmin && view == 'admin')) {
            this.style.display = 'block';
        } else {
            this.style.display = 'none';
        }

        if (currentPage == page) {
            $(this).addClass('active');
        } else {
            $(this).removeClass('active');
        }

        if (this.id == 'currentUser') {
            this.innerHTML = currentUser;
        }
    });
}

function validateUser($el, value, callback) {
    var valid = true;
    var message = '';
    if (nullOrEmpty(value)) {
        valid = false;
        message = 'Incorrect length [3-50]'
    } else if (userNotUnique(value)) {
        valid = false;
        message = 'Username already exists'
    }

    callback({
        value: value,
        valid: valid,
        message: message
    });
}

function userNotUnique(value) {
    var users = gameStorage.getUsers();
    if (arrayContains(users, 'id', value)) {
        return true;
    }
    return false;
}

function nullOrEmpty(value) {
    if (isUndefined(value)) {
        return true;
    }
    return value.length < 3 || value.length > 50;
}
