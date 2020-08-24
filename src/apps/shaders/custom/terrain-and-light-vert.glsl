/* The following builtins are prepended to
 * every custom vertex shader in @sveltejs/gl:
 */
/* start builtins */
//
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

#define NAME terrain-vert

#define C_ZERO 0.0
#define C_QUARTER 0.25
#define C_HALF 0.5
#define C_ONE 1.0

#define DISPLACE_MULTIPLY 0.5

// texture containing elevation data
//uniform sampler2D heightMap;
//uniform sampler2D bumpmap;
uniform sampler2D normalmap;

uniform float height_adjustment;

in vec3 position;

in vec3 normal;

// available when texture maps are used
// (bumpmap, colormap, normalmap...)
in vec2 uv;

out vec3 v_normal;

out vec2 v_textureCoords;

uniform vec3 light_direction; // normalized direction in eye
uniform vec3 light_ambient_color;
uniform vec3 light_diffuse_color;
uniform vec3 light_specular_color;
uniform float material_specular_exponent;

out vec3 v_directional_light_shading;

vec3 directional_light_shading (vec3 normal) {
	vec3 computed_shade = vec3(C_ZERO, C_ZERO, C_ZERO);
	vec3 halfplane_vector = vec3(C_ZERO, C_ONE, C_ZERO);
	vec3 nlight_direction = normalize(light_direction); // normalized direction in eye
	vec3 nlight_halfplane = normalize(nlight_direction + halfplane_vector); // normalized half-plane vector
	float ndotL; // dot product of normal & light direction
	float ndotH; // dot product of nomral and & half-plane vector

	ndotL = max(C_ZERO, dot(normal, nlight_direction));
	computed_shade += vec3(
		(light_ambient_color.x * (C_ONE - C_QUARTER)), (light_ambient_color.y * (C_ONE - C_QUARTER)), (light_ambient_color.z * (C_ONE - C_QUARTER))
	) + vec3(C_QUARTER, C_QUARTER, C_QUARTER);
	computed_shade += ndotL * light_diffuse_color * vec3(C_ONE, C_ONE, C_ONE);

	// The resolution of the vertex shader is not fine enough
	// for specular lighting, but this is the equation
	ndotH = max(C_ZERO, dot(normal, nlight_halfplane));
	if (ndotH > C_ZERO) {
		computed_shade += pow(ndotH, material_specular_exponent) * vec3(C_ONE, C_ONE, C_ONE) * light_specular_color;
	}

	return computed_shade;
}

void main() {
	vec3 displacement = texture(normalmap, uv).rgb;

	vec3 displace_along_verticle = normal * displacement * (DISPLACE_MULTIPLY * height_adjustment);

	vec3 displaced_position = position + displace_along_verticle;

	vec3 displace_along_normal = vec3(normal * displacement);

	v_normal = DISPLACE_MULTIPLY * normal;

	#if defined(has_normalmap)
	v_normal = DISPLACE_MULTIPLY * displace_along_normal;
	#endif

	v_textureCoords = uv;

	v_directional_light_shading = directional_light_shading((MODEL_INVERSE_TRANSPOSE * vec4(v_normal, C_ZERO)).xyz);

	gl_Position = PROJECTION * VIEW * MODEL * vec4(displaced_position, C_ONE);
}
