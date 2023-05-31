// Don't need some values (commented) if using (not raw) shader material

// // Transformation matrices - see openGL documentation
// uniform mat4 projectionMatrix;
// uniform mat4 viewMatrix;
// uniform mat4 modelMatrix;

// attribute vec3 position;
// // Random variable set in script to 0 or 1 for each pt
// attribute float aRandom;
// attribute vec2 uv;

uniform vec2 uFrequency;
uniform float uTime;

// Varyings to be sent to fragment
// varying float vRandom;
varying vec2 vUv;
varying float vElevation;

void main()
{
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    float elevation = sin(modelPosition.x * uFrequency.x - uTime) * 0.1;
    elevation += sin(modelPosition.y * uFrequency.y) * 0.1;

    modelPosition.z += elevation;
    // modelPosition.z += aRandom * 0.1;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;

    // Pass varyings to fragment shader
    // vRandom = aRandom;
    vUv = uv;
    vElevation = elevation;
}