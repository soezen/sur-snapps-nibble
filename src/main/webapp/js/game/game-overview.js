function loadGames() {
    var tbody = $("#tblGames").find("tbody");
    tbody.empty();
    var games = gameStorage.getGames();

    for (var key in games) {
        if (games.hasOwnProperty(key)) {
            createGamesRow(tbody, games[key]);
        }
    }
}

function createGamesRow(tbl, values) {
    var row = document.createElement('tr');
    row.dataset.gameid = values.id;

    appendCell(row, values.label, false);
    appendCell(row, values.rows, false);
    appendCell(row, values.columns, false);

    $(row).on('click', function () {
        tbl.find('.info').not(row).removeClass('info');
        $(this).toggleClass('info');
    });
    tbl.append(row);
}

function playGame(menuItem) {
    var selectedRow = getSelectedRow('tblGames');
    if (!isUndefined(selectedRow) && selectedRow.size() > 0) {
        var game = selectedRow.data("gameid");
        gameSession.setCurrentGame(game);
        openPage(menuItem);
    }
}

function removeGame(menuItem) {
    var selectedRow = getSelectedRow('tblGames');
    if (!isUndefined(selectedRow) && selectedRow.size() > 0) {
        var game = selectedRow.data('gameid');
        gameStorage.removeGame(game);
        openPage(menuItem);
    }
}