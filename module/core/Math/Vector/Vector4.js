class Vector4 {
    constructor( x = 0, y = 0, z = 0, w = 0 ) {
		this.isVector4 = true;
        this.isUpdata = true;
        this._x = x;
        this._y = y;
        this._z = z;
        this._w = w;
        
        this.message = {
            type: 'Vector4',
            needUpdata: true,
        }
    }

    set x( value ) {
        if ( value === this._x ) return;
        this._x = value;
        this.message.needUpdata = true;
    } 

    get x() {
        return this._x;
    }

    set y( value ) {
        if ( value === this._y ) return;
        this._y = value;
        this.message.needUpdata = true;
    } 

    get y() {
        return this._y;
    }

    set z( value ) {
        if ( value === this._z ) return;
        this._z = value;
        this.message.needUpdata = true;
    } 

    get z() {
        return this._z;
    }

    set w( value ) {
        if ( value === this._w ) return;
        this._w = value;
        this.message.needUpdata = true;
    } 

    get w() {
        return this._w;
    }

    set( x, y, z, w ) { 
        if ( y === this._y && x === this._x && z === this._z && w === this._w ) return;
        this._x = x;
        this._y = y;
        this._z = z;
        this._w = w;
        this.message.needUpdata = true;
        return this;
    }

    add( v ) {
        this.warn( v );
		this._x += v.x;
		this._y += v.y;
		this._z += v.z;
        this._w += v.w;
        this.message.needUpdata = true;
		return this;
	}

    subtract( v ) {
        this.warn( v );
		this._x -= v.x;
		this._y -= v.y;
		this._z -= v.z;
        this._w -= v.w;
        this.message.needUpdata = true;
		return this;
    }

    copy(v) { // 
        this.warn( v );
        if ( v.y === this._y && v.x === this._x && v.z === this._z ) return this;
        this._x = v.x;
        this._y = v.y;
        this._z = v.z;
        this._w = v.w;
        this.message.needUpdata = true;
        return this;
    }
    
	divideScalar( scalar ) { // 除与
        if ( 1 === scalar ) return this;
        this.isUpdata = true;
		return this.multiplyScalar( 1 / scalar );
	}

	max( v ) { 
        this.warn( v );
        if ( v.y === this._y && v.x === this._x && v.z === this._z ) return this;
		this._x = Math.max( this._x, v.x );
		this._y = Math.max( this._y, v.y );
		this._z = Math.max( this._z, v.z );
		this._w = Math.max( this._w, v.w );
        this.message.needUpdata = true;
		return this;
	}

	min( v ) {
        this.warn( v );
        if ( v.y === this._y && v.x === this._x && v.z === this._z ) return this;
		this._x = Math.min( this._x, v.x );
		this._y = Math.min( this._y, v.y );
		this._z = Math.min( this._z, v.z );
		this._w = Math.min( this._w, v.w );
        this.message.needUpdata = true;
		return this;
	}

	multiplyScalar( scalar ) {
        if ( 1 === scalar ) return this;
		this._x *= scalar;
		this._y *= scalar;
		this._z *= scalar;
		this._w *= scalar;
        this.message.needUpdata = true;
		return this;
	}

    ModelLength() {
        return Math.sqrt( this._x *this._x + this._y * this._y + this._z * this._z + this._w * this._w );
    }

	normalize() {
		return this.divideScalar( this.ModelLength() );
	}

    warn( v ){
        if ( !v.isVector4 ) {
            console.warn( 'Vector4().warn(): \nThis ' + v + ' is not a Vector4' );
        }
    }

    toArray( length = 4 ) {
        return [ this._x, this._y, this._z, this._w ].slice( 0, length );
    }
};

export { Vector4 }