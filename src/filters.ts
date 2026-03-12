import { Application, Filter, GlProgram } from "pixi.js";
import filterFrag from './filter.glsl';
import passVert from './passvert.glsl';

export function createMainFilter(app: Application) {
    const filter = new Filter({
        glProgram: new GlProgram({
            fragment: filterFrag,
            vertex: passVert
        }),
        resources: {
            timeUniforms: {
                uTime: { value: 0.0, type: 'f32' },
            }
        }
    });

    app.ticker.add(ticker => {
        filter.resources.timeUniforms.uniforms.uTime += 0.04 * ticker.deltaTime;
    });

    return filter;
}

export function createDisplacementFilter(app: Application) {
    
}