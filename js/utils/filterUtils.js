let reset = false;

function createShapeFilters(id, shapeGroups) {
    let shapeFilter = document.getElementById(id);

    Object.entries(shapeGroups).forEach(groups => {
        let newGroup = document.createElement("optgroup");
        const [shapeGroup, shapeList] = groups;
        newGroup.label = shapeGroup;
        shapeList.forEach(shape => {
            let shapeOption = document.createElement("option");
            shapeOption.textContent = shape.charAt(0).toUpperCase() + shape.slice(1);
            shapeOption.value = shape.toLowerCase();
            newGroup.appendChild(shapeOption);
        });
        shapeFilter.appendChild(newGroup);
    });
}


function applyGobalFilters(data) {
    if (shapeFilter !== "All") {
        data = data.filter(d => d.shape === shapeFilter);
    }

    if (countryFilter !== "All") {
        data = data.filter(d => d.country === countryFilter);
    }

    const [startDate, endDate] = dateFilter;
    const [startTime, endTime] = timeFilter;

    return data.filter(d => {
        const year = d.date.split('/')[2];
        const hour = d.time.split(':')[0];
        return year >= startDate && year <= endDate && hour >= startTime && hour <= endTime;
    });
}

// Create range slider for date
$(function () {
    $("#slider-date").slider({
        range: true,
        min: 1906,
        max: 2014,
        values: [1994, 2014],
        slide: function (event, ui) {
            $("#amount").val(ui.values[0] + " - " + ui.values[1]);
        },
        change: function (event, ui) {
            if (reset) {
                return;
            }
            dateFilter = [ui.values[0], ui.values[1]]
            filtered = applyGobalFilters(encounters);
            showInfo(filtered)
        }
    });
    $("#amount").val($("#slider-date").slider("values", 0) +
        " - " + $("#slider-date").slider("values", 1));
});

$(function () {
    $("#slider-time").slider({
        range: true,
        min: 00,
        max: 24,
        values: [00, 24],
        create: function (event, ui) {
            let start = 00;
            let end = 24;
            if (start < 10) {
                start = '0' + start;
            }
            if (end < 10) {
                end = '0' + end;
            }
            $("#amountTime").val(start + "h - " + end + "h");
        },
        slide: function (event, ui) {
            let start = ui.values[0];
            let end = ui.values[1];
            if (start < 10) {
                start = '0' + start;
            }
            if (end < 10) {
                end = '0' + end;
            }
            $("#amountTime").val(start + "h - " + end + "h");
        },
        change: function (event, ui) {
            if (reset) {
                return;
            }
            timeFilter = [ui.values[0], ui.values[1]];
            filtered = applyGobalFilters(encounters);
            showInfo(filtered);
        }
    });
});

$(function () {
    $('#country_filter').on('change', function () {
        if(reset) {
            return;
        }
        processCountryFilter(this.value);
    });
});

$(function () {
    $("#clear_filters").click(function () {
        reset = true;
        $("#shape_filter").val("All").change();
        $("#country_filter").val("All").change();
        $("#slider-date").slider('values', 0, 1906);
        $("#slider-date").slider('values', 1, 2014);
        $("#slider-time").slider('values', 0, 00);
        $("#slider-time").slider('values', 1, 24);
        $("#amount").val(1906 + " - " + 2014);
        $("#amountTime").val(0 + "0h - " + 24 + "h");
        reset = false;

        shapeFilter = "All";
        dateFilter = [1906, 2014];
        timeFilter = [0, 24];
        filtered = applyGobalFilters(encounters);
        showInfo(filtered);

    });
});

