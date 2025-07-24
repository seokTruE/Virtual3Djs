class Vector3 {
    constructor( x = 0, y = 0, z = 0 ) {
		this.isVector3 = true;
        this._x = x;
        this._y = y;
        this._z = z;
        this.message = {
            type: 'Vector3',
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

    set( x, y, z ) { 
        if ( y === this._y && x === this._x && z === this._z ) return;
        this._x = x;
        this._y = y;
        this._z = z;
        this.message.needUpdata = true;
        return this;
    }

    add( v ) {
        this.warn( v );
		this._x += v.x;
		this._y += v.y;
		this._z += v.z;
        this.message.needUpdata = true;
		return this;
	}

    sub( v ) {
        this.warn( v );

		this.x -= v.x;
		this.y -= v.y;
		this.z -= v.z;

		return this;

	}

	subScalar( s ) {

		this.x -= s;
		this.y -= s;
		this.z -= s;

        this.message.needUpdata = true;
		return this;

	}

	subVectors( a, b ) {
        this.warn( a );
        this.warn( b );

		this.x = a.x - b.x;
		this.y = a.y - b.y;
		this.z = a.z - b.z;

        this.message.needUpdata = true;
		return this;

	}

    copy(v) { // 
        this.warn( v );
        if ( v.y === this._y && v.x === this._x && v.z === this._z ) return this;
        this._x = v.x;
        this._y = v.y;
        this._z = v.z;
        this.message.needUpdata = true;
        return this;
    }

    cross( v ) {

		return this.crossVectors( this, v );

	}

    crossVectors( a, b ) {
        this.warn( a );
        this.warn( b );

		const ax = a.x, ay = a.y, az = a.z;
		const bx = b.x, by = b.y, bz = b.z;

		this.x = ay * bz - az * by;
		this.y = az * bx - ax * bz;
		this.z = ax * by - ay * bx;

        this.message.needUpdata = true;
		return this;

	}
    
	divideScalar( scalar ) { // 除与
        if ( 1 === scalar ) return this;
        this.message.needUpdata = true;
		return this.multiplyScalar( 1 / scalar );
	}

	dot( v ) { // 点积
        this.warn( v );
		return this._x * v.x + this._y * v.y + this._z * v.z;
	}

	max( v ) { 
        this.warn( v );
        if ( v.y === this._y && v.x === this._x && v.z === this._z ) return this;
		this._x = Math.max( this._x, v.x );
		this._y = Math.max( this._y, v.y );
		this._z = Math.max( this._z, v.z );
        this.message.needUpdata = true;
		return this;
	}

	min( v ) {
        this.warn( v );
        if ( v.y === this._y && v.x === this._x && v.z === this._z ) return this;
		this._x = Math.min( this._x, v.x );
		this._y = Math.min( this._y, v.y );
		this._z = Math.min( this._z, v.z );
        this.message.needUpdata = true;
		return this;
	}

	multiplyScalar( scalar ) {
        if ( 1 === scalar ) return this;
		this._x *= scalar;
		this._y *= scalar;
		this._z *= scalar;
        this.message.needUpdata = true;
		return this;
	}

    ModelLength() {
        return Math.sqrt( this._x * this._x + this._y * this._y + this._z * this._z );
    }

	normalize() {
		return this.divideScalar( this.ModelLength() );
	}

    getCos( v ) {
        this.warn( v );
        this.normalize();
        var r = this.dot( v.normalize() );
        return r;
    }

    

    warn( v ){
        if ( !v.isVector3 ) {
            console.warn( 'Vector3().warn(): \nThis ' + v + ' is not a Vector3' );
        }
    }

    toArray( length = 3 ) {
        return [ this._x, this._y, this._z ].slice( 0, length );
    }
};

export { Vector3 }