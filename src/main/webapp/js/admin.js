var rowsPerPage = 10;

function loadUsersInTable(tblName) {
    var users = gameStorage.getUsers();
    var tblUsers = document.getElementById(tblName).getElementsByTagName("tbody")[0];

    tblUsers.innerHTML = "";

    for (var i = 0; i < users.length; i++) {
        createRow(tblUsers, {
            user: "<label class='checkbox'><input type='checkbox' value='" + users[i] + "' /> " + users[i] + "</label>"
        });
    }

    $("#useramount").text(getNbrOfRows(tblName));
}

function addTableSorter(tblName) {
    try {
        $("#" + tblName).tablesorter({
            sortList: [
                [0, 0]
            ],
            headers: {
                1: {
                    sorter: false
                }
            }
        });
        $("#" + tblName).on('sortEnd', function () {
            goToPage(tblName, 1);
        });
    } catch (e) {

    }
}

function previousPage(tblName) {
    var paginator = getPaginator(tblName);
    var currentPage = paginator.find("li[class=active]");
    var nbrOfPages = getNbrOfPages(tblName, rowsPerPage);

    checkBeforeUpdatePaginator(paginator, tblName, nbrOfPages);

    currentPage.removeClass("active");
    currentPage.prev().addClass("active");

    checkAfterUpdatePaginator(paginator, tblName, nbrOfPages);

    showCurrentPage(tblName);
}

function nextPage(tblName) {
    var paginator = getPaginator(tblName);
    var currentPage = paginator.find("li[class=active]");
    var nbrOfPages = getNbrOfPages(tblName, rowsPerPage);

    checkBeforeUpdatePaginator(paginator, tblName, nbrOfPages);

    currentPage.removeClass("active");
    currentPage.next().addClass("active");

    checkAfterUpdatePaginator(paginator, tblName, nbrOfPages);

    showCurrentPage(tblName);
}

function goToPage(tblName, index) {
    var paginator = getPaginator(tblName);
    var nbrOfPages = getNbrOfPages(tblName, rowsPerPage);
    var currentPage = paginator.find("[class=active]");
    var nextPage = paginator.find("li:nth-child(" + (eval(index) + 1) + ")");

    checkBeforeUpdatePaginator(paginator, tblName, nbrOfPages);

    currentPage.removeClass("active");
    nextPage.addClass("active");

    checkAfterUpdatePaginator(paginator, tblName, nbrOfPages);

    showCurrentPage(tblName);
}

function createTablePaginator(tblName) {
    var nbrOfPages = getNbrOfPages(tblName, rowsPerPage);
    var paginator = getPaginator(tblName);
    paginator.empty();
    var prev = createPaginatorItem(tblName, '<<', previousPage);
    $(prev).addClass('disabled');
    paginator.append(prev);
    for (var i = 0; i < nbrOfPages; i++) {
        var li = createPaginatorItem(tblName, i + 1, goToPage);
        if (i == 0) {
            $(li).addClass('active');
        }
        paginator.append(li);
    }
    var next = createPaginatorItem(tblName, '>>', nextPage);
    if (nbrOfPages <= 1) {
        $(next).addClass('disabled');
    }
    paginator.append(next);
}

function checkBeforeUpdatePaginator(paginator, tblName, nbrOfPages) {
    if (getCurrentPage(tblName) == nbrOfPages) {
        paginator.find("li:last-child").removeClass('disabled');
    }

    if (getCurrentPage(tblName) == 1) {
        paginator.find("li:first-child").removeClass('disabled');
    }
}

function checkAfterUpdatePaginator(paginator, tblName, nbrOfPages) {

    if (getCurrentPage(tblName) == nbrOfPages) {
        paginator.find("li:last-child").addClass('disabled');
    }

    if (getCurrentPage(tblName) == 1) {
        paginator.find("li:first-child").addClass('disabled');
    }
}

function createPaginatorItem(tblName, text, fn) {
    var li = document.createElement("li");
    var a = document.createElement("a");
    a.innerHTML = text;
    a.href = "#";
    $(a).on('click', function () {
        if (!$(li).hasClass('disabled')
            && !$(li).hasClass('active')) {
            fn(tblName, text);
        }
    });
    li.appendChild(a);
    return li;
}

function showCurrentPage(tblName) {
    var rows = getRows(tblName);
    var currentPage = getCurrentPage(tblName);
    rows.each(function (index, value) {
        if (index >= (currentPage - 1) * rowsPerPage && index < currentPage * rowsPerPage) {
            this.style.display = "table-row";
        } else {
            this.style.display = "none";
        }
    });

    var paginator = getPaginator(tblName);
    var nbrOfPages = getNbrOfPages(tblName, rowsPerPage);
    var nbrOfButtons = paginator.find("li").length - 2;

    if (nbrOfPages < nbrOfButtons) {
        paginator.find("li:nth-child(" + (nbrOfButtons + 1) + ")").remove();
        if (getNbrOfVisibleRows(tblName) == 0 && currentPage > 1) {
            goToPage(tblName, currentPage - 1);
        } else {
            checkAfterUpdatePaginator(paginator, tblName, nbrOfPages);
        }
    }
}

function removeSelectedUsers(e) {
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

function clearHistory() {
    localStorage.history = JSON.stringify([]);
    loadLeaderboard();
}


