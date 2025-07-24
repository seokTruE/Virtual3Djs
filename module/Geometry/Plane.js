import { Entity3D } from "../core/Entity3D/Entity3D.js";

class Plane extends Entity3D {
    constructor({
        position = { x: 0, y: 0, z: 0 },
        Euler = { x: 0, y: 0, z: 0 },
        scale = { x: 1, y: 1, z: 1 },
        quaternion = { x: 0, y: 1, z: 0, w: 1 },
    }={}) {
        super({ position, Euler, scale, quaternion });
        this.setShape();
        this.message = {
            name : '',
            needUpdataAttribute: true,
            renderIndex : -1,
            sceneLevel: 0,
            type: 'Plane',
        }

        this.renderSetting = {
            needRender: true,
            DEPTH_TEST : true,
            CULL_FACE : 'BACK', // FRONT / FALSE
            pixelType : 'TRIANGLES',
            drawType : 'drawElements'
        }
    }

    setShape( long = 1, width = 1, height = 0, longSegments = 1, widthSegments = 1 ) {
        if ( width == this.width && height == this.height && widthSegments == this.widthSegments && longSegments == this.longSegments ) return;
        this.long = long;
        this.width = width;
        this.height = height;
        this.widthSegments = widthSegments;
        this.longSegments = longSegments;
        // this.updataAttribute();
        this.message.needUpdataAttribute = true;
    }

    updataAttribute() {

        this.attribute = {
            vertices: [],
            normals: [],
            uvs: [],
            indices: [],
            offset : 0
        }

		let ls = Math.floor( this.longSegments );
        let ws = Math.floor( this.widthSegments );
        let sw = this.width / ws;
        let sl = this.long / ls;
        let w = this.width / 2;
        let l = this.long / 2;
        for ( let i = 0; i < ( ws + 1 ); i++ ) { // 前面
            for ( let j = 0; j < ( ls + 1 ); j++ ) {
                this.attribute.vertices.push( l - i * sl );
                this.attribute.vertices.push( this.height );
                this.attribute.vertices.push( w - j * sw );
                this.attribute.normals.push( 0, 1, 0 );
                this.attribute.uvs.push( 1 - i / ls );
                this.attribute.uvs.push( 1 - j / ws );
            }
        }

        // this.attribute.indices = [ 0,1,2,3,2,1 ]
        this.addIndices( ls, ws )
        this.message.needUpdataAttribute = false;
    }
    addIndices( x = 2 , y = 2 ) {
        var index = [0, 1, 2 + x, 0, 2 + x, 1 + x];
        for ( let i = 1; i < x; i++) {
            index = index.concat( index.map( item => item + 1) );
        };
        for ( let j = 1; j < y; j++) {
            index = index.concat(index.map( item => item + x + 1));
        }
        this.attribute.indices = this.attribute.indices.concat(index.map( item => item + this.attribute.offset));
        this.attribute.offset += x * y + x + y + 1;
    }
    copy(v) {
        this.shape = v.shape;
        this.position = v.position;
        this.scale = v.scale;
        return this;
    }
};

export { Plane  }