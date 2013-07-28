function loadUsersInTable(tblName) {
    var users = gameStorage.getUsers();
    var tblUsers = $("#" + tblName).find("tbody");

    tblUsers.empty();

    for (var i = 0; i < users.length; i++) {
        createUserRow(tblUsers, users[i]);
    }

    $("#useramount").text(getNbrOfRows(tblName));
}

function createUserRow(tbl, user) {
    var row = document.createElement("tr");
    var label = document.createElement("label");
    $(label).text(user.label);
    $(label).attr('for', user.id);
    $(label).addClass('checkbox');
    var input = document.createElement("input");
    input.id = user.id;
    input.value = user.id;
    label.appendChild(input);
    input.type = 'checkbox';

    appendCell(row, label, true);

    tbl.append(row);
}


function removeSelectedUsers() {
    var tblName = 'tblUsers';
    var selectedUsers = $("#" + tblName).find("tbody").find("tr").find("input[type=checkbox]:checked");

    selectedUsers.each(function (index, input) {
        gameStorage.removeUser(input.value);
        $(this).parents("tr").remove();
    });

    showCurrentPage('tblUsers');
    $('#' + tblName).trigger('update');
    $("#useramount").text(getNbrOfRows(tblName));
    $("input").val('');
}

// TODO SUR also be able to delete only scores of one person
function clearHistory() {
    gameStorage.clearScores();
}


