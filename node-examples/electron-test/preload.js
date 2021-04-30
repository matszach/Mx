const Mx = require("./mx-0.15.1")

window.addEventListener('DOMContentLoaded', () => {
    const handler = Mx.Draw.CanvasHandler.create().enableDrag().enableZoom();
    const input = Mx.Input.create(handler);
    const rect = Mx.Geo.Rectangle.create(50, 50, 100, 100, 'red').enableDrag();
    const sheet = Mx.SpriteSheet.create('sprites.png', 64, 64, 0);
    const sprite = sheet.get(0, 0).setDrawnSize(100).setAlpha(0.7).place(200, 200).enableDrag();
    const loop = Mx.It.Loop.start(60, loop => {
        handler.clear();
        handler.grid(20, 20)
        handler.draws(rect, sprite);
        rect.listen();
        sprite.listen();
        handler.listen();
    });
})
