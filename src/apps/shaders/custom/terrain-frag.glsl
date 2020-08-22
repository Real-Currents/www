/* The following builtins are prepended to
 * every custom fragment shader in @sveltejs/gl:
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

#define NAME terrain-frag

#define C_ZERO 0.0
#define C_QUARTER 0.25
#define C_HALF 0.5
#define C_ONE 1.0

in vec3 v_directional_light_shading;

in vec3 v_normal;

in vec2 v_textureCoords;

/* Varying for this shader: */
out mediump vec4 fragColor;

void main () {
//    fragColor = vec4(color, 1.0);
    fragColor = vec4(v_directional_light_shading * color, C_ONE);
    #if defined(has_colormap)
    fragColor = vec4(v_directional_light_shading * texture(colormap, v_textureCoords).rgb, C_ONE);
    #endif

    if (alpha == C_ZERO || (C_ZERO <= alpha && alpha <= C_ONE)) {
        fragColor.a *= alpha;
    }
}
