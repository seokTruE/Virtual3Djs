import { Vector3 } from '../Math/Vector/Vector3.js'
import { Matrix4 } from '../Math/Matrix/Matrix4.js'
import { Entity3D } from '../Entity3D/Entity3D.js'

class PerspectiveCamera extends Entity3D {
    constructor({
        position = { x: 0, y: 0, z: 0 },
        rotation = { x: 0, y: 0, z: 0 },
        quaternion = { x: 0, y: 1, z: 0, w: 1 },
    }={}) {
        super({ position, rotation, quaternion });
        this.lookAt = new Vector3();
        this.up = new Vector3( 0, 1, 0 );
        this.canvas;
        this.near = 0.1;
        this.far = 1000;
        this.fov = 36;
        var fovRad = ( this.fov * Math.PI) / 180; // 转换角度为弧度
        this.f = 1.0 / Math.tan(fovRad / 2);
        this.message = {
            type: 'PerspectiveCamera',
            needRender: false,
            neeedUpdata: true,
        }
        this.cameraMatrix4 = new Matrix4();
        this.viewMatrix4 = new Matrix4();
    }

    updataCameraMatrix4() {
        if ( this.canvas ) {
            this.aspect = this.canvas.width / this.canvas.height;

        } else if ( !this.canvas ) {
            this.aspect = 1;
        }
        this.cameraMatrix4.setPerspective( this.f, this.near, this.far, this.aspect );
    }

    updataViewMatrix4() {
        this.viewMatrix4.Vector3SetViewMatrix4( this.position, this.lookAt, this.up );
    }

    
}

export { PerspectiveCamera }