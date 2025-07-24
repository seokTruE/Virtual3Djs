import { Entity3D } from "../core/Entity3D/Entity3D.js";

class Cube extends Entity3D {
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
            type: 'Cube',
        }
        
        this.renderSetting = {
            needRender: true,
            DEPTH_TEST : true,
            CULL_FACE : 'BACK', // FRONT / FALSE
            pixelType : 'TRIANGLES',
            drawType : 'drawElements'
        }
    }

    setShape( width=1, height=1, depth=1, widthSegments = 1, heightSegments = 1, depthSegments = 1 ) {
        if ( width == this.width && height == this.height && depth == this.depth && widthSegments == this.widthSegments && heightSegments == this.heightSegments && depthSegments == this.depthSegments ) return;
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.widthSegments = widthSegments;
        this.heightSegments = heightSegments;
        this.depthSegments = depthSegments;
        // this.updataAttribute();
        this.message.needUpdataAttribute = true;
    }

    updataAttribute() {
        let ws = Math.floor( this.widthSegments );
		let hs = Math.floor( this.heightSegments );
		let ds = Math.floor( this.depthSegments );
        let sw = this.width / ws;
        let sh = this.height / hs;
        let sd = this.depth / ds;
        let w = this.width / 2;
        let h = this.height / 2;
        let d = this.depth / 2;
        this.attribute = {
            vertices: [],
            normals: [],
            uvs: [],
            indices: [],
            offset : 0
        }
        this.buildPlane( this.attribute, w, h, d, ws, hs, ds, sw, sh, sd , 0, 0, 1);
        this.addIndices( ws, hs );
        this.addIndices( ws, hs );
        this.addIndices( ds, hs );
        this.addIndices( ds, hs );
        this.addIndices( ws, ds );
        this.addIndices( ws, ds );

        this.message.needUpdataAttribute = false;
    }

    buildPlane( attribute, w, h, d, ws, hs, ds, sw, sh, sd,) {
        for ( let i = 0; i < ( hs + 1 ); i++ ) { // 前面
            for ( let j = 0; j < ( ws + 1 ); j++ ) {
                attribute.vertices.push( w - j * sw );
                attribute.vertices.push( h - i * sh );
                attribute.vertices.push( d );
                attribute.normals.push( 0, 0, 1 );
                attribute.uvs.push( 1 - j / ws );
                attribute.uvs.push( 1 - i / hs );
            }
        }
        for ( let i = 0; i < ( hs + 1 ); i++ ) { // 后面
            for ( let j = 0; j < ( ws + 1 ); j++ ) {
                attribute.vertices.push( - w + j * sw );
                attribute.vertices.push( h - i * sh );
                attribute.vertices.push( -d );
                attribute.normals.push( 0, 0, -1 );
                attribute.uvs.push( 1 - j / ws );
                attribute.uvs.push( 1 - i / hs );
            }
        }
        for ( let i = 0; i < ( hs + 1 ); i++ ) { // 右侧
            for ( let j = 0; j < ( ds + 1 ); j++ ) {
                attribute.vertices.push( w );
                attribute.vertices.push( h - i * sh );
                attribute.vertices.push( - d + j * sd );
                attribute.normals.push( 1, 0, 0 );
                attribute.uvs.push( 1 - j / ds );
                attribute.uvs.push( 1 - i / hs );
            }
        }
        for ( let i = 0; i < ( hs + 1 ); i++ ) { // 左侧
            for ( let j = 0; j < ( ds + 1 ); j++ ) {
                attribute.vertices.push( -w );
                attribute.vertices.push( h - i * sh );
                attribute.vertices.push( d - j * sd );
                attribute.normals.push( -1, 0, 0 );
                attribute.uvs.push( 1 - j / ds );
                attribute.uvs.push( 1 - i / hs );
            }
        }
        for ( let i = 0; i < ( ds + 1 ); i++ ) { // 上
            for ( let j = 0; j < ( ws + 1 ); j++ ) {
                attribute.vertices.push( w - j * sw );
                attribute.vertices.push( h );
                attribute.vertices.push( - d + i * sd );
                attribute.normals.push( 0, 1, 0 );
                attribute.uvs.push( 1 - j / ws );
                attribute.uvs.push( 1 - i / ds );
            }
        }
        for ( let i = 0; i < ( hs + 1 ); i++ ) { // 下
            for ( let j = 0; j < ( ws + 1 ); j++ ) {
                attribute.vertices.push( w - j * sd );
                attribute.vertices.push( -h );
                attribute.vertices.push( d - i * sh );
                attribute.normals.push( 0, -1, 0 );
                attribute.uvs.push( 1 - j / ws );
                attribute.uvs.push( 1 - i / ds );
            }
        }
    }

    addIndices( x = 2 , y = 2 ) {
        var index = [0, 1, 2 + x, 0, 2 + x, 1 + x];
        for ( let i = 1; i < x; i++) {
            index = index.concat(index.map( item => item + 1));
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
        this.rotation = v.rotation;
        this.scale = v.scale;
        return this;
    }
};

export { Cube  }