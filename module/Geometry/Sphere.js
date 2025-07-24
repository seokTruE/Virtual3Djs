import { Entity3D } from "../core/Entity3D/Entity3D.js";
import { Vector3  } from "../core/Math/Vector/Vector3.js";
class Sphere extends Entity3D {
    constructor({
        position = { x: 0, y: 0, z: 0 },
        Euler = { x: 0, y: 0, z: 0 },
        scale = { x: 1, y: 1, z: 1 },
        quaternion = { x: 0, y: 1, z: 0, w: 1 },
    }={}) {
        super({ position, Euler, scale, quaternion });
        this.setShape();
        this.message = {
            name : '',
            needUpdataAttribute: true,
            renderIndex : -1,
            sceneLevel: 0,
            type: 'Sphere',
        }
        
        this.renderSetting = {
            needRender: true,
            DEPTH_TEST : true,
            CULL_FACE : 'BACK', // FRONT / FALSE
            pixelType : 'TRIANGLES',
            drawType : 'drawElements'
        }
    }

    setShape( radius = 1/2, widthSegments = 16, heightSegments = 8 ) {
        if ( radius == this.radius && widthSegments == this.widthSegments && heightSegments == this.heightSegments ) return;
        this.radius = radius;
        this.widthSegments = Math.max( 3, Math.floor( widthSegments ) );
        this.heightSegments = Math.max( 2, Math.floor( heightSegments ) );
        this.message.needUpdataAttribute = true;
    }

    updataAttribute() {
        this.attribute = {
            vertices: [],
            normals: [],
            uvs: [],
            indices: [],
            offset : 0
        }

		const vertex = new Vector3();
		const normal = new Vector3();

        let index = 0;
		const grid = [];

        for ( let iy = 0; iy <= this.heightSegments; iy ++ ) {

			const verticesRow = [];

			const v = iy / this.heightSegments;

			// special case for the poles

			let uOffset = 0;

			if ( iy === 0 ) {

				uOffset = 0.5 / this.widthSegments;

			} else if ( iy === this.heightSegments ) {

				uOffset = - 0.5 / this.widthSegments;

			}

			for ( let ix = 0; ix <= this.widthSegments; ix ++ ) {

				const u = ix / this.widthSegments;

				// vertex

				vertex.x = - this.radius * Math.cos( 0 + u * Math.PI * 2 ) * Math.sin( 0 + v * Math.PI );
				vertex.y = this.radius * Math.cos( 0 + v * Math.PI );
				vertex.z = this.radius * Math.sin( 0 + u * Math.PI * 2 ) * Math.sin( 0 + v * Math.PI );

				this.attribute.vertices.push( vertex.x, vertex.y, vertex.z );

				// normal
				normal.copy( vertex ).divideScalar( this.radius );
				this.attribute.normals.push( normal.x, normal.y, normal.z );

				// uv
				this.attribute.uvs.push( u + uOffset, 1 - v );

				verticesRow.push( index ++ );

			}

			grid.push( verticesRow );

		}
        // indices

        for ( let iy = 0; iy < this.heightSegments; iy ++ ) {

            for ( let ix = 0; ix < this.widthSegments; ix ++ ) {

                const a = grid[ iy ][ ix + 1 ];
                const b = grid[ iy ][ ix ];
                const c = grid[ iy + 1 ][ ix ];
                const d = grid[ iy + 1 ][ ix + 1 ];

                if ( iy !== 0 || 0 > 0 ) this.attribute.indices.push( a, b, d );
                if ( iy !== this.heightSegments - 1 ) this.attribute.indices.push( b, c, d );

            }

        }
        
        this.message.needUpdataAttribute = false;
    }
    copy(v) {
        this.shape = v.shape;
        this.position = v.position;
        this.rotation = v.rotation;
        this.scale = v.scale;
        return this;
    }
};

export { Sphere  }