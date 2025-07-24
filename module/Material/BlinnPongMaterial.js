import { Vector4 } from '../core/Math/Vector/Vector4.js'

class BlinnPongMaterial {
    constructor({DiffuseMap:DiffuseMap}={}) {
        this.type = 'BlinnPongMaterial';
        this.color = new Vector4( 1, 1, 1, 1 );
        this._DiffuseMap = DiffuseMap;
        
        this.ambientIntensity;       // 环境光强度
        this.ambientColor;            // 环境光颜色
        this.diffuseIntensity = 0.4;
        this.specularIntensity = 0.2;      // 镜面反光强度
        this.shininess = 64.0;              // 锐利度

        this.acceptShadow = false;
        this.castShadow = false;
    //  {
    //     ambientIntensity: 1.0,
    // }={}
        this.message = {
            needUpdataDiffuseMap : true,
        }
    }

    set DiffuseMap ( url ){
        this._DiffuseMap = url;
        this.message.needUpdataDiffuseMap = true;
    }

    get DiffuseMap (){
        return this._DiffuseMap;
    }
}

export { BlinnPongMaterial }