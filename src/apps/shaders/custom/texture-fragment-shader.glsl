/* The following builtins are prepended to
 * every custom fragment shader in @sveltejs/gl:
 */
/* start builtins */
//#extension GL_OES_standard_derivatives : enable

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

#define NAME texture-fragment-shader

uniform vec3 color;

#ifdef has_alpha
uniform float alpha;
#endif

uniform sampler2D colormap;

in vec3 v_normal;

in vec2 v_textureCoords;

out mediump vec4 fragColor;

void main () {
	vec3 normal = normalize(v_normal);

	fragColor = texture(colormap, v_textureCoords);

	#ifdef has_alpha
	fragColor.a *= alpha;
	#endif
}
