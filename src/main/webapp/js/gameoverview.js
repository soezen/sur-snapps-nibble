function loadGames() {
    var tbody = $("#tblGames").find("tbody");
    tbody.empty();
    var games = gameStorage.getGames();

    for (var key in games) {
        if (games.hasOwnProperty(key)) {
            createGamesRow(tbody, games[key]);
        }
    }

    createGamesRow(tbody, { id: 'surrounded', label: 'Surrounded', rows: 20, columns: 10 });
    createGamesRow(tbody, { id: 'free', label: 'Free', rows: 10, columns: 20 });
    createGamesRow(tbody, { id: 'line', label: 'Line', rows: 15, columns: 20 });
    createGamesRow(tbody, { id: 'double-line', label: 'Double Line', rows: 20, columns: 15 });
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