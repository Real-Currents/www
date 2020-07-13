/* The following builtins are prepended to
 * every custom vertex shader in @svelte/gl:
 */
/* start builtins */
//precision highp float;
//
//uniform mat4 MODEL;
//uniform mat4 PROJECTION;
//uniform mat4 VIEW;
//uniform mat4 MODEL_INVERSE_TRANSPOSE;
//
//uniform vec3 CAMERA_WORLD_POSITION;
//
//struct PointLight {
//	vec3 location;
//	vec3 color;
//	float intensity;
//// TODO fall-off etc
//};
//
//uniform PointLight POINT_LIGHTS[NUM_LIGHTS];
/* end builtins */

#define NAME normal-selected-txt-vertex-shader

in vec3 position;

in vec3 normal;

in vec2 uv; // available when texture maps (bumpmap, colormap, ...) are used on object

out vec3 v_normal;

out vec2 v_textureCoords;

void main() {

	v_normal = normal;

	v_textureCoords = uv;

	gl_Position = PROJECTION * VIEW * MODEL * vec4(position, 1.0);
}
