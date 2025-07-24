import { Entity3D, BasicMaterial } from '../../Virtual3D.module.js'
class Group extends Entity3D {
    constructor({
        position = { x: 0, y: 0, z: 0 },
        Euler = { x: 0, y: 0, z: 0 },
        scale = { x: 1, y: 1, z: 1 }
    }={}) {
        super({ position, Euler, scale });
        this.children = [];
        this.Material = new BasicMaterial();
        this.message = {
            name : '',
            needRender: true,
            needUpdataAttribute: true,
            renderIndex : -1,
            sceneLevel: 0,
            type: 'Group',
        }
        this.renderSetting = {
            needRender: true,
            DEPTH_TEST : true,
            CULL_FACE : 'BACK', // FRONT / FALSE
            pixelType : 'LINES',
            drawType : 'drawElements'
        }
        this.worldMatrix4 = this.modelMatrix4;
    }
    add(object) {
        this.children.push(object);
    }

    setChildren( array ) {
        this.children = array;
    }
    updataAttribute(){
        this.attribute = {
            vertices: [ 0.0,0.0,0.0, 100.0,0.0,0.0, 0.0,100.0,0.0, 0.0,0.0,100.0 ],
            normals: [ 0.0,0.0,0.0, 1.0,0.0,0.0, 0.0,1.0,0.0, 0.0,0.0,1.0 ],
            uvs: [ 0.0,0.0 ],
            indices: [ 0,1,0,2,0,3 ],
            offset : 0
        }
        this.message.needUpdataAttribute = false;
    }
}
export { Group }