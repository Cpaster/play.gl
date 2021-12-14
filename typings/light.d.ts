interface PonitLightStruct {
  position: Vec3;
  ambient: Vec3
  diffuse: Vec3;
  specular: Vec3;
  constant: number;
  linear: number;
  quadratic: number;
}

interface SpotLightStruct {
  position: Vec3;
  direction: Vec3;
  cutOff: number;
  outCutOff: number;
  ambient: Vec3
  diffuse: Vec3;
  specular: Vec3;
}

interface DirectionLightStruct {
  direction: Vec3;
  ambient: Vec3
  diffuse: Vec3;
  specular: Vec3;
}