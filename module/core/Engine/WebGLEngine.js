import * as mainShader from '../../Shaders/GLSL/shader.js'
import * as mirrorShader from '../../Shaders/GLSL/mirrorShader.js'
import * as Utility from '../Math/Utility.js'

import { BasicMaterial } from '../../Material/BasicMaterial.js'
import { createProgram, Vector3, Vector4 } from '../../Virtual3D.module.js'

class WebGLEngine {
    constructor( canvas ) {
        document.body.style.overflow = 'auto';
        this.DOMElement = canvas;
        if ( !this.DOMElement ) {
            this.DOMElement = document.createElement('canvas');
            this.DOMElement.cssText = `
            `;
            this.autoFullScreen();
            document.body.appendChild( this.DOMElement );
            // document.getElementById('root').appendChild( this.DOMElement );
        }
        this.DOMElement.V_msg = {
            needUpdataCameraMatrix4: true,
            needUpdataViewMatrix4: true,
        }
        this.backgroundColor = new Vector4( 0.3, 0.3, 0.5, 1.0 );
        // this.backgroundColor = new Vector4( 0.0, 0.0, 0.0, 1.0 );
        this.gl = this.DOMElement.getContext('webgl2', { 
            antialias: true,
        });
        if ( !this.gl ) {
            alert('不支持 WebGL2');
        this.gl = this.DOMElement.getContext('webgl');
        } else {
            try {

            } catch ( error ) {
                console.error('WebGL 错误:', error.message);
            }
        }
        this.gl.clearColor( this.backgroundColor.x , this.backgroundColor.y , this.backgroundColor.z , this.backgroundColor.w );
        
        this.gl.enable( this.gl.BLEND );
        this.gl.blendFunc( this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA );
        
        this.gl.enable( this.gl.DEPTH_TEST );
        this.gl.enable( this.gl.CULL_FACE );
        this.gl.cullFace( this.gl.BACK );
        this.ambientLightColor = new Vector3( 1, 1, 1 );
        this.ambientLightIntensity = 0.7;

        this.message = {
            CameraController: true,
            monitorParent: true,
            warnIndices: 0,
        }

        this.DiffuseMapArray = []; // url

        this.DEPTHTEST_CoatShadow_list = [];
        this.DEPTH_TEST_true_list = [];
        this.DEPTH_TEST_false_list = [];

        this.DirectonalLight_count = 0;
        this.DirectonalLight_list = [];
        
        this.program = createProgram( this.gl, mainShader.vertexShaderSource, mainShader.fragmentShaderSource  );
        // this.mirror_program = createProgram( this.gl, mirrorShader.vertexShaderSource, mirrorShader.fragmentShaderSource  );
        this.setProgram();
        // this.setMirror_Program();
        
        // this.Detector();
    }

