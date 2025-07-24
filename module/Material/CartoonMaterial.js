import { Vector4 } from '../core/Math/Vector/Vector4.js'

class CartoonMaterial {
    constructor() {
        this.type = 'CartoonMaterial';
        this.color = new Vector4( 1, 1, 1, 1 );
        this._DiffuseMap = null;
        
        this.ambientIntensity;       // 环境光强度
        this.ambientColor;            // 环境光颜色
        this.specularIntensity;      // 镜面反光强度
        this.shininess;              // 锐利度
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

export { CartoonMaterial }