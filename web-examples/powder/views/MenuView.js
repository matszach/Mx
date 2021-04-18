class MenuView extends BaseView {

    drawTitle(handler) {
        handler.write(
            handler.canvas.width/2 - 125,
            200, 'PowderJS', '#ffffff',  64
        );
    }

    onCreate() {
        this.buttons = []; 
        this.texts = [];
        [[200, 200], [300, 200], [400, 200], [400, 400], [600, 400], [800, 400]].forEach((v, i) => {
            const button = Mx.Geo.Rectangle.create(0, 250 + i * 75, 200, 50, '#111111', '#ffffff', 1);
            const text = Mx.Text.create(0, 288 + i * 75, `${v[0]}x${v[1]}`, '#ffffff',  42, 'pixel');
            button.on('over', () => {
                document.body.style.cursor = 'pointer';
                button.backgroundColor = '#222222';
            }).on('out', () => {
                document.body.style.cursor = 'default';
                button.backgroundColor = '#111111';
            }).on('down', () => {
                button.backgroundColor = '#161616';
            }).on('up', () => {
                button.backgroundColor = '#222222';
                document.body.style.cursor = 'default';
                Game.toView('WorkArea', ...v);
            });
            this.buttons.push(button);
            this.texts.push(text);
        }, this);
    }

    drawButtons(handler) {
        this.buttons.forEach(b => {
            b.listen();
            handler.draw(b);
        });
        this.texts.forEach(t => {
            handler.draw(t);
        });
    }

    onRefit(handler) {
        this.buttons.forEach(b => {
            b.x = (handler.canvas.width - b.width)/2;
        });
        this.texts.forEach(t => {
            t.x = (handler.canvas.width)/2 - 71;
        });
    }

    doFrame(input, handler, loop) {
        this.drawBackground(handler);
        this.drawTitle(handler);
        this.drawButtons(handler);
    }

}