    setMirror_Program() {
        this.gl.useProgram( this.mirror_program );
        this.a_position = this.gl.getAttribLocation( this.program,'a_position');
        this.u_lightMatrix4 = this.gl.getUniformLocation( this.program, 'u_lightMatrix4');
        this.u_viewMatrix4 = this.gl.getUniformLocation( this.program , 'u_viewMatrix4');
        this.u_worldMatrix4 = this.gl.getUniformLocation( this.program , 'u_worldMatrix4');

    }
    setProgram() {
        this.gl.useProgram( this.program );
        this.a_position = this.gl.getAttribLocation( this.program,'a_position');
        this.a_normal = this.gl.getAttribLocation( this.program, 'a_normal');
        this.a_uv = this.gl.getAttribLocation( this.program, 'a_uv');

        this.u_cameraMatrix4 = this.gl.getUniformLocation( this.program, 'u_cameraMatrix4');
        this.u_viewMatrix4 = this.gl.getUniformLocation( this.program , 'u_viewMatrix4');
        this.u_worldMatrix4 = this.gl.getUniformLocation( this.program , 'u_worldMatrix4');
        this.u_normalMatrix3 = this.gl.getUniformLocation( this.program , 'u_normalMatrix3');

        this.u_spaceIndexInt = this.gl.getUniformLocation( this.program, 'u_spaceIndexInt');
        this.gl.uniform1i( this.u_spaceIndexInt, 1 ); // set space
        this.u_BoolOutColor = this.gl.getUniformLocation( this.program, 'u_BoolOutColor');
        this.gl.uniform1i( this.u_BoolOutColor, 1 );

        this.u_IntVMatricalIndex = this.gl.getUniformLocation( this.program, 'u_IntVMatricalIndex');
        this.u_IntFMatricalIndex = this.gl.getUniformLocation( this.program, 'u_IntFMatricalIndex');

        this.u_color = this.gl.getUniformLocation( this.program, 'u_color');
        this.u_sampler = this.gl.getUniformLocation( this.program, 'u_sampler');
        this.u_shadowMap = this.gl.getUniformLocation( this.program, 'u_shadowMap');
        this.u_BoolUseTexture = this.gl.getUniformLocation( this.program, 'u_BoolUseTexture');
        this.u_diffuseIntensity = this.gl.getUniformLocation( this.program, 'u_diffuseIntensity');
        this.u_specularIntensity = this.gl.getUniformLocation( this.program, 'u_specularIntensity');
        this.u_shininess = this.gl.getUniformLocation( this.program, 'u_shininess');
        
        this.u_ambientLightColor = this.gl.getUniformLocation( this.program, `u_ambientLightColor` );
        this.u_ambientLightIntensity = this.gl.getUniformLocation( this.program, 'u_ambientLightIntensity');
        this.u_cameraPosition = this.gl.getUniformLocation( this.program, 'u_cameraPostion');

        // 1. 创建UBO
        // const ubo = this.gl.createBuffer();
        // this.gl.bindBuffer(this.gl.UNIFORM_BUFFER, ubo);
        // this.gl.bufferData(this.gl.UNIFORM_BUFFER, 100 * 16 * 4, this.gl.DYNAMIC_DRAW); // 100个mat4

        // // 2. 获取Uniform Block索引并绑定到绑定点0
        // const blockIndex = this.gl.getUniformBlockIndex(this.program, "Matrices");
        // console.log(blockIndex)
        // this.gl.uniformBlockBinding(this.program, blockIndex, 0);
        // // 3. 绑定UBO到绑定点0
        // this.gl.bindBufferBase(this.gl.UNIFORM_BUFFER, 0, ubo);

        // // 4. 填充数据示例（更新第0个矩阵）
        // const matrix0 = new Float32Array([
        // 1,0,0,0,  
        // 0,1,0,0,
        // 0,0,1,0,
        // 0,0,0,1
        // ]);
        // this.gl.bufferSubData(this.gl.UNIFORM_BUFFER, 0, matrix0);
    }

    bindCamera( camera ) {
        if ( !camera && camera.message.type === 'OrthographicCamera' && camera.message.type === 'PerspectiveCamera' ) return
        camera.canvas = this.DOMElement;
        this.camera = camera;
    }

