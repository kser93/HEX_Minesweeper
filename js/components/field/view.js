let FieldView = Backbone.View.extend({
    model: FieldModel,
    events: {
        'click': 'clickHandler'
    },
    initialize: function (attrs) {
        this.setElement(attrs.ctx.canvas);
        this.radius = attrs.radius;
        this.ctx = attrs.ctx;
        let cellViews = [];
        this.model.get('cells').forEach(
            cell => {
                let cellView = new CellView({
                        model: cell,
                        ctx: attrs.ctx,
                        radius: this.radius
                    });
                cellViews.push(cellView);
            }
        );
        this.cellViews = cellViews;

        this.listenTo(
            this.model.get('cells'),
            'notbomb',
            cell => _.invoke(cell.get('neighbours').where({state: 'hidden'}), 'set', {state: 'opened'})
        );
        this.listenTo(
            this.model.get('cells'),
            'bomb',
            () => {
                this.undelegateEvents();
                alert('You\'ve been pwned!');
            }
        );
        this.render();
    },

    render: function () {
        this.cellViews.forEach(cellView => cellView.render());
    },

    clickHandler: function (e) {
        let target = this._findCell(e);
        if (!target) {
            console.log(target);
            return;
        }
        console.log(e);

        let action = e.altKey ? 'flag' : 'open';
        let handlerActions = {
            hidden: {
                flag: () => target.set('state', 'flagged'),
                open: () => target.set('state', 'opened')
            },
            flagged: {
                flag: () => target.set('state', 'hidden'),
                open: () => null
            },
            opened: {
                flag: () => null,
                open: () => null
            }
        };
        handlerActions[target.get('state')][action]();
        let notbombs = this.model.get('cells').filter(
            cell => cell.get('state') != 'opened' && cell.get('isBomb') == false
        ).length;
        if (!notbombs) {
            this.undelegateEvents();
            alert('You won!');
        }
        console.log(notbombs);
    },

    _findCell: function(e) {

        let base = {
            x: (e.offsetX - this.ctx.center.x),
            y: (e.offsetY - this.ctx.center.y)
        };
        let prj = {
            x: base.x/this.radius,
            y: base.y*Math.sqrt(3)/(3*this.radius)
        };

        let lines = {
            left: prj.x - prj.y,
            right: prj.x + prj.y,
            horizontal: 2*prj.y
        };
        let leftBoundaries = {
            left: Math.floor(lines.left),
            right: Math.floor(lines.right),
            horizontal: Math.floor(lines.horizontal)
        };

        let pointSelector = (leftBoundaries.left + leftBoundaries.right) % 3;
        if (pointSelector < 0) {
            pointSelector = (pointSelector + 3) % 3;
        }

        let pointNames = ['left', 'right', 'middle'];
        let pointY = {
            left: (leftBoundaries.left - 2*leftBoundaries.right)/3,
            middle: (leftBoundaries.right - 2*leftBoundaries.left - 2)/3 - leftBoundaries.horizontal,
            right: (leftBoundaries.left - 2*leftBoundaries.right - 1)/3
        };

        let coords = {
            x: (leftBoundaries.left + leftBoundaries.right + (3 - pointSelector) % 3) / 3,
            y: pointY[pointNames[pointSelector]]
        };
        // console.log(
        //     this.model.get('cells').get(JSON.stringify(coords))
        // );
        return this.model.get('cells').get(JSON.stringify(coords));
    }
});