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

#define NAME cubemap-fragment-shader

uniform samplerCube uTexture;

in vec3 v_normal;

in vec3 v_view_position;

in vec2 v_textureCoords;

out mediump vec4 fragColor;

void main () {
	vec3 normal = normalize(v_normal);

	vec3 staticCameraPosition = vec3(0.0, 0.0, 0.0);
	vec3 eyeToSurfaceDir = normalize(v_view_position - staticCameraPosition);
	vec3 staticDirection = reflect(eyeToSurfaceDir, normal);

	fragColor = texture(uTexture, staticDirection); // TEXURE_CUBE_MAP
}
