let FieldView = Backbone.View.extend({
    model: FieldModel,
    events: {
        'click': 'clickHandler'
    },
    initialize: function (attrs) {
        this.setElement(attrs.ctx.canvas);
        // this.ctx = attrs.ctx;
        // this.layerColors = attrs.layerColors;
        this.radius = attrs.radius;
        let cellViews = new Array(this.model.get('cells').length);
        this.model.get('cells').forEach(function (cell, i) {
            cellViews[i] = new CellView({
                model: cell,
                ctx: attrs.ctx,
                radius: this.radius,
                color: attrs.layerColors[cell.get('layer').num]
            });
        }.bind(this));
        this.cellViews = cellViews;
        this.listenTo(this.model.get('cells'), 'notbomb', function (cell) {
            cell.get('neighbours').where({
                state: 'close'
            }).forEach(function (neighbour) {
                neighbour.set('state', 'open');
            });
        });
        this.listenTo(this.model.get('cells'), 'bomb', function (cell) {
            this.undelegateEvents();
        });
        this.render();
        return this;
    },

    render: function () {
        this.cellViews.forEach(function (cellView) {
            cellView.render();
        });
        return this;
    },

    clickHandler: function (e) {
        let target = this._determineCell(e);
        if (target && target.get('state') == 'close') {
            target.set('state', 'open');
        }
    },

    _determineCell: function(e) {
        let mousePos = {
            x: e.layerX,
            y: e.layerY
        };
        let minDist = {
                x: this.radius,
                y: this.radius
            },
            clickedHex = null;
        this.cellViews.forEach(function (hex) {
            let dist = {
                x: hex.center.x - mousePos.x,
                y: hex.center.y - mousePos.y
            };
            if ( (Math.pow(dist.x, 2) + Math.pow(dist.y, 2)) < (Math.pow(minDist.x, 2) + Math.pow(minDist.y, 2)) ) {
                minDist = dist;
                clickedHex = hex;
            }
        });
        // console.log((e.layerX - this.ctx.center.x) / (this.radius));
        // console.log((e.layerY - this.ctx.center.y) / (this.radius * Math.sqrt(3)));
        return clickedHex? clickedHex.model: clickedHex;
    }
});