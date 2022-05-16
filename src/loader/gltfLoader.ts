import PlayGL from "../core";
import TRS from "../helper/trs";
import Node from "../nodes";
const loadFile = async (url, type) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`could not load: ${url}`);
  }
  return await response[type]();
};

const loadJSON = async (url) => {
  return await loadFile(url, "json");
};

const loadBinary = async (url) => {
  return await loadFile(url, "arrayBuffer");
};

const accessorTypeToNumComponentsMap = {
  SCALAR: 1,
  VEC2: 2,
  VEC3: 3,
  VEC4: 4,
  MAT2: 4,
  MAT3: 9,
  MAT4: 16,
};

const addChildren = (nodes, node, childIndices) => {
  childIndices.forEach((childNdx) => {
    const child = nodes[childNdx];
    child.setParent(node);
  });
};

const getAccessorAndWebGLBuffer = (
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  gltf,
  accessorIndex
) => {
  const accessor = gltf.accessors[accessorIndex];
  const bufferView = gltf.bufferViews[accessor.bufferView];
  if (!bufferView.webglBuffer) {
    const buffer = gl.createBuffer();
    const target = bufferView.target || gl.ARRAY_BUFFER;
    const arrayBuffer = gltf.buffers[bufferView.buffer];
    const data = new Uint8Array(
      arrayBuffer,
      bufferView.byteOffset,
      bufferView.byteLength
    );
    gl.bindBuffer(target, buffer);
    gl.bufferData(target, data, gl.STATIC_DRAW);
    bufferView.webglBuffer = buffer;
  }

  return {
    accessor,
    buffer: bufferView.webglBuffer,
    stride: bufferView.stride || 0,
  };
};

const accessorTypeToNumComponents = (type) => {
  return accessorTypeToNumComponentsMap[type];
};

const gltfLoader = async (url, ctx: PlayGL) => {
  const { gl } = ctx;
  const gltf = await loadJSON(url);
  const baseURL = new URL(url, location.href);
  gltf.buffers = await Promise.all(
    gltf.buffers.map((buffer) => {
      const url = new URL(buffer.uri, baseURL.href);
      return loadBinary(url.href);
    })
  );

  const defaultMaterial = {
    uniforms: {
      u_diffuse: [1, 0.8, 1, 1],
    },
  };

  gltf.meshes.forEach((mesh) => {
    mesh.primitives.forEach((primitive) => {
      const attribs = {};
      let numElements;
      for (const [attribName, index] of Object.entries(primitive.attributes)) {
        const { accessor, buffer, stride } = getAccessorAndWebGLBuffer(
          gl,
          gltf,
          index
        );
        numElements = accessor.count;
        attribs[`a_${attribName}`] = {
          buffer,
          type: accessor?.componentType,
          numComponents: accessorTypeToNumComponents(accessor.type),
          stride,
          offset: accessor?.byteOffset | 0,
        };
      }

      const bufferInfo = {
        attribs,
        numElements,
        indices: undefined,
        elementType: undefined,
      };

      if (primitive?.indices !== undefined) {
        const { accessor, buffer } = getAccessorAndWebGLBuffer(
          gl,
          gltf,
          primitive.indices
        );
        bufferInfo.numElements = accessor.count;
        bufferInfo.indices = buffer;
        bufferInfo.elementType = accessor.componentType;
      }

      primitive.bufferInfo = bufferInfo;
      primitive.material =
        (gltf.materials && gltf.materials[primitive.material]) ||
        defaultMaterial;
    });
  });

  const origNodes = gltf.nodes;

  const meshDatas = [];

  gltf.nodes = gltf.nodes.map((n) => {
    const { name, mesh, translation, rotation, scale } = n;
    const trs = new TRS(translation, rotation, scale);
    const node = new Node(trs, name);
    const realMesh = gltf.meshes[mesh];
    realMesh && meshDatas.push(realMesh);
    return node;
  });

  gltf.addMeshData = (playGL: PlayGL) => {
    meshDatas.forEach(mesh => {
      for (const primitive of mesh.primitives) {
        console.log(primitive.bufferInfo.attribs);
        console.log(Object.prototype.toString.call(primitive.bufferInfo.attribs.a_POSITION.buffer));
        console.log(primitive.bufferInfo.attribs.a_POSITION.buffer);
      }
    })
  }

  gltf.nodes.forEach((node, ndx) => {
    const children = origNodes[ndx].children;
    if (children) {
      addChildren(gltf.nodes, node, children);
    }
  });

  // setup scenes
  for (const scene of gltf.scenes) {
    scene.root = new Node(new TRS(), scene.name);
    addChildren(gltf.nodes, scene.root, scene.nodes);
  }

  return gltf;
};

export default gltfLoader;
