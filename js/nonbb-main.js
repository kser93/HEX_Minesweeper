/**
 * Created by Сергей on 02.04.2016.
 */

//-----------------------------------------------------------------------

function drawHex(ctx, xc, yc, rEx, angle, lineColor, fillColor) {

    var alpha = Math.PI / 6 + Math.PI * angle / 180;
    var beta = Math.PI / 6 - Math.PI * angle / 180;
    var gamma = Math.PI * angle / 180;

    var x0 = xc - rEx * Math.sin(alpha);
    var y0 = yc - rEx * Math.cos(alpha);
    var x1 = xc + rEx * Math.sin(beta);
    var y1 = yc - rEx * Math.cos(beta);
    var x2 = xc + rEx * Math.cos(gamma);
    var y2 = yc - rEx * Math.sin(gamma);

    var x3 = 2 * xc - x0;
    var y3 = 2 * yc - y0;
    var x4 = 2 * xc - x1;
    var y4 = 2 * yc - y1;
    var x5 = 2 * xc - x2;
    var y5 = 2 * yc - y2;

    ctx.fillStyle = fillColor;
    ctx.strokeStyle = lineColor;

    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.lineTo(x4, y4);
    ctx.lineTo(x5, y5);
    ctx.closePath();

    ctx.fill();
    ctx.stroke();
}


let HexModel = class HexModel{

    constructor(options) {

        let determineLayer = function(hexNum) {
            let layerNum = Math.ceil(
                (Math.sqrt((4*hexNum+1)/3) - 1) / 2
            ),
                layerOffset = hexNum - (layerNum - 1) * layerNum * 3;
            return {
                num: layerNum,
                offset: layerOffset
            };
        };

        let determineGroup = function (hexNum) {
            let layer = determineLayer(hexNum),
                groupNum = Math.ceil(layer.offset / layer.num) - 1,
                groupOffset = (layer.offset - 1) % layer.num;
            return {
                num: groupNum,
                offset: groupOffset
            };
        };

        this.id = options.num;
        this.layer = determineLayer(options.num);
        this.group = determineGroup(options.num);
        this.isBomb = options.isBomb;
        return this;
    }
};

let FieldModel = class FieldModel {

    constructor(options) {

        let numberOfCells = function (layers) {
            return layers * (layers + 1) * 3;
        };

        let getRandomInt = function(min, max) {
            return Math.floor(Math.random() * (max - min)) + min;
        };

        this.layers = options.layers;
        this.cells = new Array(numberOfCells(this.layers) + 1);

        let isBomb = new Array(this.cells.length).fill(false);
        for (let i = 0; i < options.bombs; ++i) {
            let bombIndex = getRandomInt(0, this.cells.length);
            while (isBomb[bombIndex]) {
                bombIndex = getRandomInt(0, this.cells.length);
            }
            isBomb[bombIndex] = true;
        }

        for (let i = 0; i < this.cells.length; ++i) {
            this.cells[i] = new HexModel({
                num: i,
                isBomb: isBomb[i]
            });
        }
        return this;
    }
};

let FieldView = class FieldView {

    constructor(options) {

        let determineCenter = function(hex) {
            if (hex.id == 0) {
                return {
                    x: this.center.x,
                    y: this.center.y
                }
            }
            let groupAngles = [0, Math.PI/3, 2*Math.PI/3, Math.PI, -2*Math.PI/3, -Math.PI/3];
            let angleBase = groupAngles[hex.group.num];
            let base = {
                x: this.center.x + this.radius * hex.layer.num * Math.sin(angleBase) * Math.sqrt(3),
                y: this.center.y - this.radius * hex.layer.num * Math.cos(angleBase) * Math.sqrt(3)
            };
            let angleOffset = groupAngles.concat(groupAngles)[hex.group.num+2];
            let offset = {
                x: this.radius * hex.group.offset * Math.sin(angleOffset) * Math.sqrt(3),
                y: -this.radius * hex.group.offset * Math.cos(angleOffset) * Math.sqrt(3)
            };

            return {
                x: base.x + offset.x,
                y: base.y + offset.y
            };
        }.bind(this);

        this.model = options.model;
        this.ctx = options.ctx;
        this.center = {
            x: ctx.canvas.clientWidth / 2,
            y: ctx.canvas.clientHeight / 2
        };
        this.layerColors = options.layerColors;
        this.radius = options.radius;
        this.model.cells.forEach(function (hex) {
            hex.radius = options.radius;
            hex.color = options.layerColors[hex.layer.num];
            hex.center = determineCenter(hex);
        });
        return this;
    }

    render() {
        // console.log(arguments);
        let cells = arguments;
        if (arguments.length == 0) {
            cells = this.model.cells;
        }
        for (let hex of cells) {
            drawHex(this.ctx, hex.center.x, hex.center.y, this.radius, 0, 'black', hex.color);
        }
    }

    determineCell(e) {
        let mousePos = {
            x: e.layerX,
            y: e.layerY
        };
        let minDist = {
                x: this.radius,
                y: this.radius
            },
            clickedHex = null;
        this.model.cells.forEach(function (hex) {
            let dist = {
                x: hex.center.x - mousePos.x,
                y: hex.center.y - mousePos.y
            };
            if ( (Math.pow(dist.x, 2) + Math.pow(dist.y, 2)) < (Math.pow(minDist.x, 2) + Math.pow(minDist.y, 2)) ) {
                minDist = dist;
                clickedHex = hex;
            }
        });
        return clickedHex;
    }
};

let canvas = document.getElementById('game-canvas');
let ctx = canvas.getContext('2d');
let events = {
    activate: new CustomEvent('activate')
};

var field = new FieldView({
    model: new FieldModel({
        layers: 4,
        bombs: 10
    }),
    ctx: ctx,
    layerColors: ['#8778C4', '#78C4AD', '#C4788F', '#B5C478', '#78AEC4'],
    radius: 50
});

window.addEventListener(events.activate.type, function (e) {
    console.log(field.determineCell(e));
});
canvas.addEventListener('click', function (e) {
    events.activate.layerX = e.layerX;
    events.activate.layerY = e.layerY;
    window.dispatchEvent(events.activate);
});

field.render();