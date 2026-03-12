import 'pixi.js/advanced-blend-modes';

import initializeApp from './init';
import createFacesContainer from './faces';
import createCrystalBallOverlay from './ball';
import { createDisplacementFilter, createNoiseFilter } from './filters';
import { TextStyle } from 'pixi.js';
import { createCrossFadingTextDisplay } from './text';

const textStyle = new TextStyle({
    fontFamily: ['Georgia', 'serif'],
    fontSize: 36,
    fill: 0xffffff,
    align: 'center'
});

async function main() {
  const app = await initializeApp();

  const face = await createFacesContainer(app);
  face.centerContainer();
  face.changeTo('smile');

  (window as any)['yeah'] = face.changeTo;

  const noiseFilter = createNoiseFilter(app);

  const displacementFilter = createDisplacementFilter(app, 4);

  face.container.filters = [displacementFilter, noiseFilter];

  const crystalBall = createCrystalBallOverlay(app, face.container.height / 2);
  crystalBall.ball.filters = [displacementFilter, noiseFilter]

  const {container: textContainer, changeText} = createCrossFadingTextDisplay(app, textStyle, true);
  changeText("Initial Text");
  setTimeout(() => changeText("Jeg tilintetgjør haterne mine ved å bli venn med dem."), 2000);
  textContainer.x = app.screen.width / 2;
  textContainer.y = 50;

  textContainer.filters = [noiseFilter]

  app.renderer.on('resize', () => {
    face.centerContainer();
    crystalBall.redraw();
  });
}

main();