class BaseView {

    drawBackground(handler) {
        handler.fill('#333333');
    }

    doFrame(input, handler, loop) {
        // abstract
    }

    onRefit(handler) {
        // abstract
    }

}