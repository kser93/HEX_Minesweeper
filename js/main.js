let canvas = document.getElementById('game-canvas');
let ctx = canvas.getContext('2d');
ctx.center = {
    x: ctx.canvas.clientWidth / 2,
    y: ctx.canvas.clientHeight / 2
};
var a = new FieldView({
    model: new FieldModel,
    ctx: ctx,
    radius: 50,
    layerColors: ['#8778C4', '#78C4AD', '#C4788F', '#B5C478', '#78AEC4']
});