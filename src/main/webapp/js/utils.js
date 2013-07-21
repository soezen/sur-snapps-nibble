function isUndefined(object) {
    return typeof(object) === 'undefined';
}

function objectHasKey(object, key) {
    return !isUndefined(object[key]);
}

function arrayContains(array, element) {
    for (var i = 0; i < array.length; i++) {
        if (element.toLowerCase() === array[i].toLowerCase()) {
            return true;
        }
    }
    return false;
}

function isNullOrEmpty(text) {
    if (isUndefined(text)) {
        return true;
    }
    if (text == null) {
        return true;
    }
    return text.trim() == '';

}

function createRow(tbl, values) {
    var row = document.createElement("tr");

    for (var key in values) {
        if (values.hasOwnProperty(key)) {
            appendCell(row, values[key]);
        }
    }

    tbl.appendChild(row);
}

function appendCell(row, content) {
    var cell = document.createElement("td");
    cell.innerHTML = content;
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
 * @param rowsPerPage
 * @returns {number}
 */
function getNbrOfPages(tblName, rowsPerPage) {
    var nbrOfRows = getNbrOfRows(tblName);
    var nbrOfPages = (nbrOfRows / rowsPerPage).toFixed(0);
    var rest = nbrOfRows % rowsPerPage;
    if (rest > 0 && rest < 5) {
        // undo rounding down of toFixed method
        nbrOfPages++;
    }
    return nbrOfPages;
}

/**
 * The total of rows in a table.
 * @param tblName
 * @returns {Number}
 */
function getNbrOfRows(tblName) {
    return getRows(tblName).length;
}

/**
 * Get all rows of a table.
 * @param tblName
 * @returns {*|jQuery}
 */
function getRows(tblName) {
    return $("#" + tblName).find("tbody").find("tr");
}

/**
 * The number of rows currently visible.
 * @param tblName
 * @returns {Number|jQuery}
 */
function getNbrOfVisibleRows(tblName) {
    return $("#" + tblName).find("tbody").find("tr:visible").length;
}