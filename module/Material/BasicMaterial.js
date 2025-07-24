import { Vector4 } from '../core/Math/Vector/Vector4.js'

class BasicMaterial {
    constructor({DiffuseMap:DiffuseMap}={}) {
        this.type = 'BasicMaterial';
        this.color = new Vector4( 1, 1, 1, 1 );
        this._DiffuseMap = DiffuseMap;
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

export { BasicMaterial }