class Touchs {
    constructor( DOMElement ) {
        this.DOMElement = DOMElement;
        this.startX = null;
        this.startY = null;
        this.momentX = null;
        this.momentY = null;
        this.deltaY = 0;
        this.deltaX = 0;
        this.decayFactor = 0.99;
        this.maxSpeed = 20;
        this.tsx = 1.0;
        this.tsy = 0.0;

        this.DOMElement.addEventListener('touchstart', this.onMouseDown.bind(this));
        this.DOMElement.addEventListener('touchmove', this.onMouseMove.bind(this));
        this.DOMElement.addEventListener('touchend', this.onMouseUp.bind(this));
    }
    onMouseDown(e) {
        e.preventDefault();
        this.startX = e.touches[0].clientX;
        this.startY = e.touches[0].clientY;
    }

    onMouseMove(e) {
        e.preventDefault();
        this.momentX = e.touches[0].clientX;
        this.momentY = e.touches[0].clientY;
    }

    onMouseUp(e) {
        e.preventDefault();
        this.startX = null;
        this.startY = null;
    }
// 
    getData() {
        if ( this.startX == null && this.startY == null ) { // 这里以后可以优化性能
            if ( this.deltaX != 0 ) {
                this.deltaX = this.deltaX * this.decayFactor;
            }
            if ( this.deltaY != 0 ) {
                this.deltaY = this.deltaY * this.decayFactor * this.tsy;
            }
        }
        if ( this.startX != null && this.startY != null ) {
            this.deltaX = Math.min(this.maxSpeed, Math.max(-this.maxSpeed, this.momentX - this.startX));
            this.deltaY = Math.min(this.maxSpeed, Math.max(-this.maxSpeed, this.momentY - this.startY));
            this.startX = this.momentX;
            this.startY = this.momentY;
        }
    }
} 
export { Touchs }