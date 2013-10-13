function getColors() {
    return [
        'cyan', 'teal', 'navy', 'yellow', 'olive', 'lime', 'green', 'orange', 'fuchsia', 'purple', 'red', 'saddlebrown'
    ];
}

function getAvailableColors(level) {
    var usedColors = getUsedColors(level);
    return $.grep(getColors(), function (element) {
        if ($.inArray(element, usedColors) == -1) {
            return element;
        }
        return false;
    });
}

function getAvailableUsedColors(list, level) {
    var usedColors = [];

    list.find("input[data-colortype=next]").each(function () {
        usedColors.push(this.dataset.blockcolor);
    });

    return $.grep(getUsedColors(level), function (element) {
        if ($.inArray(element, usedColors) == -1) {
            return element;
        }
        return false;
    });
}

function getUsedColors(level) {
    var usedColors = [];
    $("div[data-level=" + level + "]").find("a[data-blockcolor]").each(function () {
        usedColors.push(this.dataset.blockcolor);
    });

    return usedColors;
}

function cloneTemplate(temp) {
    var template = $(document).find("[data-template=" + temp + "]").clone(true);
    template.show();
    template.removeAttr("data-template");
    return template;
}

function addBonusBlock(obj) {
    var levelNbr = getLevel(obj);
    var container = $(obj).parents("div.panel-heading");
    var index = container.find("i").filter(".glyphicon-th-large").length + 1;
    var colors = getColors();

    if (index <= colors.length) {
        var newBlock = cloneTemplate("bonusBlock");
        var newColor = getAvailableColors(levelNbr)[0];
        newBlock.attr("data-blockcolor", newColor);
        newBlock.on('click', function () {
            setBonusBlockActive(levelNbr, $(this));
        });
        container.append(newBlock);
        var bonus = {
            name: newColor,
            color: newColor,
            points: 10,
            bonus: [],
            chance: 5,
            next: {
                type: 'same',
                amount: 1,
                types: []
            }
        };
        tempGame.levels[levelNbr - 1].bonusTypes.push(bonus);
        setBonusBlockActive(levelNbr, newBlock);
    }
}

function removeBonusBlock(obj) {
    var level = getLevel(obj);
    var color = getActiveBonusType(level).color;
    tempGame.levels[level - 1].bonusTypes.splice(getActiveBonusTypeIndex(level), 1);
    getActiveBonusBlock(level).remove();
    showActiveBonusBlock(level);

    var bonusTypes = tempGame.levels[level - 1].bonusTypes;

    for (var i = 0; i < bonusTypes.length; i++) {
        var bonusType = bonusTypes[i];
        var index = bonusType.next.types.indexOf(color);
        if (index >= 0) {
            bonusType.next.types.splice(index, 1);
        }
    }
}

function setBonusBlockActive(level, block) {
    var currentActive = getActiveBonusBlock(level);
    if (currentActive.get()[0] != block.get()[0]) {
        currentActive.removeClass("active");
    }
    block.toggleClass("active");
    showActiveBonusBlock(level);
}

function showActiveBonusBlock(levelNbr) {
    var panel = $("#level" + levelNbr).find(".panel");
    var heading = panel.find(".panel-heading");
    var content = heading.next();
    var activeBlock = getActiveBonusBlock(levelNbr);

    if (activeBlock.length == 0) {
        content.addClass("hide");
        panel.css("padding-bottom", "0");
        heading.css("margin-bottom", "0");
    } else {
        var color = activeBlock.get(0).dataset.blockcolor;
        var bonusType = getActiveBonusType(levelNbr);

        content.removeClass("hide");
        panel.css("padding-bottom", "15px");
        heading.css("margin-bottom", "15px");
        $("#color-lvl" + levelNbr).spectrum({
            color: color,
            showPaletteOnly: true,
            palette: getAvailableColors(levelNbr),
            change: function (color) {
                getActiveBonusBlock(levelNbr).attr("data-blockcolor", color.toName());
                getActiveBonusType(levelNbr).name = color.toName();
                getActiveBonusType(levelNbr).color = color.toName();
                updateWhereUsed(levelNbr, color.toName());
                updateNextTypes(levelNbr);
            }
        });
        $("#points-lvl" + levelNbr).val(bonusType.points);
        $("#chance-lvl" + levelNbr).slider("value", bonusType.chance);
        $("#nextType-lvl" + levelNbr).val(bonusType.next.type);
        checkNextType(levelNbr, bonusType.next.type);
        $("#nextAmount-lvl" + levelNbr).val(bonusType.next.amount);
        $("#nextTypes-lvl" + levelNbr).empty();
        for (var i = 0; i < bonusType.next.types.length; i++) {
            addNextType(levelNbr, bonusType.next.types[i]);
        }
        $("#bonus-lvl" + levelNbr).find("input[type=radio][value='not']").prop('checked', true);
        for (var j = 0; j < bonusType.bonus.length; j++) {
            $("#bonus-lvl" + levelNbr).find("input[type=radio][value='" + bonusType.bonus[j] + "']").prop('checked', true);
        }
    }
}

function updateNextTypes(level) {
    var nextTypes = $("#nextTypes-lvl" + level);
    var availableColors = getAvailableUsedColors(nextTypes, level);
    nextTypes.find("[data-colortype=next]").each(function () {
        $(this).spectrum({
            delete: true,
            color: this.dataset.blockcolor,
            showPaletteOnly: true,
            palette: availableColors,
            change: function (color) {
                var nextTypes = getActiveBonusType(level).next.types;
                var index = nextTypes.indexOf(this.dataset.blockcolor);
                nextTypes.splice(index, 1);

                if (color.toName() == 'black') {
                    $(this).spectrum("destroy");
                    $(this).parent("li").remove();
                } else {
                    nextTypes.push(color.toName());
                    this.dataset.blockcolor = color.toName();
                }
                updateNextTypes(level);
            }
        });
    });
}

