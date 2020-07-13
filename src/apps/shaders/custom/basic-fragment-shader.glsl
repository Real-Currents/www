/* The following builtins are prepended to
 * every custom fragment shader in @svelte/gl:
 */
/* start builtins */
//
//precision highp float;
//
//struct DirectionalLight {
//	vec3 direction;
//	vec3 color;
//	float intensity;
//};
//
//struct PointLight {
//	vec3 location;
//	vec3 color;
//	float intensity;
//// TODO fall-off etc
//};
//
//uniform vec3 AMBIENT_LIGHT;
//uniform DirectionalLight DIRECTIONAL_LIGHTS[NUM_LIGHTS];
//uniform PointLight POINT_LIGHTS[NUM_LIGHTS];
/* end builtins */

/* Uniforms supplied by Svelte materials: */
uniform vec3 color;
uniform vec3 emissive;
uniform float alpha;
uniform float specularity;
uniform sampler2D bumpmap;
uniform sampler2D colormap;
uniform sampler2D emissivemap;
uniform sampler2D specularitymap;
uniform vec3 FOG_COLOR;
uniform float FOG_DENSITY;

in vec3 v_normal;

in vec2 v_textureCoords;

/* Varying for this shader: */
out mediump vec4 fragColor;

void main () {
	fragColor = vec4(color, 1.0);

	if (alpha == 0.0 || (0.0 <= alpha && alpha <= 1.0)) {
		fragColor.a *= alpha;
	}
}
