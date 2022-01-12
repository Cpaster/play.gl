#ifdef GL_ES
precision mediump float;
#endif

uniform float far_plane;
uniform vec3 lightPos;

varying vec3 FragPos;

void main()
{
  float depth_Val = length(FragPos - lightPos) / far_plane;
  gl_FragColor = vec4(depth_Val, depth_Val, depth_Val, 1.0);
  // gl_FragDepth = gl_FragCoord.z;
  // gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
}