function getActiveBonusTypeIndex(level) {
    return $("#level" + level).find(".panel-heading").find("a[data-blockcolor]").index(getActiveBonusBlock(level));
}

function getActiveBonusType(level) {
    return tempGame.levels[level - 1].bonusTypes[getActiveBonusTypeIndex(level)];
}

function updateWhereUsed(level, newColor) {
    var usedColors = getUsedColors(level);

    // if this color is used as a sub color, remove it
    $("#level" + level).find("[data-colortype=next]").each(function () {
        if ($.inArray(this.dataset.blockcolor, usedColors) == -1) {
            $(this).spectrum("set", newColor);

            var nextTypes = getActiveBonusType(level).next.types;
            var index = nextTypes.indexOf(this.dataset.blockcolor);
            nextTypes.splice(index, 1);
            nextTypes.push(newColor);
            this.dataset.blockcolor = newColor;

        }
    });
}

function getActiveBonusBlock(level) {
    return $("#level" + level).find("a[data-blockcolor].active");
}

function updateNextAmount(input) {
    var lvl = getLevel(input);
    var value = Number(input.value);
    if (value < 1) {
        console.log('incorrect value (too low)');
        value = 1;
    }
    if (value > (tempGame.columns * tempGame.rows) / 2) {
        console.log('incorrect value (too high)');
        value = (tempGame.columns * tempGame.rows) / 2;
    }
    if (value != input.value) {
        $("#nextAmount-lvl" + lvl).val(value);
    }
    setNextAmount(lvl, value);
}

function checkNextType(lvl, nextType) {
    var nextAmount = $("#nextAmount-lvl" + lvl);
    if (nextType == 'none') {
        nextAmount.attr("disabled", "disabled");
        nextAmount.val(0);
        setNextAmount(lvl, 0);
    } else {
        nextAmount.removeAttr("disabled");
    }

    var nextTypes = $("#nextTypes-lvl" + lvl);
    if (nextType != 'random') {
        nextTypes.empty();
        nextTypes.parents("div.row").first().addClass("hide");
        setNextTypes(lvl, []);
    } else {
        nextTypes.parents("div.row").first().removeClass("hide");
    }
}

function updatePoints(input) {
    var lvl = getLevel(input);
    var value = Number(input.value);
    if (isNaN(value)) {
        value = getActiveBonusType(lvl).points;
        $("#points-lvl" + lvl).val(value);
    }
    setPoints(lvl, value);
}

function updateBonus(input) {
    var lvl = getLevel(input);
    var checked = input.checked;
    var value = input.value;
    $("#bonus-lvl" + lvl).find("input[type=radio][name='" + input.name + "']").each(function (index, bonus) {
        removeBonus(lvl, bonus.value);
    });
    if (value != 'not') {
        addBonus(lvl, value);
    }
    console.log(getActiveBonusType(lvl).bonus);
}

function updateNextType(select) {
    var lvl = getLevel(select);
    var selectedValue = $(select).val();
    setNextType(lvl, selectedValue);
    checkNextType(lvl, selectedValue);
}

function setNextAmount(level, amount) {
    getActiveBonusType(level).next.amount = amount;
}

function setNextTypes(level, types) {
    getActiveBonusType(level).next.types = types;
}

function setNextType(level, type) {
    getActiveBonusType(level).next.type = type;
}

function setPoints(level, points) {
    getActiveBonusType(level).points = points;
}

function addBonus(level, bonus) {
    getActiveBonusType(level).bonus.push(bonus);
}

function removeBonus(level, bonus) {
    var bonusType = getActiveBonusType(level);
    var index = bonusType.bonus.indexOf(bonus);
    if (index >= 0) {
        bonusType.bonus.splice(index, 1);
    }
}

function addNextType(levelNbr, newColor) {
    var nextTypes = $("#nextTypes-lvl" + levelNbr);
    var nbrOfTypes = nextTypes.find("li").length;
    var availableColors = getAvailableUsedColors(nextTypes, levelNbr);
    var addColor = isUndefined(newColor);
    newColor = addColor ? availableColors[0] : newColor;

    if (nbrOfTypes >= getUsedColors(levelNbr).length) {
        console.log('all colors used');
        return;
    }
    var nextType = cloneTemplate('nextType');
    nextType.show();
    nextTypes.append(nextType);
    var colorInput = nextType.find("[data-colortype=next]");
    colorInput.attr("data-blockcolor", newColor);
    if (addColor) {
        getActiveBonusType(levelNbr).next.types.push(newColor);
    }
    colorInput.spectrum({
        delete: true,
        color: newColor,
        showPaletteOnly: true,
        palette: availableColors,
        change: function (color) {
            var nextTypes = getActiveBonusType(levelNbr).next.types;
            var index = nextTypes.indexOf(this.dataset.blockcolor);
            nextTypes.splice(index, 1);

            if (color.toName() == 'black') {
                $(this).spectrum("destroy");
                $(this).parent("li").remove();
            } else {
                nextTypes.push(color.toName());
                this.dataset.blockcolor = color.toName();
            }
            updateNextTypes(levelNbr);
        }
    });
    updateNextTypes(levelNbr);
}