import { Vector3 } from '../Math/Vector/Vector3.js'
import { Vector4 } from '../Math/Vector/Vector4.js'
import { Matrix4 } from '../Math/Matrix/Matrix4.js'

import * as Utility from '../Math/Utility.js'

class Entity3D {
    constructor({
        position = { x: 0, y: 0, z: 0 },
        Euler = { x: 0, y: 0, z: 0 },
        scale = { x: 1, y: 1, z: 1 },
        quaternion = { x: 0, y: 0, z: 0, w: 1 },
    }={}) {
        this.position = new Vector3( position.x, position.y, position.z );
        this.Euler = new Vector3( Euler.x, Euler.y, Euler.z );
        this.scale = new Vector3( scale.x, scale.y, scale.z );
        // this.RotatShaft = new Vector3( quaternion.x, quaternion.y, quaternion.z );
        // this.Quaternion = new Virtual3D.Math.Quaternion();
        // this.Quaternion.setDegree( this.degree );
        // this.Quaternion.setVector3( this.RotatShaft );
        this.buffer = {}
        this.attribute = {
            vertices: [],
            normals: [],
            uvs: [],
            indices: [],
            offset : 0
        }
        this.message = {
            name : '',
            needCoatShadow: false,
            addMatrix4 : false,
            renderIndex : -1,
            sceneLevel: 0,
            type: 'Entity3D',
            needUpdataAttribute: true,
            needUdpdataChildren: true,
        }
        this.renderSetting = {
            needRender: true,
            DEPTH_TEST : true,
            CULL_FACE : 'BACK', // FRONT / FALSE
            pixelType : 'TRIANGLES',
            drawType : 'drawElements'
        }
        this.modelMatrix4 = {
            type: 'modelMatrix4',
        }
        this.worldMatrix4 = new Matrix4();
        this.Matrix4List = [
            new Matrix4(),
            new Matrix4(),
            new Matrix4(),
        ]
        this._addMatrix4 = new Matrix4();
        this.addMatrix4List = [

        ]
    }
    setElementInstanced( array , length ) {
        if ( !array || array.length < 1 || !(array instanceof Array) ) return;
        this.ElementInstancedArray = [];
        let i = 0;
        for ( let element of array ) {
            if ( i == (length ?? array.length)) break;
            let instanced = {
                position: null,
                Euler: null,
                scale: null,
                color: null,
                DiffuseMap: null,
            };
            if ( element.position ) instanced.position = element.position;
            if ( !element.position ) instanced.position = {x:0,y:0,z:0};
            if ( element.Euler ) instanced.Euler = element.Euler;
            if ( !element.Euler ) instanced.Euler = {x:0,y:0,z:0};
            if ( element.scale ) instanced.scale = element.scale;
            if ( !element.scale ) instanced.scale = {x:1,y:1,z:1};
            if ( element.color ) instanced.color = element.color;
            if ( !element.color ) instanced.color = {x:1,y:1,z:1,w:1};
            if ( element.DiffuseMap ) instanced.DiffuseMap = element.DiffuseMap;
            if ( !element.color ) instanced.DiffuseMap = null;
            this.ElementInstancedArray.push(instanced)
            this.createInstancedObject( this.ElementInstancedArray );
        }
    }
    createInstancedObject( array ){
        this.InstanceAttribute = {
            modelMatrix4Array: [],
            colorArray: [],
        }
        for (let e of array ) {
            this.InstanceAttribute.modelMatrix4Array.push(...createModelMatrix4( e ))
            this.InstanceAttribute.colorArray.push(...[ e.color.x, e.color.y, e.color.z, e.color.w, ])
        }
        function createModelMatrix4( obj ){
            let modelMatrix4 = new Matrix4();
            let ms = new Matrix4();
            let me = new Matrix4();
            let mp = new Matrix4();
            modelMatrix4.array =  Utility.multiplyMatrix4( Utility.multiplyMatrix4(ms.array, me.array), mp.array);
            return modelMatrix4.array;
        }
    }

    setOffsetPos( x = 0, y = 0, z = 0 ) {
        if ( x == 0 && y == 0 && z == 0 ) return;
        this.offsetPosition = {
            x: x, y: y, z: z,
        };
    }
    offsetPos() {
        if ( !this.offsetPosition || ( this.offsetPosition.x == 0 && this.offsetPosition.y == 0 && this.offsetPosition.z == 0 ) ) return;
        if ( this.attribute.vertices.length < 1 ) console.warn(`[Virtual3D warn]:this model(type=${this.type}) have error`);
        
        
        let i = 0;
        for ( let element of this.attribute.vertices ) {
            if ( (( i % 3 ) == 0) &&  (this.offsetPosition.x != 0)) {
                element = element + this.offsetPosition.x;
            }
            if ( (( i % 3 ) == 1) &&  (this.offsetPosition.y != 0)) {
                element = element + this.offsetPosition.y;
            }
            if ( (( i % 3 ) == 2) &&  (this.offsetPosition.z != 0)) {
                element = element + this.offsetPosition.z;
            }
            this.attribute.vertices[i] = element;
            i++;
        }
    }

    updataMatrix4() {
        if ( this.scale.message.needUpdata || this.Euler.message.needUpdata || this.position.message.needUpdata ) {
            if (  this.scale.message.needUpdata ) {
                this.Matrix4List[0].Vector3SetScale( this.scale );
            }
            if (  this.Euler.message.needUpdata ) {
                this.Matrix4List[1].Vector3SetEuler( this.Euler );
            }
            if (  this.position.message.needUpdata ) {
                this.Matrix4List[2].Vector3SetPosition( this.position );
            }
            this.modelMatrix4.array =  Utility.multiplyMatrix4( Utility.multiplyMatrix4(this.Matrix4List[0].array, this.Matrix4List[1].array), this.Matrix4List[2].array)
        }

        if ( this.message.addMatrix4 && this.addMatrix4List.length > 0 ) {
            if ( this.needUpdataAddlMatrix4() ) {
                for ( let i = 0; i < this.addMatrix4List.length; i++ ) {
                    this._addMatrix4.array =  Utility.multiplyMatrix4( this._addMatrix4.array,this.addMatrix4List[i].array );
                }
                this.modelMatrix4.array =  Utility.multiplyMatrix4( this.modelMatrix4.array, this._addMatrix4.array)
            }
        }

        this.scale.message.needUpdata = false;
        this.Euler.message.needUpdata = false;
        this.position.message.needUpdata = false;

        this.message.needUpdataModelMatrix4 = false;
    }
    needUpdataModelMatrix4 () {
        return (
            this.scale?.message?.needUpdata ||
            this.Euler?.message?.needUpdata ||
            this.position?.message?.needUpdata
        );
    }
    needUpdataAddlMatrix4() {
        if ( this.addMatrix4List.length = 0 ) return false;
        for ( let i = 0; i < this.addMatrix4List.length; i++ ) {
            if ( this.addMatrix4List[i].message.needUpdata === true ) {
                return true;
            }
        }
        return false;
    }
    addMatrix4( mat4 ) {
        this.addMatrix4List.push( mat4 );
        this.message.addMatrix4 = true;
    }
    setShape() {

    }
    setPixelType( msg = 'POINTS' ) {
        this.renderSetting.pixelType = msg;
    }
    updataAttribute() {

    }
/*
    copyWorld(v) {
        this.position = v.position;
        this.rotation = v.rotation;
        this.scale = v.scale;
        return this;
    }
*/
}

export { Entity3D }