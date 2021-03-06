let CellModel = Backbone.Model.extend({
    defaults: {
        index: null,
        layer: {num: 0, offset: 0},
        group: {num: 0, offset: 0},
        coords: {x: 0, y: 0},
        id: JSON.stringify({x: 0, y: 0}),
        isBomb: false,
        state: 'hidden'
    },
    states: ['hidden', 'opened'],

    initialize: function(attrs) {
        let index = this.get('index');

        if (index) {
            let layer = this._findLayer(index),
                group = this._findGroup(layer),
                coords = this._findCoords(layer, group);
            this.set({
                'layer': layer,
                'group': group,
                'coords': coords
            });
            this.set('id', JSON.stringify(coords));
        }
    },

    _findLayer: function (index) {

        let layerNum = Math.ceil(
                (Math.sqrt((4*index+1)/3) - 1) / 2
            ),
            layerOffset = index - (layerNum - 1) * layerNum * 3 - 1;
        return {
            num: layerNum,
            offset: layerOffset
        };
    },

    _findGroup: function (layer) {

        return {
            num: Math.ceil((layer.offset + 1) / layer.num) - 1,
            offset: (layer.offset) % layer.num
        };
    },

    _findCoords: function (layer, group) {
        switch(group.num) {
            case 0:
                return {
                    x: group.offset,
                    y: layer.num - group.offset
                };
            case 1:
                return {
                    x: layer.num,
                    y: 0 - group.offset
                };
            case 2:
                return {
                    x: layer.num - group.offset,
                    y: 0 - layer.num
                };
            case 3:
                return {
                    x: 0 - group.offset,
                    y: group.offset - layer.num
                };
            case 4:
                return {
                    x: 0 - layer.num,
                    y: group.offset
                };
            case 5:
                return {
                    x: group.offset - layer.num,
                    y: layer.num
                };
        }
    }
});