    render( scene ) {
        let gl = this.gl
        gl.clear( gl.COLOR_BUFFER_BIT );
        this.gl.enable( this.gl.DEPTH_TEST );
        if ( this.ambientLightColor.message.needUpdata ) {
            this.gl.uniform3fv( this.u_ambientLightColor, this.ambientLightColor.toArray());
            this.gl.uniform1f( this.u_ambientLightIntensity, this.ambientLightIntensity);
            this.ambientLightColor.message.needUpdata = false;
        }

        if ( this.DOMElement.V_msg.needUpdataCameraMatrix4 ) {
            this.camera.updataCameraMatrix4();
            gl.uniformMatrix4fv( this.u_cameraMatrix4, false, this.camera.cameraMatrix4.array );
            this.DOMElement.V_msg.needUpdataCameraMatrix4 = false;
        }
        if ( this.DOMElement.V_msg.needUpdataViewMatrix4 ) {
            this.camera.updataViewMatrix4();
            gl.uniformMatrix4fv( this.u_viewMatrix4, false, this.camera.viewMatrix4.array );
            gl.uniform3fv( this.u_cameraPosition, this.camera.position.toArray() );
            this.DOMElement.V_msg.needUpdataViewMatrix4 = false;
        }

        this.parseParentAttribute( scene );
        this.addWorldMatrix4OfParent( scene );

        this.gl.uniform1i( this.u_BoolOutColor, 0 );
        this.gl.uniform1i( this.u_spaceIndexInt, 2 );
        this.setDirectonalLight( this.DirectonalLight_list );

        this.gl.uniform1i( this.u_BoolOutColor, 1 );
        this.gl.uniform1i( this.u_spaceIndexInt, 1 );
        this.selectShader( this.DEPTHTEST_CoatShadow_list );
        this.selectShader( this.DEPTH_TEST_true_list );

        this.DirectonalLight_list = [];
        this.DEPTHTEST_CoatShadow_list = [];
        this.DEPTH_TEST_true_list = [];
    }
    
    parseParentAttribute( scene ) {
        for ( let entity3d of scene.children ) {
            if ( entity3d.renderSetting.needRender && entity3d.message.needUpdataAttribute ) {
                entity3d.updataAttribute();
                this.setBuffer( entity3d );
                entity3d.message.needUpdataAttribute = false;
            }
            if ( entity3d.renderSetting.needRender ) {
                // 分配渲染管线
                if ( entity3d.renderSetting.DEPTH_TEST && entity3d.message.needCoatShadow ) {
                    this.DEPTHTEST_CoatShadow_list.push( entity3d ); 
                } else if ( entity3d.renderSetting.DEPTH_TEST && !entity3d.message.needCoatShadow) {
                    this.DEPTH_TEST_true_list.push( entity3d ); 
                } else if ( !entity3d.renderSetting.DEPTH_TEST ) {
                    this.DEPTH_TEST_false_list.push( entity3d );
                }
            }

            if (entity3d.message.type == 'DirectonalLight') {
                this.DirectonalLight_list.push( entity3d )
                
            }
            // 递归
            if ( (entity3d.message.type == 'Scene' || entity3d.message.type == 'Group') && entity3d.children.length > 0 ) {
                this.parseParentAttribute( entity3d )
            }
        }
    }
    addWorldMatrix4OfParent( parent ) { // updataMatrix4
        if ( parent.needUpdataModelMatrix4() ) {
            if ( parent.message.type ) {
                // console.log( parent.message.type )
            }
            parent.updataMatrix4();
            parent.worldMatrix4.array = parent.modelMatrix4.array;
            parent.message.needUdpdataChildren = true;
        }
        for ( let entity3d of parent.children ) {
            if ( entity3d.needUpdataModelMatrix4() || entity3d.needUpdataAddlMatrix4() ) {
                entity3d.updataMatrix4();
                entity3d.message.needUdpdataChildren = true;
            }
                // 此处需要优化性能
                entity3d.worldMatrix4.array = Utility.multiplyMatrix4( entity3d.modelMatrix4.array, parent.worldMatrix4.array); 
                entity3d.normalMatrix3 = Utility.transposeMatrix3(
                    Utility.inverseMatrix3(Utility.toMatrix3( entity3d.worldMatrix4))
                );
            if ( parent.message.needUdpdataChildren || entity3d.message.needUdpdataChildren){
                parent.message.needUdpdataChildren = false;
                entity3d.message.needUdpdataChildren = false;
            }
            // 后面使用glsl矩阵索引
            // 递归
            if ( (entity3d.message.type == 'Scene' || entity3d.message.type == 'Group') && entity3d.children.length > 0 ) {
                this.addWorldMatrix4OfParent( entity3d )
            }
            // 此函数仍然有重大缺陷
        }
    }
    setDirectonalLight( array ) {
        let gl = this.gl;
        let program = this.program;
        let i = 0;
        for ( let entity3d of array ) {
            if ( true ) {
                // if ( entity3d.position.message.needUpdata ){
                //     console.log( entity3d.position.message.needUpdata )
                //     gl.uniform3fv(gl.getUniformLocation( program, `u_DirectonalLight[${i}].position` ), entity3d.position.toArray());
                // }
                gl.uniform3fv(gl.getUniformLocation( program, `u_DirectonalLight[${i}].position` ), entity3d.position.toArray());
                if ( entity3d.lookAt.message.needUpdata ){
                    gl.uniform3fv(gl.getUniformLocation( program, `u_DirectonalLight[${i}].lookAt` ), entity3d.lookAt.toArray());
                    entity3d.lookAt.message.needUpdata = false;
                }
                if ( entity3d.lightColor.message.needUpdata ){
                    gl.uniform3fv(gl.getUniformLocation( program, `u_DirectonalLight[${i}].color`), entity3d.lightColor.toArray());
                    entity3d.lightColor.message.needUpdata = false;
                }
                if ( entity3d.message.needintensity ) {
                    gl.uniform1f(gl.getUniformLocation( program, `u_DirectonalLight[${i}].intensity`), entity3d.intensity);
                    entity3d.message.needintensity = false;
                }
                if ( entity3d.message.needCoatShadow ) {

                    gl.uniform1i( gl.getUniformLocation( this.program, `u_DirectonalLight[${i}].needCoatShadow`), 1 );
                    gl.uniform1i( gl.getUniformLocation( this.program, `u_DirectonalLight_v[${i}].needCoatShadow`), 1 );
                    if ( entity3d.lightMatrix4.message.needUpdata ) {
                        entity3d.updataLightMatrix4();
                        gl.uniformMatrix4fv( gl.getUniformLocation( program, `u_DirectonalLight_v[${i}].lightMatrix4` ), false, entity3d.lightMatrix4.array );
                    }
                    if ( entity3d.viewMatrix4.message.needUpdata ) {
                        entity3d.updataViewMatrix4();
                        gl.uniformMatrix4fv( gl.getUniformLocation( program, `u_DirectonalLight_v[${i}].viewMatrix4` ), false, entity3d.viewMatrix4.array );
                    }
                    if ( entity3d.message.needUpdataShadowBuffer ) {
                        entity3d.setShadowTexture( gl );
                        entity3d.message.needUpdataShadowBuffer = false;
                    }
                    entity3d.recordLightScene( gl );
                    this.selectShader( this.DEPTHTEST_CoatShadow_list );

                    entity3d.restoreCameraScene( gl );
                    if ( this.message.warnIndices = 0 ) {;
                        this.message.warnIndices = false;
                    }
                    gl.uniform1i( this.u_shadowMap, 15 )
                }
                entity3d.message.DirectonalLightIndex = i;
            }
            i++;
        }
        i = 0;
    }
    
