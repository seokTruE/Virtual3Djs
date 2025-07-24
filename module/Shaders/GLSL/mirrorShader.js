const vertexShaderSource = `
attribute vec4 a_position;
uniform mat4 u_lightMatrix4;
uniform mat4 u_viewMatrix4;
uniform mat4 u_worldMatrix4;

void main() {
    gl_Position = u_lightMatrix4 * u_viewMatrix4 * u_worldMatrix4 * a_position;
}`;
const fragmentShaderSource = `void main() {}`;

export { vertexShaderSource, fragmentShaderSource }