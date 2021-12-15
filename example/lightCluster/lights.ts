import PlayGL from 'core';

export default class lightCluster {
  context: PlayGL;
  autoUpdate: boolean;
  pointLights: Array<PonitLightStruct>;
  spotLights: Array<SpotLightStruct>;
  directionLights: Array<DirectionLightStruct>;
  constructor(glContext: PlayGL, autoUpdate: boolean = false) {
    this.context = glContext;
    this.autoUpdate = autoUpdate;
    this.pointLights = [];
    this.spotLights = [];
    this.directionLights = [];
  }
  addDirectionLight(light: DirectionLightStruct) {
    this.directionLights.push(light);
  }

  addPointLight(light: PonitLightStruct) {
    this.pointLights.push(light);
  }

  addSpotLight(light: SpotLightStruct) {
    this.spotLights.push(light);
  }

  add() {
    const directionLightsLen = this.directionLights.length || 0;
    const pointLightLen = this.pointLights.length || 0;
    const spotLightLen = this.spotLights.length || 0;
    for (let i = 0; i < directionLightsLen; i++) {
      Object.entries(this.directionLights[i]).forEach(([key, value]) => {
        this.context.setUniform(`directionLight[${i}].${key}`, value);
      })
    }
    for (let i = 0; i < pointLightLen; i++) {
      Object.entries(this.pointLights[i]).forEach(([key, value]) => {
        this.context.setUniform(`pointLight[${i}].${key}`, value);
      })
    }
    for (let i = 0; i < spotLightLen; i++) {
      Object.entries(this.spotLights[i]).forEach(([key, value]) => {
        this.context.setUniform(`spotLight[${i}].${key}`, value);
      })
    }
  }
}