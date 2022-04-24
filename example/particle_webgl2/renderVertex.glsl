#version 300 es
precision mediump float;

in vec2 i_Position;

in vec2 i_Coord;
in vec2 i_TexCoord;

in float i_Age;
in float i_Life;

out float v_Age;
out float v_Life;
out vec2 v_TexCoord;
out vec2 V_C;

void main() {
  float scale = 0.75;

  vec2 vert_coord = i_Position +
					(scale * (1.0-i_Age / i_Life) + 0.25) * 0.1 * i_Coord;

  v_Age = i_Age;
  v_Life = i_Life;

  v_TexCoord = i_TexCoord;
  // gl_PointSize = 1.0 + 6.0 * (1.0 - i_Age/i_Life);
  gl_Position = vec4(vert_coord, 0.0, 1.0);
}