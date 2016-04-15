let CellsCollection = Backbone.Collection.extend({
    model: CellModel
});

let FieldModel = Backbone.Model.extend({
    defaults: {
        layers: 4,
        bombs: 10
    },
    initialize: function (attrs) {
        //  количество ячеек, определяемое по количеству слоёв
        let cellsLen = this.get('layers') * (this.get('layers') + 1) * 3 + 1,
        //  массив[bombs] случайных индексов cells
            bombIndices = _.sample(Array.from({length: cellsLen}, (v, k) => k), this.get('bombs'));

        let cells = Array.from(
            {length: cellsLen},
            (v, i) => new CellModel({
                    index: i,
                    isBomb: _.contains(bombIndices, i)
                })
        );
        this.set('cells', new CellsCollection(cells));

        this.get('cells').forEach(
            cell => {
                cell.set('neighbours', this._findNeighbours(cell))
            }
        );
    },

    _findNeighbours: function(cell) {

        let targetCoords = cell.get('coords'),
            neighboursCoords = [
                {x: targetCoords.x,     y: targetCoords.y+1},
                {x: targetCoords.x+1,   y: targetCoords.y},
                {x: targetCoords.x+1,   y: targetCoords.y-1},
                {x: targetCoords.x,     y: targetCoords.y-1},
                {x: targetCoords.x-1,   y: targetCoords.y},
                {x: targetCoords.x-1,   y: targetCoords.y+1}
            ];
        return new CellsCollection(
            neighboursCoords.map(
                coord => {
                    return this.get('cells').get(JSON.stringify(coord));
                }
            ).filter(neighbour => neighbour)
        );
    }
});