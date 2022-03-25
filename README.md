## 说明

play.gl属于自己无聊做的一个webgl的基础图形学的库，用来学习webgl的一些知识

### TODO LIST

☑️基础webgl框架的搭建比如着色器的实现，支持顶点着色器

☑️实现uniforms的传递和渲染

☑️支持Loading图片

☑️支持2D纹理

☑️基本的图形学数学公式（矩阵和向量的计算）（从gl-matrix里面摘出来了一部分常用的矩阵变化的代码）

☑️正交相机

☑️透视相机（推导透视相机的逻辑真的好难啊）

☑️冯式光照基本实现

☑️glsl支持struct格式

☑️支持多物体的渲染能力

☑️支持聚光灯效果

☑️支持点光源的效果

☑️支持多个光照效果（针对不同光照效果做代码封装）

☑️可以自定义深度测试和模版测试的开关

☑️addMeshData和setUniform设置可通用到多个program（使用uniform的缓冲对象实现）

☑️修改meshDatas的函数防止多次重复渲染

☑️支持图片和颜色混合(gl.blend)

☑️面剔除

☑️支持帧缓存

☑️立方体贴图

☑️折射和反射

☑️实例化

☑️抗锯齿（离线抗锯齿, QA: 离线抗锯齿为啥深度测试失败）

☑️深度阴影

点光源阴影(万向投影决定放弃了，后面再看看)

☑️法线贴图

☑️视差贴图

gltf模块引入

☑️HDR图片加载器

HDR

泛光

SSAO

☑️PBR

☑️IBL

延时着色

☑️加载canvas纹理

加载文字

支持picking

frog

粒子效果

字体加载

### math方法

支持常数和矩阵的计算逻辑

支持直接生成Array类型的基础矩阵

### 开发中遇到的迷惑问题

透视相机的推导过程

欧拉角的万向节死锁

根据在场景中添加的光源值去计算GLSL中的值

shadow acne问题的解决及原理https://www.zhihu.com/question/321779117

### Bug
在hdr文件中，多个program之间的纹理切换感觉有问题

