import { Entity3D, Group } from "../../Virtual3D.module.js";
class  OBJLoader {
    constructor() {

    }
    async load(url) {
        let objText = null;
        if (!url) throw new Error('URL is required');
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
            objText =  await response.text();
        } catch (error) {
            console.error('PMX Load Error:', error);
            throw error;
        }
        let model = this.parse( objText );
        // console.log( model )
        return model;
    }

    parse( objText ) {
        let g = new Group();
        let e = new Entity3D();
        // 存储各类数据的数组
        const faces = [];          // 面数据，每个元素存储 [顶点索引组, 纹理坐标索引组, 法线索引组]
        let mtlLib = '';           // 材质库文件名，用于后续加载 .mtl（可选，这里先记录）

        var attribute = {
            vertices: [],
            normals: [],
            uvs: [],
            indices: [],
            offset : 0
        }
        // 按行拆分文本
        const lines = objText.split('\n');
        lines.forEach(line => {
            line = line.trim();
            if (line === '' || line.startsWith('#')) {
              return; // 跳过空行和注释行
            }

            const parts = line.split(' ').filter(part => part !== '');
            const type = parts[0];
            const data = parts.slice(1);

            switch (type) {
                case 'v':
                    // 解析顶点：x, y, z
                    attribute.vertices.push(...data.map(Number));
                    break;
                case 'vt':
                    // 解析纹理坐标：u, v（可能有 w，这里取前两个或三个，按需处理）
                    attribute.uvs.push(...data.map(Number));
                    break;
                case 'vn':
                    // 解析顶点法线：nx, ny, nz
                    attribute.normals.push(...data.map(Number));
                    break;
                case 'mtllib':
                    // 记录材质库文件名
                    mtlLib = data[0];
                    break;
                case 'f':
                    // 解析面数据，处理类似 "v1/vt1/vn1 v2/vt2/vn2 ..." 格式
                    const faceData = {
                        vertexIndices: [],
                        uvIndices: [],
                        normalIndices: []
                    };
                    parts.slice(1).forEach(vertexPart => {
                        const indices = vertexPart.split('/');
                        // OBJ 索引是 1 基，转成 0 基
                        const vIndex = parseInt(indices[0], 10) - 1;
                        const vtIndex = indices[1] ? parseInt(indices[1], 10) - 1 : -1;
                        const vnIndex = indices[2] ? parseInt(indices[2], 10) - 1 : -1;

                    attribute.indices.push(vIndex)
                        faceData.vertexIndices.push(vIndex);
                        faceData.uvIndices.push(vtIndex);
                        faceData.normalIndices.push(vnIndex);
                    });
                    faces.push(faceData);
                break;
          // 若有其他类型（如 o 物体名、usemtl 材质使用等），可继续扩展 case 处理
          default:
            break;
        }
      });

        // 解析完成后，这里可以使用解析好的数据
        // console.log('顶点数据：', vertices);
        // console.log('纹理坐标：', uvs);
        // console.log('顶点法线：', normals);
        // console.log('面数据：', faces);
        // console.log('材质库：', mtlLib);
        e.attribute = attribute;
        return e;
    }
}
export { OBJLoader }
