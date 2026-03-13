import { Application, Container, Graphics, TextStyle, Text } from "pixi.js";

function createTextWithBackground(value: string, style: TextStyle, center: boolean) {
    const wrapper = new Container();
    const text = new Text({ text: value, style });

    if (center) text.anchor.set(0.5);

    const padX = 12;
    const padY = 6;
    const background = new Graphics();
    background.roundRect(0, 0, text.width + (padX * 2), text.height + (padY * 2), 40);
    background.fill({ color: 0x000000, alpha: 0.9 });

    if (center) {
        background.position.set((-text.width / 2) - padX, (-text.height / 2) - padY);
    } else {
        text.position.set(padX, padY);
    }

    wrapper.addChild(background);
    wrapper.addChild(text);
    return wrapper;
}

export function createCrossFadingTextDisplay(app: Application, style: TextStyle, center = true) {
    const container = new Container();
    app.stage.addChild(container);

    let current: Container | null = null;
    let next: Container | null = null;
    let transitioning = false;

    async function changeText(value: string, duration = 30) {
        if (transitioning) throw new Error("Cannot change text during transition!");
        transitioning = true;

        next = createTextWithBackground(value, style, center);
        next.alpha = 0;
        container.addChild(next);

        let elapsed = 0;
        await new Promise<void>(resolve => {
            app.ticker.add(function fade(ticker) {
                elapsed += ticker.deltaTime;
                const t = Math.min(elapsed / duration, 1);

                next!.alpha = t;
                if (current) current.alpha = 1 - t;

                if (t >= 1) {
                    app.ticker.remove(fade);

                    if (current) {
                        container.removeChild(current);
                        current.destroy();
                    }

                    current = next;
                    next = null;
                    transitioning = false;
                    resolve();
                }
            })
        })
    }

    function centerText(horizontal = true, vertical = true, offset?: { x: number, y: number }) {
        if (horizontal) container.x = (app.screen.width / 2) + (offset?.x ?? 0);
        if (vertical)   container.y = (app.screen.height / 2) + (offset?.y ?? 0);
    }

    return { container, changeText, centerText }
}
