function getCoordinates(init, totalLength, location) {
    return {
        x: init + (location.x * totalLength),
        y: init + (location.y * totalLength)
    }
}