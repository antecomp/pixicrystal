import 'pixi.js/advanced-blend-modes';

import initializeApp from './init';
import createFacesContainer from './faces';
import createCrystalBallOverlay from './ball';
import { createDisplacementFilter, createNoiseFilter } from './filters';
import { TextStyle } from 'pixi.js';
import { createCrossFadingTextDisplay } from './text';
import createDialogueRunner, { DialogueNode } from './dialogue';
import compileDialogue, { traceCompiledDialogue } from './dialogue-parse/compileDialogue';

import input from './dialogues/test.txt?raw'

const CRYSTAL_BALL_RADIUS = 290;

const TEXT_STYLE = new TextStyle({
  fontFamily: ['Georgia', 'serif'],
  fontSize: 28,
  fill: 0xffffff,
  align: 'center',
  wordWrap: true,
  wordWrapWidth: CRYSTAL_BALL_RADIUS * 1.25
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

  const crystalBall = createCrystalBallOverlay(app, CRYSTAL_BALL_RADIUS);
  crystalBall.ball.filters = [displacementFilter, noiseFilter];

  const responseText = createCrossFadingTextDisplay(app, TEXT_STYLE, true);

  const dialogueRunner = createDialogueRunner(root as DialogueNode, { changeFace: face.changeTo, changeText: responseText.changeText });

  // Gross - update this.
  crystalBall.ball.on('pointertap', () => {
    const optionData = dialogueRunner.proceed();
    const bc = document.querySelector('#test_button_con')!;
    bc.innerHTML = "";
    if (optionData) {
      optionData.forEach((op, i) => {
        const btn = document.createElement('button');
        btn.onclick = () => {op.run(); bc.innerHTML = ""};
        btn.textContent = op.text;
        bc.appendChild(btn);
      })
    }
  });

  responseText.centerText(true, true, { x: 0, y: CRYSTAL_BALL_RADIUS / 1.5 });

  responseText.container.filters = [noiseFilter]

  app.renderer.on('resize', () => {
    face.centerContainer();
    crystalBall.redraw();
    responseText.centerText(true, true, { x: 0, y: CRYSTAL_BALL_RADIUS / 1.5 })
  });
}

const root = compileDialogue(input);
traceCompiledDialogue(root);

main();
