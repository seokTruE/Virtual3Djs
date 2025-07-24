import { Vector3 } from '../Math/Vector/Vector3.js'
import { Matrix4 } from '../Math/Matrix/Matrix4.js'
import { Entity3D } from '../Entity3D/Entity3D.js'

class OrthographicCamera extends Entity3D {
    constructor({
        position = { x: 0, y: 0, z: 0 },
        rotation = { x: 0, y: 0, z: 0 },
        quaternion = { x: 0, y: 1, z: 0, w: 1 },
    }={}) {
        super({ position, rotation, quaternion });
        this.lookAt = new Vector3();
        this.up = new Vector3( 0, 1, 0 );
        
        this.canvas
        this.viewScale = 10;
        this.near = 0.1;
        this.far = 2000;
        this.message = {
            type: 'OrthographicCamera',
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
        this.cameraMatrix4.setOrthographic( -this.viewScale, this.viewScale, -this.viewScale/this.aspect, this.viewScale/this.aspect, this.near, this.far );
    }

    
    updataViewMatrix4() {
        this.viewMatrix4.Vector3SetViewMatrix4( this.position, this.lookAt, this.up );
    }
}

export { OrthographicCamera }