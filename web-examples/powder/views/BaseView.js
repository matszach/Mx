class BaseView {

    constructor() {
        this.onCreate();
    }

    onCreate() {
        // abstract
    }

    drawBackground(handler) {
        handler.fill('#222222');
    }

    doFrame(input, handler, loop) {
        // abstract
    }

    onRefit(handler) {
        // abstract
    }

}