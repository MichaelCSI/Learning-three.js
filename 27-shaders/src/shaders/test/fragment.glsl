// Specify precision of shader - don't need for normal shader material
// precision mediump float;

// uniform vec3 uColor;
uniform sampler2D uTexture;

// Take varyings from vertex shader
// varying float vRandom;
varying vec2 vUv;
varying float vElevation;

void main()
{
    vec4 textureColor = texture2D(uTexture, vUv);
    // Change color intensity based on elevation - "shadows"
    textureColor.rgb *= vElevation * 2.0 + 1.0;
    gl_FragColor = textureColor;
}