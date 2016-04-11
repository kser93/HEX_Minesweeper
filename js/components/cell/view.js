let CellView = Backbone.View.extend({
    model: CellModel,
    initialize: function (attrs) {
        // console.log(attrs);
        this.ctx = attrs.ctx;
        this.radius = attrs.radius;
        this.color = attrs.color;
        this.center = this._findCenter(this.model, this.ctx.center, this.radius);
        this.points = this._findPoints(this.center, this.radius, 0);
        this._updateStateDependent();
        this.listenTo(this.model, 'change:state', function(attr) {
            console.log(attr);
            this._updateStateDependent();
            this.render();
        }.bind(this));
        // this.model.set('state', 'open');
        return this;
    },

    render: function() {
        this._drawHex(this.ctx, 'black', this.color);
        this.drawContent(this.ctx, this.center, this.radius);
        return this;
    },

    _updateStateDependent: function() {
        _.extend(this, this.state_dependent[this.model.get('state')]);
    },

    _findCenter: function (model, ctxCenter, radius) {

        if (model.index == 0) {
            return center;
        }
        let groupAngles = [0, Math.PI/3, 2*Math.PI/3, Math.PI, -2*Math.PI/3, -Math.PI/3];
        let angleBase = groupAngles[model.get('group').num];
        let base = {
            x: ctxCenter.x + radius * model.get('layer').num * Math.sin(angleBase) * Math.sqrt(3),
            y: ctxCenter.y - radius * model.get('layer').num * Math.cos(angleBase) * Math.sqrt(3)
        };
        let angleOffset = groupAngles.concat(groupAngles)[model.get('group').num+2];
        let offset = {
            x: radius * model.get('group').offset * Math.sin(angleOffset) * Math.sqrt(3),
            y: -radius * model.get('group').offset * Math.cos(angleOffset) * Math.sqrt(3)
        };

        return {
            x: base.x + offset.x,
            y: base.y + offset.y
        };

    },

    _findPoints: function (center, radius, angle) {
        let angleOffset = Math.PI * angle / 180,
            alpha = Math.PI / 6 + angleOffset,
            beta = Math.PI / 6 - angleOffset,
            gamma = angleOffset;

        let p0 = {
                x: center.x - radius * Math.sin(alpha),
                y: center.y - radius * Math.cos(alpha)
        },
            p1 = {
                x: center.x + radius * Math.sin(beta),
                y: center.y - radius * Math.cos(beta)
        },
            p2 = {
                x: center.x + radius * Math.cos(gamma),
                y: center.y - radius * Math.sin(gamma)
        },
            p3 = {
                x: 2 * center.x - p0.x,
                y: 2 * center.y - p0.y
        },
            p4 = {
                x: 2 * center.x - p1.x,
                y: 2 * center.y - p1.y
        },
            p5 = {
                x: 2 * center.x - p2.x,
                y: 2 * center.y - p2.y
        };
        return [p0, p1, p2, p3, p4, p5];
    },

    _drawHex: function (ctx, lineColor, fillColor) {
        // let points = this._findPoints(center, radius, angle);

        let styleContext = {
            fillStyle: ctx.fillStyle,
            strokeStyle: ctx.strokeStyle
        };
        _.extend(ctx, {
            fillStyle: fillColor,
            strokeStyle: lineColor
        });

        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        this.points.forEach(function (point) {
            ctx.lineTo(point.x, point.y);
        });
        ctx.closePath();

        ctx.fill();
        ctx.stroke();

        _.extend(ctx, styleContext);
    },

    state_dependent: {
        close: {
            drawContent: function() {}
        },

        open: {
            color: 'white',
            drawContent: function() {
                if (this.model.get('isBomb')) {
                    this.ctx.drawImage(
                        document.getElementById('game-bomb'),
                        this.center.x - this.radius,
                        this.center.y - this.radius,
                        2*this.radius,
                        2*this.radius
                    );
                    this.model.trigger('bomb', this.model);
                }
                else {
                    let sections = this.model.get('neighbours').where({isBomb: true}).length;
                    if (sections) {
                        this._drawSections(sections);
                    }
                    else {
                        this.model.trigger('notbomb', this.model);
                    }
                }
            },

            _drawSections: function (sections) {
                let sectionColors = ['#C47F7F', '#C46262', '#C44E4E', '#C43B3B', '#C42727', '#C40000'];
                let _points = this.points.concat(this.points[0]);

                let styleContext = {
                    fillStyle: ctx.fillStyle,
                    strokeStyle: ctx.strokeStyle
                };

                for (let i = 0; i < sections; ++i) {
                    _.extend(ctx, {
                        fillStyle: sectionColors[i],
                        strokeStyle: 'black'
                    });
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.center.x, this.center.y);
                    [_points[i], _points[i+1]].forEach(function (point) {
                        this.ctx.lineTo(point.x, point.y);
                    }.bind(this));
                    this.ctx.closePath();
                    this.ctx.fill();
                    this.ctx.stroke();
                }
                _.extend(ctx, styleContext);
            }
        }
    }
});