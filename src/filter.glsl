in vec2 vTextureCoord;
in vec4 vColor;

uniform sampler2D uTexture;
uniform float uTime;

uniform vec4 filterArea; 

float rand(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

void main(void) {
    vec2 uvs = vTextureCoord.xy;

    float pain = rand(uvs * filterArea.xy);

    vec4 color = texture2D(uTexture, uvs);

    color.r = uvs.y + sin(uTime);

    gl_FragColor = color;

}

// I will devour the next thing that moves.