Game.handler = Mx.Draw.CanvasHandler.create();
Game.handler.pix.disableAlphaBlend();
Game.input = Mx.Input.init(Game.handler);
Game.toView('Menu');
Game.handler.onResize(handler => Game.view.onRefit(handler));
Mx.It.Loop.start(60, loop => {
    Game.view.doFrame(Game.input, Game.handler, loop);
});