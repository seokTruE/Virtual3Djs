import { Vector3, Matrix4, Entity3D, BasicMaterial } from "../Virtual3D.module.js"

class DirectonalLight extends Entity3D {
    constructor({
        position = { x: -6, y: 8, z: 10 },
        Euler = { x: 0, y: 0, z: 0 },
        scale = { x: 1, y: 1, z: 1 },
        quaternion = { x: 0, y: 1, z: 0, w: 1 },
    }={}) {
        super({ position, Euler, scale, quaternion });
        this.lookAt = new Vector3( 0, 0, 0 );
        this.up = new Vector3( 0, 1, 0 );
        this.updataForward();
        this.updataEuler();
        this.Material = new BasicMaterial();
        this.lightColor = new Vector3( 1, 1, 1 );
        this._intensity = 1.2;
        this.shadowResolution = 1024*8;
        this.viewScale = 8;
        this.near = 0.1;
        this.far = 50;
        this.message = {
            name : '',
            needintensity: true,
            needUpdataAttribute: true,
            needCoatShadow: true,
            renderIndex : -1,
            DirectonalLightIndex : -1,
            sceneLevel: 0,
            type: 'DirectonalLight',
            frameCount: 0,
            needUpdataShadowBuffer : true,
        }
        this.buffers =[];
        
        this.renderSetting = {
            needRender: true,
            DEPTH_TEST : true,
            CULL_FACE : 'BACK', // FRONT / FALSE
            pixelType : 'LINES',
            drawType : 'drawElements'
        }
        
        this.lightMatrix4 = new Matrix4();
        this.viewMatrix4 = new Matrix4();
    }

    setShadowTexture( gl ){
        this.buffers = [
            this.createShadowBuffer(gl),
            this.createShadowBuffer(gl),
        ]
        this.message.needUpdataShadowBuffer = false;
        
    }
    createShadowBuffer(gl) {
        const depthTexture = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0 + 15);
        gl.bindTexture(gl.TEXTURE_2D, depthTexture);

        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.DEPTH_COMPONENT16,
            this.shadowResolution,
            this.shadowResolution,
            0,
            gl.DEPTH_COMPONENT,
            gl.UNSIGNED_SHORT,
            null
        );

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        const depthFBO = gl.createFramebuffer();
    
        gl.bindFramebuffer(gl.FRAMEBUFFER, depthFBO);
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.DEPTH_ATTACHMENT,
            gl.TEXTURE_2D,
            depthTexture,
            0
        );
        const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if (status!== gl.FRAMEBUFFER_COMPLETE) {
            console.error('FBO 初始化失败，状态码:', status + this.getFramebufferStatusString(gl, status));
        }
        return { depthTexture, depthFBO }
    }
    recordLightScene( gl ) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.buffers[ (this.message.frameCount)%2 ].depthFBO );
        gl.viewport(0, 0, this.shadowResolution, this.shadowResolution);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.activeTexture( gl.TEXTURE0 + 15);
        gl.bindTexture(gl.TEXTURE_2D, this.buffers[ (this.message.frameCount+1)%2].depthTexture );
        this.message.frameCount ++;
    }
    restoreCameraScene( gl ) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    }

    // FBO状态字符串转换
    getFramebufferStatusString(gl, status) {
        switch(status) {
            case gl.FRAMEBUFFER_COMPLETE: return 'COMPLETE';
            case gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT: return 'INCOMPLETE_ATTACHMENT';
            case gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT: return 'MISSING_ATTACHMENT';
            case gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS: return 'INCOMPLETE_DIMENSIONS';
            case gl.FRAMEBUFFER_UNSUPPORTED: return 'UNSUPPORTED';
            case gl.FRAMEBUFFER_INCOMPLETE_MULTISAMPLE: return 'INCOMPLETE_MULTISAMPLE';
            default: return `未知状态 (${status})`;
        }
    }
    //------------------------------------------------------
    get intensity() {
        return this._intensity;
    }
    set intensity( value ) {
        this._intensity = value;
        this.message.needintensity = false;
    }
    setColor( r = 1, g = 1, b = 1, a = 1 ) {
        this.color.set( r, g, b, a );
    }
    setLookAt( x = 0, y = 0, z = 0 ) {
        this.lookAt = new Vector3( x, y, z );
    }
    updataLightAttribute() {
        if ( !this.color.message.needUpdata && !this.lookAt.message.needUpdata ) return false;
        this.color.message.needUpdata = false;
        this.lookAt.message.needUpdata = false;
        return true;
    }
    updataLightMatrix4() {
        if ( !this.canvas ) {
            this.aspect = 1;
        }
        this.lightMatrix4.setOrthographic(
            -this.viewScale, this.viewScale,
            -this.viewScale/this.aspect, this.viewScale/this.aspect,
            this.near, this.far
        );
        this.lightMatrix4.message.needUpdata = false;
    }
    updataViewMatrix4() {
        this.viewMatrix4.Vector3SetViewMatrix4( this.position, this.lookAt, this.up );
        this.viewMatrix4.message.needUpdata = false;
    }
    updataForward() {
        this.forward = new Vector3().subVectors( this.lookAt, this.position );
        // console.log( this.forward );
    }
    updataEuler() {
        let f = this.forward.normalize();
        let dy = Math.asin( -f.y ) * ( 180 / Math.PI );
        // console.log( dy )
        let dx = Math.atan( f.x / f.z ) * ( 180 / Math.PI );
        // console.log(dx);
        // this.Euler.y = dx;
        // this.Euler.x = dy;
    }
    updataAttribute(){
        let r = this.viewScale;
        // x this.position.x +- r * Math.hypot( -this.forward.y, -this.forward.z)
        // y this.position.y +- r * Math.hypot( -this.forward.x, -this.forward.z)
        // z this.position.z +- r * Math.hypot( -this.forward.x, -this.forward.y)
        // console.log(
        //     this.position.x + r * Math.hypot( -this.forward.y, -this.forward.z),this.position.y + r * Math.hypot( -this.forward.x, -this.forward.z), this.position.z + r * Math.hypot( -this.forward.x, -this.forward.y),
        //     this.position.x - r * Math.hypot( -this.forward.y, -this.forward.z),this.position.y + r * Math.hypot( -this.forward.x, -this.forward.z), this.position.z + r * Math.hypot( -this.forward.x, -this.forward.y),
        //     this.position.x - r * Math.hypot( -this.forward.y, -this.forward.z),this.position.y - r * Math.hypot( -this.forward.x, -this.forward.z), this.position.z + r * Math.hypot( -this.forward.x, -this.forward.y),
        //     this.position.x + r * Math.hypot( -this.forward.y, -this.forward.z),this.position.y - r * Math.hypot( -this.forward.x, -this.forward.z), this.position.z + r * Math.hypot( -this.forward.x, -this.forward.y)
        // )
        this.attribute = {
            vertices: [ 0,0,0, 0,0,-this.far,
                r,r,0, -r,r,0, -r,-r,0, r,-r,0
            ],
            normals: [ 0.0,0.0,0.0, 1.0,0.0,0.0],
            uvs: [ 0.0,0.0 ],
            indices: [ 0,1,2,3,3,4,4,5,5,2 ],
            offset : 0
        }
        this.message.needUpdataAttribute = false;
    }
}
export { DirectonalLight }