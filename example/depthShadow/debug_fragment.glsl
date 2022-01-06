#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D depthMap;
uniform float near_plane;
uniform float far_plane;

varying vec2 TexCoords;

// required when using a perspective projection matrix
float LinearizeDepth(float depth)
{
    float z = depth * 2.0 - 1.0; // Back to NDC 
    return (2.0 * near_plane * far_plane) / (far_plane + near_plane - z * (far_plane - near_plane));	
}

void main()
{
  float depthValue = texture2D(depthMap, TexCoords).r;
  // gl_FragColor = vec4(vec3(LinearizeDepth(depthValue) / far_plane), 1.0); // perspective
  gl_FragColor = vec4(vec3(depthValue), 1.0); // orthographic 
}