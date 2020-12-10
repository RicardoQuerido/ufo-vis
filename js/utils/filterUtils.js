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