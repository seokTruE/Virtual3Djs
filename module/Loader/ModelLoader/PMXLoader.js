import { Entity3D } from "../../core/Entity3D/Entity3D.js";
class PMXLoader {
    constructor() {

    }
    async load(url) {
        
        if (!url) throw new Error('URL is required');
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
            const buffer = await response.arrayBuffer();
       
            const dataView = new DataView(buffer);
            const parsedData = this.parsePMXData(dataView);
        
            // console.log("顶点数据:", parsedData.vertices.length/3);
            // console.log("UV数据:", parsedData.uvs.length/2);
            // console.log("法线数据:", parsedData.normals.length/3);
            // console.log("索引数据:", parsedData.indices);
            // console.log("材质数据:", parsedData.subsets);

            var model = new Entity3D();
            Entity3D.renderSetting = {
            needRender: true,
            DEPTH_TEST : true,
            CULL_FACE : 'BACK', // FRONT / FALSE
            pixelType : 'POINTS',
            drawType : 'drawArrays'
        }

            model.attribute.vertices = parsedData.vertices;
            model.attribute.uvs = parsedData.uvs;
            model.attribute.normals = parsedData.normals;
            model.attribute.indices = parsedData.indices;

        } catch (error) {
            console.error('PMX Load Error:', error);
            throw error;
        }
        return model;
    }

    
    
    // PMX二进制解析核心方法
    parsePMXData(dataView) {
        let offset = 0;
        const signature = String.fromCharCode(...new Uint8Array(dataView.buffer, 0, 4));
        offset += 4;
        if (signature !== 'PMX ') throw new Error('无效的PMX文件');
        // 版本（例如2.0或2.1）
        const version = dataView.getFloat32(4, true);
        offset += 4;
        // console.log( '文件签名:' + signature );
        // console.log( '版本:' + version );
        if (version !== 2.0) {console.warn('警告:当前解析逻辑可能不兼容PMX版本', version);}
        // 全局信息（编码、追加UV数等）
        const dataSize = dataView.getUint8(offset); offset += 1; // ( 8 ) 数据列字节尺寸
        const textEncoding = dataView.getUint8(offset); offset += 1; // ( 0 ) 0=UTF-16LE, 1=UTF-8
        const additionalUVs = dataView.getUint8(offset); offset += 1; // ( 0 ) 追加UV数量（0~4）
        const vertexIndexSize = dataView.getUint8(offset); offset += 1; // ( 2 ) 顶点索引字节数（1,2,4）
        const textureIndexSize = dataView.getUint8(offset); offset += 1; // ( 1 ) 纹理索引字节数
        const materialIndexSize = dataView.getUint8(offset); offset += 1; // ( 1 ) 材质索引字节数
        const boneIndexSize = dataView.getUint8(offset); offset += 1; // ( 2 ) 骨骼索引字节数
        const morphIndexSize = dataView.getUint8(offset); offset += 1; // ( 1 ) 变形索引字节数
        const rigidBodyIndexSize = dataView.getUint8(offset); offset += 1; // ( 2 ) 刚体索引字节数

        // --- 2. 解析模型名称、注释（UTF字符串） ---
        // console.log( offset )
        const modelName = this.readText(dataView, offset, textEncoding); offset = modelName.offset;
        // console.log( String.fromCharCode(...new Uint8Array(dataView.buffer, 17, 74)) )
        const modelNameEn = this.readText(dataView, offset, textEncoding); offset = modelNameEn.offset;
        const comment = this.readText(dataView, offset, textEncoding); offset = comment.offset;
        const commentEn = this.readText(dataView, offset, textEncoding); offset = commentEn.offset;
    
        // console.log(modelName)//,modelNameEn,comment,commentEn)

        // --- 3. 读取顶点数据 ---
        const vertexCount = dataView.getInt32(offset, true); offset += 4;
        // console.log( '顶点数量' + vertexCount );
        
        const vertices = [];
        const uvs = [];
        const normals = [];
    
        for (let i = 0; i < vertexCount; i++) {
            // 顶点位置（x, y, z）
            const x = dataView.getFloat32(offset, true); offset += 4;
            const y = dataView.getFloat32(offset, true); offset += 4;
            const z = dataView.getFloat32(offset, true); offset += 4;
            vertices.push(x, y, z);

            // 法线（nx, ny, nz）
            const nx = dataView.getFloat32(offset, true); offset += 4;
            const ny = dataView.getFloat32(offset, true); offset += 4;
            const nz = dataView.getFloat32(offset, true); offset += 4;
            normals.push(nx, ny, nz);
        
            // UV坐标（u, v）
            const u = dataView.getFloat32(offset, true); offset += 4;
            const v = dataView.getFloat32(offset, true); offset += 4;
            uvs.push(u, v);
    
            // 追加UV（如果有）
            for (let j = 0; j < additionalUVs; j++) {
                offset += 4 * 4; // 每个追加UV包含4个float32值（通常未使用）
            }
        
            // 骨骼权重（略过）
            const weightType = dataView.getUint8(offset); offset += 1;
            switch (weightType) {
                case 0: // BDEF1
                offset += boneIndexSize;
                break;
                case 1: // BDEF2
                offset += boneIndexSize * 2 + 4; // 骨骼索引 + 权重
                break;
                case 2: // BDEF4
                offset += boneIndexSize * 4 + 16; // 骨骼索引 + 权重
                break;
                case 3: // SDEF
                offset += boneIndexSize * 2 + 4 * 6; // 骨骼索引 + 权重 + C/R0/R1
                break;
            }
        
            // 边缘缩放（float32）
            const edgeScale = dataView.getFloat32(offset, true); offset += 4;
            
        }
        
        const name = this.readText(dataView, 391, textEncoding); //745
        // console.log(name);
    
        // --- 4. 读取面数据（索引）---
        const indexCount = dataView.getInt32(offset, true); offset += 4;
        // console.log( indexCount );
        const indices = [];
        for (let i = 0; i < indexCount; i++) {
            let index;
            switch (vertexIndexSize) {
                case 1: index = dataView.getUint8(offset); break;
                case 2: index = dataView.getUint16(offset, true); break;
                case 4: index = dataView.getUint32(offset, true); break;
                default: throw new Error('不支持的索引大小');
            }
            indices.push(index);
            offset += vertexIndexSize;
        }

        return {
            vertices: new Float32Array( vertices ),
            uvs: new Float32Array( uvs ),
            normals: new Float32Array( normals ),
            indices: new Uint32Array(indices),
        };
    }
    
    // 辅助方法：读取UTF字符串
    readText(dataView, offset, encoding) {
        const length = dataView.getInt32(offset, true);
        offset += 4;
        const bytes = new Uint8Array(dataView.buffer, offset, length);
        offset += length;
        const decoder = new TextDecoder( encoding === 0 ? 'utf-16le' : 'utf-8' );
        return { text: decoder.decode(bytes), offset };
    }


    // !
}

// in mmdparser of 10536 line
export { PMXLoader }


        // var loader = new Virtual3D.PMXLoader();
        // var glx = loader.load('./assets/models/pmx/格蕾修泳装/格蕾修泳装.pmx');
        // glx.then((result) => {
        //     console.log( result.attribute )
        //     // scene.add( result );
        // }).catch((error) => {
        //     console.error('Promise 执行出错:', error);
        // });