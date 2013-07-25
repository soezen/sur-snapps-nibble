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

function loadOptions(listName, optionObjects) {
    var ls = document.getElementById(listName);

    for (var key in optionObjects) {
        if (optionObjects.hasOwnProperty(key)) {
            var option = new Option();
            option.text = optionObjects[key].label;
            option.value = optionObjects[key].id;
            ls.appendChild(option);
        }
    }
}

function getTime() {
    var now = new Date();
    var day = lastTwoChars(now.getDate());
    var month = lastTwoChars(now.getMonth() + 1);
    var year = now.getFullYear();
    var hours = lastTwoChars(now.getHours());
    var minutes = lastTwoChars(now.getMinutes());
    var seconds = lastTwoChars(now.getSeconds());

    var dateString = year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
    return dateString;
}

function lastTwoChars(string) {
    var chars = "0" + string;
    return chars.substring(chars.length - 2, chars.length);
}

