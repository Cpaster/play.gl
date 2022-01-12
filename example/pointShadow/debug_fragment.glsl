#ifdef GL_ES
precision mediump float;
#endif

uniform samplerCube depthMap;

uniform vec3 lightPos;

varying vec3 FragPos;

// required when using a perspective projection matrix
// float LinearizeDepth(float depth)
// {
//     float z = depth * 2.0 - 1.0; // Back to NDC 
//     return (2.0 * near_plane * far_plane) / (far_plane + near_plane - z * (far_plane - near_plane));	
// }

void main()
{
  vec3 I = normalize(FragPos - lightPos);
  float depthValue = textureCube(depthMap, I).r;
  // gl_FragColor = vec4(vec3(LinearizeDepth(depthValue) / far_plane), 1.0); // perspective
  gl_FragColor = vec4(vec3(depthValue), 1.0); // orthographic 
}