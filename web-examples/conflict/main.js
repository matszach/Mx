Mx.Game.create({
    onCreate() {
        // setup
        this.unitsSheet = Mx.SpriteSheet.create('./units.png', 64, 64, 4);
        this.projectilesSheet = Mx.SpriteSheet.create('./projectiles.png', 64, 64, 4);
        this.resourcesSheet = Mx.SpriteSheet.create('./resource.png', 64, 64, 4);
        this.background = Mx.Geo.Rectangle.create(-400, -300, 800, 600, '#101020', '#202040', 2);
        // resources

        // teams
        this.redBase = this.unitsSheet.get(0, 2).place(-300, 0).setShadow('#ff0000', 5).setDrawnSize(32, 32);

        this.greenBase = this.unitsSheet.get(0, 2).place(300, 0).setShadow('#00ff00', 5).setDrawnSize(32, 32);

    },
    onResize() {
        this.handler.center(0, 0).scaleToSize(820, 620);
    },
    onUpdate() {
        this.handler.handles([
            this.background,
            this.redBase,
            this.greenBase
        ]);
    }
});