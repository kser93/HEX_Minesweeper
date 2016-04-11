let getRandBoolArray = function (length, truthNum) {

    let result = new Array(length).fill(false);

    for (let i = 0; i < truthNum; ++i) {
        let truthIndex = _.random(0, length);
        while (result[truthIndex]) {
            truthIndex = _.random(0, length);
        }
        result[truthIndex] = true;
    }
    // result.fill(true, start=1, end=7);
    return result;
};

let CellsCollection = Backbone.Collection.extend({
    model: CellModel
});

let FieldModel = Backbone.Model.extend({
    defaults: {
        layers: 4,
        bombs: 10
    },
    initialize: function (attrs) {
        // console.log(attrs);
        let cells = new CellsCollection,
            cellsLen = this.get('layers') * (this.get('layers') + 1) * 3 + 1,
            isBombArray = getRandBoolArray(cellsLen, this.get('bombs'));
        for (let i = 0; i < cellsLen; ++i) {
            cells.add(
                new CellModel({
                    index: i,
                    isBomb: isBombArray[i]
                }),
                {at: i}
            );
        }
        this.set('cells', cells);
        cells.forEach(function (cell) {
            cell.set('neighbours', this.findNeighbours(cell));
        }.bind(this));
    },

    findNeighbours: function (cell) {
        let targetCoords = cell.get('coords');
        let neighboursCoords = [
            {x: targetCoords.x,     y: targetCoords.y+1},
            {x: targetCoords.x+1,   y: targetCoords.y},
            {x: targetCoords.x+1,   y: targetCoords.y-1},
            {x: targetCoords.x,     y: targetCoords.y-1},
            {x: targetCoords.x-1,   y: targetCoords.y},
            {x: targetCoords.x-1,   y: targetCoords.y+1}
        ];
        let neighbours = [];
        neighboursCoords.forEach(function(item) {
            neighbours.push(
                _.find(
                    this.get('cells').models,
                    function (cell) {
                        let coords = cell.get('coords');
                        return (coords.x == item.x) && (coords.y == item.y);
                    }
                )
            );
        }.bind(this));
        return new CellsCollection(_.filter(neighbours, function(neighbour) {return neighbour;}));
    },

    filterBombCells: function (cells) {
        let collection = new CellsCollection(cells);
        return collection.where({isBomb: true});
    }
});