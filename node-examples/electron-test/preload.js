const Mx = require("./mx-0.15.1")

window.addEventListener('DOMContentLoaded', () => {
    const handler = Mx.Draw.CanvasHandler.create().enableDrag().enableZoom();
    const input = Mx.Input.create(handler);
    const rect = Mx.Geo.Rectangle.create(50, 50, 100, 100, 'red').enableDrag();
    const loop = Mx.It.Loop.start(60, loop => {
        handler.clear();
        handler.grid(20, 20)
        handler.draw(rect);
        rect.listen();
        handler.listen();
    });
})
