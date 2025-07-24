import { Vector3 } from '../Vector/Vector3.js'
import * as Utility from '../Utility.js'

class Matrix4 {
    constructor() {
        this.array = [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ];
        this.type = 'IdentityMatrix4';
        this.message = {
            needUpdata: true
        }
    }
    setPosition( x = 0, y = 0, z = 0 ) {
        this.array[ 12 ] = x;
        this.array[ 13 ] = y;
        this.array[ 14 ] = z;
        this.message.needUpdata = true;
    }
    Vector3SetPosition( vec3 ) {
        this.warn( vec3 );
        this.array[ 12 ] = vec3.x;
        this.array[ 13 ] = vec3.y;
        this.array[ 14 ] = vec3.z;
        this.message.needUpdata = true;
    }
    setScale( x = 1, y = 1, z = 1 ) {
        this.array = [
            x, 0, 0, 0,
            0, y, 0, 0,
            0, 0, z, 0,
            0, 0, 0, 1
        ];
        this.message.needUpdata = true;
    }
    Vector3SetScale( vec3 ) {
        this.warn( vec3 );
        this.array[ 0 ] = vec3.x;
        this.array[ 5 ] = vec3.y;
        this.array[ 10 ] = vec3.z;
    }
    setEulerX ( x = 0 ) {
        let radX = (x * Math.PI) / 180;
        let cx = Math.cos(radX);
        let sx = Math.sin(radX);
        this.array = [
            1,  0,  0,  0,
            0, cx, sx, 0,
            0, -sx,  cx, 0,
            0,  0,  0,  1
        ];
        this.message.needUpdata = true;
    }
    setEulerY ( y = 0 ) {
        let radY = ( y * Math.PI ) / 180;
        let cy = Math.cos( radY );
        let sy = Math.sin( radY );
        this.array = [
            cy,  0, -sy, 0,
            0,  1,  0,  0,
            sy, 0, cy, 0,
            0,  0,  0,  1
        ];
        this.message.needUpdata = true;
    }
    setEulerZ ( z = 0 ) {
        let radZ = ( z * Math.PI ) / 180;
        let cz = Math.cos( radZ );
        let sz = Math.sin( radZ );
        this.array = [
            cz, sz, 0, 0,
            -sz, cz, 0, 0,
            0,  0, 1, 0,
            0,  0, 0, 1
        ];
        this.message.needUpdata = true;
    }
    Vector3SetEuler( vec3 ) {
        this.warn( vec3 );
        this.setEuler( vec3.x, vec3.y, vec3.z );
        this.message.needUpdata = true;
    }
    setEuler( x = 0, y = 0, z = 0 ) {
        if ( x == 0 && y == 0 && z == 0 ) return this.array = [ 1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
        let radX = (x * Math.PI) / 180;
        let cx = Math.cos(radX);
        let sx = Math.sin(radX);
        let radY = ( y * Math.PI ) / 180;
        let cy = Math.cos( radY );
        let sy = Math.sin( radY );
        let radZ = ( z * Math.PI ) / 180;
        let cz = Math.cos( radZ );
        let sz = Math.sin( radZ );
        let mx = [
            1,  0,  0,  0,
            0, cx, sx, 0,
            0, -sx,  cx, 0,
            0,  0,  0,  1
        ];
        let my = [
            cy,  0, -sy, 0,
            0,  1,  0,  0,
            sy, 0, cy, 0,
            0,  0,  0,  1
        ];
        let mz = [
            cz, sz, 0, 0,
            -sz, cz, 0, 0,
            0,  0, 1, 0,
            0,  0, 0, 1
        ];
        this.array = Utility.multiplyMatrix4( Utility.multiplyMatrix4(mz, my), mx)
        this.message.needUpdata = true;
    }
    setOrthographic( left = - 1, right = 1, bottom = - 1,  top = 1, near = 1, far = 2000 ) {
        const dx = right - left;
        const dy = top - bottom;
        const dz = far - near;
        this.array = [
            2/dx, 0, 0, 0,
            0, 2/dy, 0, 0,
            0, 0, -2/dz, 0,
            -(right+left)/dx, -(top+bottom)/dy, -(far+near)/dz, 1
        ];
        this.type = 'OrthographicMatrix4';
        this.message.needUpdata = true;
    }
    setPerspective( f, near, far, aspect ) {
        this.array = [
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (far + near) / (near - far), -1,
            0, 0, (2 * far * near) / (near - far), 0
        ];
        this.message.needUpdata = true;
    }
    
    Vector3SetViewMatrix4( vec_p, vec_l, vec_u ) {
        let zAxis = new Vector3().subVectors( vec_p , vec_l ); // forward
        zAxis.normalize();
        let xAxis = new Vector3().crossVectors( vec_u, zAxis );
        xAxis.normalize();
        let yAxis = new Vector3().crossVectors( zAxis, xAxis );
        yAxis.normalize();
        let px = -vec_p.dot( xAxis );
        let py = -vec_p.dot( yAxis );
        let pz = -vec_p.dot( zAxis );
        this.array = [
            xAxis.x, yAxis.x, zAxis.x, 0,
            xAxis.y, yAxis.y, zAxis.y, 0,
            xAxis.z, yAxis.z, zAxis.z, 0,
            px,       py,       pz,       1
        ];
        this.message.needUpdata = true;
    }
    setMatrix3( mat3 ){
        this.array = mat3.array;
        this.message.needUpdata = true;
    }
    warn( v ){
        if ( !v.isVector3 ) {
            console.warn( 'Vector3().warn(): \nThis ' + v + ' is not a Vector3' );
        }
    }
    
}

export { Matrix4 }