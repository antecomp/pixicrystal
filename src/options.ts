import { Application, Container } from "pixi.js";
import createDialogueRunner from "./dialogue/runner";
import { createTextWithBackground } from "./text";
import { TEXT_STYLE } from "./main";

function getOptionSlots(count: number, radius: number, gapX = 150, gapY = 90) {
    const sideX = radius + gapX;

    switch (count) {
        case 1:
            return [{ x: -sideX, y: 0 }];

        case 2:
            return [
                { x: -sideX, y: 0 },
                { x: sideX, y: 0 },
            ];

        case 3:
            return [
                { x: -sideX, y: 0 },
                { x: sideX, y: -gapY / 2 },
                { x: sideX, y: gapY / 2 },
            ];

        case 4:
            return [
                { x: -sideX, y: -gapY / 2 },
                { x: -sideX, y: gapY / 2 },
                { x: sideX, y: -gapY / 2 },
                { x: sideX, y: gapY / 2 },
            ];

        default:
            throw new Error("Too many options to render with this layout!");
    }
}


export default function createOptionsOverlay(app: Application, ballRadius: number) {
    const con = new Container();

    app.stage.addChild(con);

    function centerContainer() {
        con.x = app.screen.width / 2;
        con.y = app.screen.height / 2
    }

    // Please make a type definition for this, what am I looking at?
    function render(optionData: ReturnType<(ReturnType<typeof createDialogueRunner>['proceed'])>) {
        con.removeChildren();

        if (!optionData) return;

        const layout = getOptionSlots(optionData.length, ballRadius);

        optionData.forEach((op, i) => {
            const text = createTextWithBackground(op.text, TEXT_STYLE, true);
            text.eventMode = 'static';
            text.cursor = 'pointer'
            text.x = layout[i].x;
            text.y = layout[i].y;
            con.addChild(text);

            text.on('pointertap', () => {
                render(op.run())
            });
        });


    }

    centerContainer();
    return { con, centerContainer, render }
}
