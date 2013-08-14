function addTableSorter(tblName, defaultSortColumn, ascending) {
    try {
        var table = $("#" + tblName);
        table.tablesorter({
            sortList: [
                [getColumnIndex(tblName, defaultSortColumn), ascending ? 0 : 1]
            ]
        });
        table.on('sortEnd', function () {
            goToPage(tblName, 1);
        });
    } catch (e) {

    }
}

function getColumnIndex(tblName, clmName) {
    var columns = $("#" + tblName).find("thead").find("th");
    var clmIndex = 0;

    columns.each(function (index) {
        if (this.id == clmName) {
            clmIndex = index;
        }
    });

    return clmIndex;
}

function previousPage(tblName) {
    var paginator = getPaginator(tblName);
    var currentPage = paginator.find("li[class=active]");
    var nbrOfPages = getNbrOfPages(tblName);

    checkBeforeUpdatePaginator(paginator, tblName, nbrOfPages);

    currentPage.removeClass("active");
    currentPage.prev().addClass("active");

    checkAfterUpdatePaginator(paginator, tblName, nbrOfPages);

    showCurrentPage(tblName);
}

function nextPage(tblName) {
    var paginator = getPaginator(tblName);
    var currentPage = paginator.find("li[class=active]");
    var nbrOfPages = getNbrOfPages(tblName);

    checkBeforeUpdatePaginator(paginator, tblName, nbrOfPages);

    currentPage.removeClass("active");
    currentPage.next().addClass("active");

    checkAfterUpdatePaginator(paginator, tblName, nbrOfPages);

    showCurrentPage(tblName);
}

function goToPage(tblName, index) {
    var paginator = getPaginator(tblName);
    var nbrOfPages = getNbrOfPages(tblName);
    var currentPage = paginator.find("[class=active]");
    var nextPage = paginator.find("li:nth-child(" + (eval(index) + 1) + ")");

    checkBeforeUpdatePaginator(paginator, tblName, nbrOfPages);

    currentPage.removeClass("active");
    nextPage.addClass("active");

    checkAfterUpdatePaginator(paginator, tblName, nbrOfPages);

    showCurrentPage(tblName);
}

function updateTablePaginator(tblName) {
    var nbrOfPages = getNbrOfPages(tblName);
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
    $(a).addClass("btn");
    $(a).addClass("btn-sm");
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
    var rows = getFilteredRows(tblName);
    var rowsPerPage = getRowsPerPage(tblName);
    var currentPage = getCurrentPage(tblName);
    rows.each(function (index) {
        if (index >= (currentPage - 1) * rowsPerPage && index < currentPage * rowsPerPage) {
            this.style.display = "table-row";
        } else {
            this.style.display = "none";
        }
    });

    var paginator = getPaginator(tblName);
    var nbrOfPages = getNbrOfPages(tblName);
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

function appendCell(row, content, append) {
    var cell = document.createElement("td");
    if (!isUndefined(content)) {
        if (append) {
            cell.appendChild(content);
        } else {
            cell.innerHTML = content;
        }
    }
    row.appendChild(cell);
}

/**
 * Get the current page of a table with paginator.
 * @param tblName
 * @returns {Object}
 */
function getCurrentPage(tblName) {
    return  eval(getPaginator(tblName).find("li[class=active]").text());
}

/**
 * Get the corresponding paginator of a table.
 * @param tblName
 * @returns {*|jQuery|HTMLElement}
 */
function getPaginator(tblName) {
    return $("ul[data-paginator-table=" + tblName + "]");
}
/**
 * Counts the number of pages a table has, based on the number of rows visible on one page.
 * @param tblName
 * @returns {number}
 */
function getNbrOfPages(tblName) {
    var nbrOfRows = getNbrOfFilteredRows(tblName);
    var rowsPerPage = getRowsPerPage(tblName);
    return Math.ceil(nbrOfRows / rowsPerPage);
}

function getRowsPerPage(tblName) {
    return Number(getPaginator(tblName).data("paginator-rowsperpage"));
}

/**
 * The total of rows in a table.
 * @param tblName
 * @returns {Number}
 */
function getNbrOfRows(tblName) {
    return getRows(tblName).length;
}

function getNbrOfFilteredRows(tblName) {
    return getFilteredRows(tblName).length;
}

/**
 * Get all rows of a table.
 * @param tblName
 * @returns {*|jQuery}
 */
function getRows(tblName) {
    return $("#" + tblName).find("tbody").find("tr");
}

function getFilteredRows(tblName) {
    return $($.grep(getRows(tblName), function (value) {
        return $(value).find("td[data-filtered=true]").length == 0;
    }));
}

/**
 * The number of rows currently visible.
 * @param tblName
 * @returns {Number|jQuery}
 */
function getNbrOfVisibleRows(tblName) {
    return $("#" + tblName).find("tbody").find("tr:visible").length;
}

function getSelectedRow(tblName) {
    var rows = getRows(tblName);
    return rows.filter('.info');
}