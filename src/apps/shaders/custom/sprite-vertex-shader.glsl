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

#define NAME sprite-vertex-shader

in vec3 position;
in vec3 normal;

//out vec3 v_normal;

void main() {
	vec4 pos = vec4(position, 1.0);
	vec4 model_view_pos = VIEW * MODEL * pos;

//	v_normal = (MODEL_INVERSE_TRANSPOSE * vec4(normal, 0.0)).xyz;

	gl_Position = PROJECTION * model_view_pos;
//	gl_Position = model_view_pos;
//	gl_Position = pos;
	gl_PointSize = 32.0;
}