    debugTextureUnit( unit, gl ) {
        if ( !gl ) {
            let gl = this.gl;
        }
        // 查询当前单元绑定的纹理目标
        const target = gl.getParameter(gl.TEXTURE_BINDING_2D + unit); 
        console.log(`纹理单元 ${unit} 绑定的纹理：`, target);
    }
    setBuffer( element ) {
        if ( element.Material == null || element.Material == undefined || element.Material == '' ) {
            element.Material = new BasicMaterial();
        }
        let gl = this.gl;
        element.updataAttribute();
        element.offsetPos();
        element.buffer.VAO = gl.createVertexArray();
        gl.bindVertexArray( element.buffer.VAO );

        if ( element.attribute.vertices.length > 0 ) {
            if ( this.a_position !== -1 ) {
                if ( !element.buffer.verticesBuffer ) {
                    element.buffer.verticesBuffer = gl.createBuffer();
                }
                gl.bindBuffer( gl.ARRAY_BUFFER, element.buffer.verticesBuffer );
                gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( element.attribute.vertices ), gl.STATIC_DRAW);
                gl.vertexAttribPointer( this.a_position, 3, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray( this.a_position );
            } else {
                console.error('Attribute location not found for a_position');
            }
        } else if ( !element.attribute.vertices.length > 0 ) {
            console.warn( element.message.name +':attribute.vertices.length must > 0');
        }

        if ( element.Material.type !== 'BasicMaterial' ) {
            if ( element.attribute.normals.length > 0 ) {
                if ( this.a_normal !== -1 ) {
                    if ( !element.buffer.normalsBuffer ) {
                        element.buffer.normalsBuffer = gl.createBuffer();
                    }
                    gl.bindBuffer( gl.ARRAY_BUFFER, element.buffer.normalsBuffer );
                    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( element.attribute.normals ), gl.STATIC_DRAW);
                    gl.vertexAttribPointer( this.a_normal, 3, gl.FLOAT, false, 0, 0 );
                    gl.enableVertexAttribArray( this.a_normal );
                } else {
                    console.error('Attribute location not found for a_normal');
                }
            } else if ( !element.attribute.normals.length > 0 ) {
                console.warn( element.message.name +':attribute.normals.length must > 0');
            }
        }

