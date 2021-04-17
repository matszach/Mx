class Game {
    
    static view;
    static handler;
    static input;

    static toView(key, ...args) {
        Game.view = Game._getView(key, ...args);
        Game.view.onRefit(Game.handler);
        return Game;
    }

    static _getView(key, ...args) {
        switch(key) {
            case 'WorkArea': return new WorkAreaView(...args);
            case 'Menu': default: return new MenuView(...args);
        }
    }

}