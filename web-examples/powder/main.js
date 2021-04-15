Game.toView('WorkArea', 300, 200);
const handler = Mx.Draw.CanvasHandler.create();
const input = Mx.Input.init();
handler.onResize(handler => Game.view.onRefit(handler));
Mx.It.Loop.start(60, loop => {
    Game.view.doFrame(input, handler, loop);
});