const vertexShaderSource = `#version 300 es
    precision mediump float;
    in vec4 a_position;
    in vec3 a_normal;
    in vec2 a_uv;
    in vec3 a_velocity;
    in vec3 a_offsetPos;
    in vec4 a_color;
    in float a_size;
    
    out vec2 v_uv;
    out vec3 v_fragPos;
    out vec3 v_normal;
    out vec4 vShadowCoord;

    uniform mat4 u_cameraMatrix4;
    uniform mat4 u_viewMatrix4;
    uniform mat4 u_worldMatrix4;
    uniform mat3 u_normalMatrix3;

    uniform int u_spaceIndexInt;        // ndc / camera
    uniform int u_IntVMatricalIndex;

    struct DirectonalLight_v {
        bool needCoatShadow;
        mat4 lightMatrix4;
        mat4 viewMatrix4;
    };
    #define MAX_DirLight 4
    uniform DirectonalLight_v u_DirectonalLight_v[MAX_DirLight];
    
    void main() {
        
        if ( u_spaceIndexInt == 2 ) {
            for(int i = 0; i < MAX_DirLight; i++) {
                if (i >= MAX_DirLight ) break;
                if ( u_DirectonalLight_v[i].needCoatShadow ) {
                    vec4 worldPosition = u_worldMatrix4 * a_position;
                    vec4 viewPosition = u_DirectonalLight_v[i].viewMatrix4 * worldPosition;
                    gl_Position = u_DirectonalLight_v[i].lightMatrix4 * viewPosition;
                
                }
            }
        } else if ( u_spaceIndexInt == 1 ) {
            v_uv = a_uv;
            vec4 worldPosition = u_worldMatrix4 * a_position;
            vec4 viewPosition = u_viewMatrix4 * worldPosition;
            if ( u_IntVMatricalIndex == 1 || u_IntVMatricalIndex == 2 || u_IntVMatricalIndex == 3 ) {
                v_fragPos = worldPosition.xyz;
                v_normal = u_normalMatrix3 * a_normal;

                for(int i = 0; i < MAX_DirLight; i++) {
                    if (i >= MAX_DirLight ) break;
                    if ( u_DirectonalLight_v[i].needCoatShadow ) {
                        vShadowCoord = u_DirectonalLight_v[i].lightMatrix4 * u_DirectonalLight_v[i].viewMatrix4 * worldPosition;
                    }
                }
            }
            gl_Position = u_cameraMatrix4 * viewPosition;
        } else if ( u_spaceIndexInt == 0 ) {
        
        }

        gl_PointSize = 1.0;
    }
`;

const fragmentShaderSource = `#version 300 es
    precision mediump float;
    in vec4 vShadowCoord;
    in vec2 v_uv;
    in vec3 v_fragPos;
    in vec3 v_normal;
    out vec4 FragColor;
    uniform int u_IntFMatricalIndex;
    uniform bool u_BoolUseTexture;
    uniform int u_BoolOutColor;
    uniform vec4 u_color;
    uniform sampler2D u_sampler;
    uniform sampler2D u_shadowMap;
    uniform vec3 u_ambientLightColor;
    uniform float u_ambientLightIntensity;
    uniform float u_diffuseIntensity;
    uniform float u_specularIntensity;
    uniform float u_shininess;
    uniform vec3 u_cameraPostion;
    struct BlinnPhongMatrices {
        float u_diffuseIntensity;
        float u_specularIntensity;
        float u_shininess;
        bool acceptShadow;
        bool castShadow;
    };
    struct DirectonalLight {
        vec3 position;
        vec3 lookAt;
        vec3 color;
        float intensity;
    };
    #define MAX_DirLight 4
    uniform DirectonalLight u_DirectonalLight[MAX_DirLight];
    float DiffuseResult( vec3 normal, vec3 Dirlight ) {
        float diff = max(dot( normal, Dirlight), 0.0);
        return diff;
    }
    float SpecularResult( vec3 normal, vec3 Dirlight, vec3 viewDir) {
        vec3 halfwayDir = normalize( Dirlight + viewDir );
        float spec = pow(max(dot(normal, halfwayDir), 0.0), u_shininess ); // 32.0
        return spec;
    } 
    float CartoonDiscrete( float f ) {
        if ( f > 0.7 ) {
            f = 1.0;
        } else if ( f < 0.7 ) {
            f = 0.5;
        } 
        // else {diff = 0.3;}
        return f;
    }
    float PointToLiine(vec3 fragmentPosition, vec3 rayStart, vec3 rayDir) {
        vec3 startToPoint = fragmentPosition - rayStart;
        float rayLengthSq = dot(rayDir, rayDir);
        if(rayLengthSq < 1e-6) {
            return dot(startToPoint, startToPoint);
        }
        float t = dot(startToPoint, rayDir) / rayLengthSq;
        vec3 nearestVec = startToPoint - rayDir * t;
        return dot(nearestVec, nearestVec);
    }
    float calculateShadow(vec4 vShadowCoord) {
        vec3 projCoords = vShadowCoord.xyz / vShadowCoord.w;
        projCoords = projCoords * 0.5 + 0.485;
        float currentDepth = projCoords.z;
        float closestDepth = texture(u_shadowMap, projCoords.xy).r;
        return currentDepth > closestDepth ? 1.0 : 0.0;
    }
    void main() {
        if ( u_BoolOutColor == 1 ) {
            vec4 baseColor = u_BoolUseTexture ? texture(u_sampler, v_uv) : u_color; // 83
            if ( u_IntFMatricalIndex == 0 ) {

                FragColor = baseColor;

            } else if ( u_IntFMatricalIndex == 1 || u_IntFMatricalIndex == 2 ) {
                vec3 ambient = u_ambientLightColor * u_ambientLightIntensity;
                vec3 normal = normalize( v_normal );
                vec3 viewDir = normalize( u_cameraPostion - v_fragPos);
                vec3 result = vec3(0.0);
                for(int i = 0; i < MAX_DirLight; i++) { // 91
                    if(i >= MAX_DirLight ) break;
                    vec3 Dirlight = normalize( - ( u_DirectonalLight[i].lookAt - u_DirectonalLight[i].position ) );
                    float PointToLiineDistance = PointToLiine( v_fragPos, u_DirectonalLight[i].position, ( u_DirectonalLight[i].lookAt - u_DirectonalLight[i].position ));
                    if ( PointToLiineDistance < 64.0 ) { 
                        if ( u_diffuseIntensity != 0.0 ) {
                            result += DiffuseResult( normal, Dirlight )  * u_DirectonalLight[i].intensity * u_diffuseIntensity * u_DirectonalLight[i].color;
                        }
                        if ( u_specularIntensity != 0.0 ) {
                            result += SpecularResult( normal, Dirlight, viewDir )  * u_DirectonalLight[i].intensity * u_specularIntensity * u_DirectonalLight[i].color;
                        }
                    }
                }
                float shadow = calculateShadow( vShadowCoord );
                FragColor = vec4((ambient + (1.0 - shadow) * result)*baseColor.rgb, baseColor.a);
                return;
            }else if ( u_IntFMatricalIndex == -1 ) {

            }
        } else if ( u_BoolOutColor == 0 ) {
            // float depth = gl_FragCoord.z * 0.5 + 0.5;
            // FragColor = vec4(depth, depth, depth, 1.0);
        }
    }
`;

export { vertexShaderSource, fragmentShaderSource }