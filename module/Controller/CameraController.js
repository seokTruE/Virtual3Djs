import { Vector3 } from '../core/Math/Vector/Vector3.js'
import { MouseMovement } from './event/MouseMovement.js'
import { Wheel } from './event/Wheel.js'
import { Touch  } from './event/Touch.js';
class CameraController {
    constructor ( camera, DOM ) {
        if ( !camera || !DOM ) return;
        if ( !camera.lookAt ) {
            this.center = camera.lookAt;
        } else {
            this.center = new Vector3();
        }
        this.camera = camera;
        this.DOM = DOM;
        
        this.message = {
            MIN_VERTICAL_ANGLE : -89,
            MAX_VERTICAL_ANGLE : 89,
            //VERTICAL_inertial_coefficient : 1.1,
            HORIZONTAL_inertial_coefficient : 1.1,

            MIN_DISTANCE : 0.1,      // 最小允许距离
            MAX_DISTANCE : 1000.0,    // 最大允许距离
            ZOOM_DAMPING : 0.01,
            ZOOM_SENSITIVITY : 0.001,
        }
        this.Mouser = new MouseMovement( this.DOM );
        this.Wheel = new Wheel( this.DOM );
        this.Touch = new Touch( this.DOM );
    }

    updata() {
        this.Mouser.getData();
        this.Wheel.getData();
        this.Touch.getData();
        if ( this.Touch.deltaX != 0 ) {
            this.updataDeltaX( this.Touch.deltaX );
            this.DOM.V_msg.needUpdataViewMatrix4 =  true;
        }
        if ( this.Touch.deltaY != 0 ) {
            this.updataDeltaY( this.Touch.deltaY );
            this.DOM.V_msg.needUpdataViewMatrix4 =  true;
        }
        if ( this.Mouser.deltaX != 0 ) {
            this.updataDeltaX( this.Mouser.deltaX );
            this.DOM.V_msg.needUpdataViewMatrix4 =  true;
        }
        if ( this.Mouser.deltaY != 0 ) {
            this.updataDeltaY( this.Mouser.deltaY );
            this.DOM.V_msg.needUpdataViewMatrix4 =  true;
        }
        if ( this.Wheel.deltaWheelY != 0 ) {
            this.updataDeltaWheelY( this.Wheel.deltaWheelY )
            this.DOM.V_msg.needUpdataViewMatrix4 =  true;
        }
    }

    updataDeltaWheelY( deltaWheelY ) {
        let forward = new Vector3();
        forward.subVectors( this.camera.position, this.center );
        let distance = forward.ModelLength();
        const unitVector = forward.normalize();
        let actualDistance = distance;
        let targetDistance = distance + deltaWheelY * this.message.ZOOM_SENSITIVITY * distance*5;
        targetDistance = Math.max(this.message.MIN_DISTANCE, Math.min(targetDistance, this.message.MAX_DISTANCE));

        const delta = targetDistance - actualDistance;
        actualDistance += delta * (1 - this.message.ZOOM_DAMPING);

        this.camera.position.x = this.center.x + unitVector.x * actualDistance;
        this.camera.position.y = this.center.y + unitVector.y * actualDistance;
        this.camera.position.z = this.center.z + unitVector.z * actualDistance;
    }

    updataDeltaX( deltaX ) {
        let deltaXd = ( deltaX * Math.PI) / 180;
        const relativeX = this.camera.position.x - this.center.x;
        const relativeZ = this.camera.position.z - this.center.z;
        const radius = Math.hypot(relativeX, relativeZ);
        let theta = Math.atan2(relativeZ, relativeX);
        theta += deltaXd * 0.3;
        this.camera.position.x = this.center.x + radius * Math.cos(theta);
        this.camera.position.z = this.center.z + radius * Math.sin(theta);
    }

    updataDeltaY( deltaY ) {
        let delta_Y = ( deltaY * Math.PI) / 180;
        let forward = new Vector3();
        forward.subVectors( this.camera.position, this.center );
        let distance = forward.ModelLength();
        let theta = Math.asin( forward.y / distance );
        theta += delta_Y * 0.3;

        theta = Math.max(
            this.message.MIN_VERTICAL_ANGLE * (Math.PI / 180),
            Math.min(theta, this.message.MAX_VERTICAL_ANGLE * (Math.PI / 180))
        );

        const horizontalRadius = distance * Math.cos(theta);
        const currentHorizontalRadius = Math.hypot( forward.x, forward.z );
        const scale = currentHorizontalRadius !== 0 ? horizontalRadius / currentHorizontalRadius : 0;
            
        this.camera.position.x = this.center.x + forward.x * scale;
        this.camera.position.y = this.center.y + distance * Math.sin(theta);
        this.camera.position.z = this.center.z + forward.z * scale;

    }

}
export { CameraController }