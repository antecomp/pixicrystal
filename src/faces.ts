import { Application, Texture } from 'pixi.js';

import { createCrossfadingTextureDisplay, loadImageAsTexture } from './sprite';

const faceModules = import.meta.glob<string>(
    './assets/faces/*.{png,jpg,jpeg,webp,avif,gif,svg}',
    { eager: true, import: 'default' }
);

export const FACE_SOURCES: Record<string, string> = Object.fromEntries(
    Object.entries(faceModules).map(([path, url]) => {
        const fileName = path.split('/').pop()?.replace('.png', '')!;
        return [fileName, url];
    })
);

console.log(FACE_SOURCES);

export type FaceChangeFn = (to: string) => Promise<void>;

export default async function createFacesContainer(app: Application) {
    const FACE_TEXTURES: Record<string, Texture> = {};

    for (const [key, src] of Object.entries(FACE_SOURCES)) {
        FACE_TEXTURES[key] = await loadImageAsTexture(src);
    }

    const {container, changeTexture} = await createCrossfadingTextureDisplay(app);

    function changeTo(face: string) {
        return changeTexture(FACE_TEXTURES[face]);
    }

    function centerContainer() {
        container.x = app.screen.width / 2;
        container.y = app.screen.height / 2;
    }

    return {container, changeTo, centerContainer}
}
