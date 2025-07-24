import { Vector3 } from '../../Virtual3D.module.js';
import { Entity3D } from '../Entity3D/Entity3D.js'

class Scene extends Entity3D {
    constructor({
        position = { x: 0, y: 0, z: 0 },
        Euler = { x: 0, y: 0, z: 0 },
        scale = { x: 1, y: 1, z: 1 }
    }={}) {
        super({ position, Euler, scale });
        this.children = [];
        this.LightChild = [];
        this.message = {
            name : '',
            needRender: false,
            needUpdataAttribute: true,
            renderIndex : -1,
            sceneLevel: 0,
            type: 'Scene',
        }
        this.ambientLight = new Vector3( 1, 1, 1 );
        
        this.worldMatrix4 = this.modelMatrix4;
    }
    add(object) {
        this.children.push(object);
    }

    setChildren( array ) {
        this.children = array;
    }
};
export { Scene }
