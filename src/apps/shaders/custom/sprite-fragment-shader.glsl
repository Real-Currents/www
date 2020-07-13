/* The following builtins are prepended to
 * every custom fragment shader in @svelte/gl:
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

#define NAME sprite-fragment-shader

uniform vec3 color;

#ifdef has_alpha
uniform float alpha;
#endif

uniform sampler2D uTexture;

//in vec3 v_normal;

out mediump vec4 fragColor;


void main () {
//	vec3 normal = normalize(v_normal);

	// calculate normal from texture coordinates
	vec3 N;
	N.xy = gl_PointCoord * 2.0 - vec2(1.0);
	float mag = dot(N.xy, N.xy);
	if(mag > 1.0) discard; // kill pixels outside circle

	// apply texture
	fragColor = texture(uTexture, gl_PointCoord);
	fragColor.rgb = fragColor.rgb * color;

	#ifdef has_alpha
	fragColor.a *= alpha;
	#endif
}