        if ( element.attribute.uvs.length > 0 ) {
            if ( this.a_uv !== -1 ) {
                if ( !element.buffer.uvsBuffer ) {
                    element.buffer.uvsBuffer = gl.createBuffer();
                }
                gl.bindBuffer( gl.ARRAY_BUFFER, element.buffer.uvsBuffer );
                gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( element.attribute.uvs ), gl.STATIC_DRAW);
                gl.vertexAttribPointer( this.a_uv, 2, gl.FLOAT, false, 0, 0 );
                gl.enableVertexAttribArray( this.a_uv );
            } else {
                console.error('Attribute location not found for a_uv');
            }
        } else if ( !element.attribute.uvs.length > 0 ) {
            console.warn( element.message.name +':attribute.uvs.length must > 0');
        }
    
        if ( element.attribute.indices.length > 0 ) {
            element.buffer.indexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, element.buffer.indexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( element.attribute.indices ), gl.STATIC_DRAW);
        } else {
            console.warn('indices = 0')
        }

        gl.bindVertexArray(null);

        if ( element.Material.DiffuseMap != null && element.Material.DiffuseMap != undefined && element.Material.DiffuseMap !== '' ) { // 如果纹理数据不为空
            for ( let i = 0; i < this.DiffuseMapArray.length + 1; i++ ) {
                if ( this.DiffuseMapArray[ i ] === element.Material.DiffuseMap ) {
                    element.Material.DiffuseMapIndex = i;
                    break;
                }
            }
            if ( !element.Material.DiffuseMapIndex ) {
                this.DiffuseMapArray.push( element.Material.DiffuseMap );
                element.Material.DiffuseMapIndex = this.DiffuseMapArray.length - 1;
                if ( this.DiffuseMapArray.length > gl.getParameter( gl.MAX_TEXTURE_IMAGE_UNITS ) - 1 ) {
                    console.error( '纹理数量超过最大值' );
                }
            }  
        } else {

        }

        this.loadTextureArray( this.DiffuseMapArray );

    }

    selectShader( array ) {
        for ( let entity3d of array ) { 
            // 处理材质
            this.gl.bindVertexArray( entity3d.buffer.VAO );

            if ( entity3d.Material.DiffuseMapIndex > -1 ) {
                this.gl.uniform1i( this.u_BoolUseTexture, 1 );
                this.gl.uniform1i( this.u_sampler, entity3d.Material.DiffuseMapIndex );
            } else {
                this.gl.uniform1i( this.u_BoolUseTexture, 0 );
                this.gl.uniform4f( this.u_color, entity3d.Material.color.x, entity3d.Material.color.y, entity3d.Material.color.z, entity3d.Material.color.w );
            }
            
            if ( entity3d.Material.type == 'CartoonMaterial' ) {
                this.gl.uniform1i( this.u_IntVMatricalIndex, 2 );
                this.gl.uniform1i( this.u_IntFMatricalIndex, 2 );
                this.draw( entity3d );
            } else if ( entity3d.Material.type == 'BlinnPongMaterial' ) {
                this.gl.uniform1i( this.u_IntVMatricalIndex, 1 );
                this.gl.uniform1i( this.u_IntFMatricalIndex, 1 );

                this.gl.uniform1f( this.u_diffuseIntensity, entity3d.Material.diffuseIntensity );
                this.gl.uniform1f( this.u_specularIntensity, entity3d.Material.specularIntensity );
                this.gl.uniform1f( this.u_shininess, entity3d.Material.shininess );

                this.draw( entity3d );
            } else if ( entity3d.Material.type == 'BasicMaterial' ) {
                this.gl.uniform1i( this.u_IntVMatricalIndex, 0 );
                this.gl.uniform1i( this.u_IntFMatricalIndex, 0 );
                this.draw( entity3d );
            } else if ( entity3d.Material.type == 'test' ){
                this.gl.uniform1i( this.u_IntVMatricalIndex, 1 );
                this.gl.uniform1i( this.u_IntFMatricalIndex, -1 );
                this.draw( entity3d );
            }

            this.gl.bindVertexArray( null );
        }
    }

    draw( entity3d ) {
        // let gl = this.gl
        this.gl.uniformMatrix4fv( this.u_worldMatrix4, false, entity3d.worldMatrix4.array );
        this.gl.uniformMatrix3fv( this.u_normalMatrix3, false, entity3d.normalMatrix3.array );
        if ( entity3d.renderSetting.drawType == 'drawElements' && entity3d.attribute.indices.length > 0 ) {
            this.drawElements( entity3d );
        } else if ( entity3d.renderSetting.drawType == 'drawArrays'/* ||  entity3d.attribute.indices.length == 0*/) {
            this.drawElements( entity3d );
        } else if ( entity3d.renderSetting.drawType == 'drawArrays'/* ||  entity3d.attribute.indices.length == 0*/) {
            this.drawElements( entity3d );
        } 
    }
    drawElementsInstanced( entity ) {

    }

    drawElements( entity ) {
        let gl = this.gl;
        if ( entity.renderSetting.pixelType === 'TRIANGLE_FAN' ) {
            gl.drawElements( gl.TRIANGLE_FAN, entity.attribute.indices.length, gl.UNSIGNED_SHORT, 0 );
        } else if ( entity.renderSetting.pixelType === 'TRIANGLES' ) {
            gl.drawElements( gl.TRIANGLES, entity.attribute.indices.length, gl.UNSIGNED_SHORT, 0 );
        } else if ( entity.renderSetting.pixelType === 'LINES' ) {
            gl.drawElements( gl.LINES, entity.attribute.indices.length, gl.UNSIGNED_SHORT, 0);
        } else if ( entity.renderSetting.pixelType === 'LINE_LOOP' ) {
            gl.drawElements( gl.LINES, entity.attribute.indices.length, gl.UNSIGNED_SHORT, 0);
        } else if ( entity.renderSetting.pixelType === 'LINE_STRIP' ) {
            gl.drawElements( gl.LINES, entity.attribute.indices.length, gl.UNSIGNED_SHORT, 0);
        } else if ( entity.renderSetting.pixelType === 'POINTS' ) {
            gl.drawElements( gl.POINTS, entity.attribute.indices.length, gl.UNSIGNED_SHORT, 0);
        } else {
            // console.warn( entity.message.type + ': this entity.renderSetting.pixelType is error');
            gl.drawElements( gl.POINTS, entity.attribute.indices.length, gl.UNSIGNED_SHORT, 0);
        }
    }
    drawArrays( entity ) {
        let gl = this.gl;
        if ( entity.renderSetting.pixelType === 'POINTS' ) {
            gl.drawArrays( gl.POINTS, 0, entity.attribute.vertices.length );
        }
    }

    loadTextureArray( textureArray ) {
        let gl = this.gl;
        for ( let textureUnit = 0; textureUnit < textureArray.length; textureUnit++ ) {
            const texture = gl.createTexture();
            const image = new Image();
            image.src = textureArray[ textureUnit ];
            image.onload = function () {
                function isPowerOf2(value) {
                    return (value & (value - 1)) === 0;
                }
                const isPowerOf2Width = isPowerOf2(image.width);
                const isPowerOf2Height = isPowerOf2(image.height);
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
                gl.activeTexture(gl.TEXTURE0 + textureUnit);
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.texImage2D(
                    gl.TEXTURE_2D,
                    0,
                    gl.RGBA,
                    gl.RGBA,
                    gl.UNSIGNED_BYTE,
                    image
                );

                if (isPowerOf2Width && isPowerOf2Height) {
                    gl.generateMipmap(gl.TEXTURE_2D);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
                } else {
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                }
            };
        }
    }
    Detector() {
        // 获取顶点缓冲区的最大容量（字节）
        // const maxBufferSize = this.gl.getParameter(this.gl.MAX_ARRAY_BUFFER_SIZE);
        // console.log('Max Buffer Size:', maxBufferSize); // 例如 268435456（256MB）

        // 获取索引缓冲区的最大容量（字节）
        const maxElementsIndices = this.gl.getParameter( this.gl.MAX_ELEMENTS_INDICES );
        console.log('Max Elements in Indices:', maxElementsIndices);

        // 获取顶点属性最大数量
        const maxVertexAttribs = this.gl.getParameter( this.gl.MAX_VERTEX_ATTRIBS );
        console.log('Max Vertex Attributes:', maxVertexAttribs); // 例如 16

        // 纹理单元数量最大值
        const maxTextureUnits = this.gl.getParameter( this.gl.MAX_TEXTURE_IMAGE_UNITS );
        console.log( 'Max Texture Units:' , maxTextureUnits );

                
        console.log('深度写入状态:', this.gl.getParameter(this.gl.DEPTH_WRITEMASK) ? '启用' : '禁用');
        console.log('深度测试状态:', this.gl.getParameter(this.gl.DEPTH_TEST) ? '启用' : '禁用');

        // 检查UBO是否可用
        const maxUBOSize = this.gl.getParameter(this.gl.MAX_UNIFORM_BUFFER_SIZE);
        if (maxUBOSize < 16384) { // 典型最小值16KB
        console.warn("UBO支持不足，改用纹理传递矩阵");
        } else{
            console.log("UBO支持");
        }
        
        // 查询硬件支持的最大矩阵数量
        const maxVectors = this.gl.getParameter(this.gl.MAX_VERTEX_UNIFORM_VECTORS);
        const maxMatrices = Math.floor(maxVectors / 4); // 每个mat4占4个vec4
        console.log(`最大支持矩阵数: ${maxMatrices}`); // 典型值：256-1024
    }
    autoFullScreen() {
        this.fullscreen();
        let timer;
        window.addEventListener("load", () => {
            window.addEventListener("resize", () => {
                clearTimeout(timer);
                timer = setTimeout(() => {
                    this.fullscreen();
                    this.DOMElement.V_msg.needUpdataCameraMatrix4 = true; // 
                }, 200);
            });
        });
    }
    fullscreen() {
        this.DOMElement.height = window.innerHeight * window.devicePixelRatio;
        this.DOMElement.width = window.innerWidth * window.devicePixelRatio;
        this.DOMElement.style.cssText = `
            position: absolute;
            left: 0;
            top: 0;
            scale: ${ 1/window.devicePixelRatio };
        `;
        if ( this.gl ) this.gl.viewport( 0, 0, this.DOMElement.width, this.DOMElement.height );
    }
    monitorParent( parent ) {
        parent.offetWidth
        this.setSize( parent.offetWidth, parent.offetHeight );
    }
    setSize( width = 300, height = 300 ) {
        this.DOMElement.width = width;
        this.DOMElement.height = height;
        this.setViewPort( width, height );
    }
    setViewPort( width, height ) {
        if ( this.gl ) this.gl.viewport( 0, 0, width, height );
    }
}

export { WebGLEngine }