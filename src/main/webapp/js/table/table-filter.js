function addFilters(tblName) {
    var inputs = $("input[data-filtertype]");

    inputs.each(function () {
        $(this).change(function () {
            filter(tblName, this);
        });
    });
}

function filter(tblName, input) {
    if (input.validity.valid) {
        var columnName = input.dataset.filtercolumn;
        var columnIndex = getColumnIndex(tblName, columnName);
        var column = {
            name: columnName,
            index: columnIndex
        };
        var dataType = getFilterConfig(tblName, 'filtertype', column.index);

        filterColumns(tblName, column.index, getFilter(input, column, dataType));
        updateTablePaginator(tblName);
        goToPage(tblName, 1);
    } else {
        console.log('not valid');
    }
}

function getFilter(input, column, datatype) {
    var type = input.dataset.filtertype;
    var filter = function () {
        console.log('not implemented');
    };

    if (type == 'interval-start') {
        var intervalEnd = $("input[data-filtertype=interval-end][data-filtercolumn=" + column.name + "]");
        filter = getFilterInterval(column.index, datatype, input.value, intervalEnd[0].value);
    } else if (type == 'interval-end') {
        var intervalStart = $("input[data-filtertype=interval-start][data-filtercolumn=" + column.name + "]");
        filter = getFilterInterval(column.index, datatype, intervalStart[0].value, input.value);
    } else if (type == 'text') {
        filter = getFilterText(input.value);
    }
    return filter;
}

function getFilterInterval(column, datatype, start, end) {
    var filterFunction = function () {
        console.log('not implemented');
    };
    if (datatype == 'date') {
        filterFunction = function (td) {
            var filter = false;
            var dateValue = td.innerHTML;
            var tblName = $(td).parents('table').attr('id');
            var range = getFilterConfig(tblName, 'filterrange', column);

            if (!isUndefined(range) && range.length == 2) {
                dateValue = dateValue.substring(range[0], range[1]);
            }

            var date = new Date(dateValue);
            if (!isNullOrEmpty(start)) {
                var startDate = new Date(start);
                if (startDate > date) {
                    filter = true;
                }
            }
            if (!isNullOrEmpty(end)) {
                var endDate = new Date(end);
                if (endDate < date) {
                    filter = true;
                }
            }

            return filter;
        };
    } else if (datatype == 'number') {
        filterFunction = function (td) {
            var value = td.innerHTML;
            var tblName = $(td).parents('table').attr('id');
            var range = getFilterConfig(tblName, 'filterrange', column);

            if (!isUndefined(range) && range.length == 2) {
                value = value.substring(range[0], range[1]);
            }
            return (!isNullOrEmpty(start) && Number(start) > eval(value))
                || (!isNullOrEmpty(end) && Number(end) < eval(value));
        }
    } else if (datatype == 'text') {
        filterFunction = function (td) {
            return (!isNullOrEmpty(start) && start.toLowerCase() > td.innerHTML.toLowerCase())
                || (!isNullOrEmpty(end) && end.toLowerCase() < td.innerHTML.toLowerCase());
        }
    }

    return filterFunction;
}

function getFilterConfig(tblName, config, column) {
    return $("#" + tblName).find("thead").find("tr").find("th:nth-child(" + (column + 1) + ")").data(config);
}

function getFilterText(text) {
    return function (td) {
        return td.innerHTML.toLowerCase().indexOf(text.toLowerCase()) == -1;
    };
}

function filterColumns(tblName, column, isFiltered) {
    var columns = $("#" + tblName).find("tr").find("td:nth-child(" + (column + 1) + ")");

    columns.each(function (index, td) {
        td.dataset.filtered = isFiltered(td);
    });

    updateRowFilters(tblName);
}

function updateRowFilters(tblName) {
    var rows = $("#" + tblName).find("tbody").find("tr");

    rows.each(function () {
        var cells = $(this).find("td");
        var visible = true;

        cells.each(function () {
            var filtered = eval(this.dataset.filtered);
            if (!isUndefined(filtered) && filtered) {
                visible = false;
            }
        });

        if (visible) {
            this.style.display = "table-row";
        } else {
            this.style.display = "none";
        }
    });
}