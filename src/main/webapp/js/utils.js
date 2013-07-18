function isUndefined(object) {
    return typeof(object) === 'undefined';
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
        appendCell(row, values[key]);
    }

    tbl.appendChild(row);
}

function appendCell(row, content) {
    var cell = document.createElement("td");
    cell.innerHTML = content;
    row.appendChild(cell);
}

function getCurrentPage(tblName) {
    return  eval(getPaginator(tblName).find("li[class=active]").text());
}

function getPaginator(tblName) {
    return $("ul[data-paginator-table=" + tblName + "]");
}

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

function getNbrOfRows(tblName) {
    return getRows(tblName).length;
}

function getRows(tblName) {
    return $("#" + tblName).find("tbody").find("tr");
}

function getNbrOfVisibleRows(tblName) {
    return $("#" + tblName).find("tbody").find("tr:visible").length;
}