function search(objects, paramName, value) {
    for (let i = 0; i < objects.length; i++) {
        if (objects[i][paramName] == value) {
            return objects[i];
        }
    }
    return {};
}


module.exports = {
    search,
};
