var gameSession = new SessionStorage();

function loadContent() {
    var page = gameSession.getCurrentPage();
    if (isUndefined(page)) {
        page = 'home';
    }
    $('#content').load(page + '.html');
    loadSession();
}

function openPage(menuItem) {
    var page = menuItem;
    if (!isUndefined(menuItem.parentNode)) {
        page = menuItem.parentNode.dataset.page;
    }
    if (page == 'home') {
        if (!isUndefined(gameSession.getCurrentUser())) {
            page = 'dashboard';
        }
    }
    gameSession.setCurrentPage(page);
}
