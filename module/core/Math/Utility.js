function multiplyMatrix4(a, b) {
    let isAIdentity = ifIdentityMatrix4( a );
    if (isAIdentity) return b.slice();

    let isBIdentity = ifIdentityMatrix4( b );
    if (isBIdentity) return a.slice();

    let result = new Array(16).fill(0);
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            for (let k = 0; k < 4; k++) {
                result[i * 4 + j] += a[i * 4 + k] * b[k * 4 + j];
            }
        }
    }
    return result;
}

function ifIdentityMatrix4( array ) {
    let result = true;
    for (let i = 0; i < 16; i++) {
        if (i % 5 === 0) {
            if ( array[i] !== 1 ) {
                result = false;
                break;
            }
        } else {
            if ( array[i] !== 0 ) {
                result = false;
                break;
            }
        }
    }
    return result;
}

function normalize (vec) {
        const len = Math.hypot(...vec);
        return vec.map(v => v / len);
}

function subtract ( a, b) {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function dot ( a, b) {
        return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function cross(a, b) {
    return [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0]
    ];
}
function inverseMatrix3( mat3 ) {
    // 计算行列式
    const det = mat3.array[0] * ( mat3.array[4] * mat3.array[8] - mat3.array[7] * mat3.array[5]) 
              - mat3.array[1] * ( mat3.array[3] * mat3.array[8] - mat3.array[6] * mat3.array[5]) 
              + mat3.array[2] * ( mat3.array[3] * mat3.array[7] - mat3.array[6] * mat3.array[4]);
    
    // 避免除以零
    if (Math.abs(det) < 1e-8) mat3.array = [1,0,0, 0,1,0, 0,0,1];

    const invDet = 1.0 / det;
    
    // 计算逆矩阵
    const inv = [
        ( mat3.array[4]*mat3.array[8] - mat3.array[5]*mat3.array[7]) * invDet,
        ( mat3.array[2]*mat3.array[7] - mat3.array[1]*mat3.array[8]) * invDet,
        ( mat3.array[1]*mat3.array[5] - mat3.array[2]*mat3.array[4]) * invDet,
        ( mat3.array[5]*mat3.array[6] - mat3.array[3]*mat3.array[8]) * invDet,
        ( mat3.array[0]*mat3.array[8] - mat3.array[2]*mat3.array[6]) * invDet,
        ( mat3.array[2]*mat3.array[3] - mat3.array[0]*mat3.array[5]) * invDet,
        ( mat3.array[3]*mat3.array[7] - mat3.array[4]*mat3.array[6]) * invDet,
        ( mat3.array[1]*mat3.array[6] - mat3.array[0]*mat3.array[7]) * invDet,
        ( mat3.array[0]*mat3.array[4] - mat3.array[1]*mat3.array[3]) * invDet
    ];
    return {array:inv}
}
function transposeMatrix3( mat3 ) {
    // console.log( mat3.array[0] )
    let result = {
        array:[
            mat3.array[0], mat3.array[3], mat3.array[6],
            mat3.array[1], mat3.array[4], mat3.array[7],
            mat3.array[2], mat3.array[5], mat3.array[8]
        ]
    };
    return result;
}
function toMatrix3( mat4 ) {
    return {
        array:[
            mat4.array[0],
            mat4.array[1],
            mat4.array[2],
            mat4.array[4],
            mat4.array[5],
            mat4.array[6],
            mat4.array[8],
            mat4.array[9],
            mat4.array[10]
        ]
    }
}
export { multiplyMatrix4,inverseMatrix3,transposeMatrix3,toMatrix3 }