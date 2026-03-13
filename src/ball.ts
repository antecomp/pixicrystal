import { Application, Circle, Graphics } from "pixi.js";

export default function createCrystalBallOverlay(app: Application, initialRadius: number) {
    const cover = new Graphics();
    const ball = new Graphics();

    app.stage.addChild(cover, ball);

    function redraw(radius = initialRadius) {
        const cx = app.screen.width / 2;
        const cy = app.screen.height / 2;

        cover
            .clear()
            .rect(0, 0, app.screen.width, app.screen.height)
            .fill(0x000000)
            .circle(cx, cy, radius)
            .cut();

        ball
            .clear()
            .circle(0, 0, radius)
            .stroke({width: 5, color: 0xffffff});

        ball.position.set(cx, cy);

        ball.eventMode = 'static';
        ball.cursor = 'pointer';
        ball.hitArea = new Circle(0, 0, radius);
    }

    function destroy() {
        app.stage.removeChild(cover, ball);
    }

    redraw();

    return {cover, ball, redraw, destroy}
}
