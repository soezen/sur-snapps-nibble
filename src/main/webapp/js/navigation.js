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
    menuItem.href = "snakegame.html";
    var page = menuItem.dataset.page;
    if (page == 'home') {
        if (!isUndefined(gameSession.getCurrentUser())) {
            page = 'dashboard';
        }
    }
    gameSession.setCurrentPage(page);
}
