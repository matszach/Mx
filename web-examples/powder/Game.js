class Game {

    static view;

    static toView(key, ...args) {
        Game.view = Game._getView(key, ...args);
        return Game;
    }

    static _getView(key, ...args) {
        switch(key) {
            case 'WorkArea': return new WorkAreaView(...args);
            case 'Menu': default: return new MenuView(...args);
        }
    }

}