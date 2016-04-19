let canvas = document.getElementById('game-canvas');
let ctx = canvas.getContext('2d');
ctx.center = {
    x: ctx.canvas.clientWidth / 2,
    y: ctx.canvas.clientHeight / 2
};
var a = new FieldView({
    model: new FieldModel({layers: 10, bombs: 50}),
    ctx: ctx,
    radius: 50
});