var THREE = require('three');

function Control(camera, domElment, target){

    this.camera = camera;
    this.domElment = domElment === undefined? document : domElment;

    //控制器开关
    this.enable = true;

    this.rotationSpeed = 1.0;
    this.enableRoattion = true;

    var spherical = new THREE.Spherical();
	var sphericalDelta = new THREE.Spherical();

    this.autoRotationSpeed = 2.0;
    this.autoRotation = false;

    this.target = new THREE.Vector3().copy(target);

    // for reset
    this.target0 = this.target.clone();
    this.position0 = this.camera.position.clone();
    this.zoom0 = this.camera.zoom;

    this.minAzimuthAngle = - Infinity; // radians
    this.maxAzimuthAngle = Infinity; // radians
    
    var STATE = { NONE: - 1, ROTATE: 0, DOLLY: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_DOLLY: 4, TOUCH_PAN: 5 };
    
    var state = STATE.NONE;

    var rotateStart = new THREE.Vector2;
    var rotateEnd = new THREE.Vector2;

    function getAutoRotationAngle() {
        
        return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;
    }

    this.reset = function(){

        scope.camera.position.copy(scope.position0);
        scope.camera.zoom = scope.zoom0;
        scope.dispatchEvent( changeEvent );
        
        scope.update();

        scope.camera.updateProjectionMatrix();
    };

    this.update = function(){

        var offset = new THREE.Vector3;
        var quat = new THREE.Quaternion().setFromUnitVectors(camera.up, new THREE.Vector3(0, 1, 0));
        var quatInverse = quat.clone().inverse();

        var lastPosition = new THREE.Vector3();
        var lastQuaternion = new THREE.Quaternion();
        
        var EPS = 0.000001;

        return function(){
            
            var position = scope.camera.position;

            offset.copy(position).sub(scope.target);
            offset.applyQuaternion(quat);

            spherical.setFromVector3(offset);

            if (scope.autoRotate && state === STATE.NONE) {
                
                rotateLeft( getAutoRotationAngle() );
            }

            spherical.theta += sphericalDelta.theta;

            spherical.theta = Math.max( scope.minAzimuthAngle, Math.min( scope.maxAzimuthAngle, spherical.theta ) );

            offset.setFromSpherical( spherical );
            
                        // rotate offset back to "camera-up-vector-is-up" space
            offset.applyQuaternion( quatInverse );

            position.copy( scope.target ).add( offset );

            scope.camera.lookAt( scope.target );
            sphericalDelta.set(0, 0, 0);
            
            if (lastPosition.distanceTo(scope.camera.position) > EPS || 
            8 * ( 1 - lastQuaternion.dot( scope.camera.quaternion ) ) > EPS){

                scope.dispatchEvent(changeEvent);
                lastPosition.copy(scope.camera.position);
                lastQuaternion.copy(scope.camera.quaternion);  
            }
        }
    }();

    var rotateLeft = function(delta){

        sphericalDelta.theta -= delta;
    }

    var handleMouseMove = function(){

        var offset = 0;

        function handleRotateMove(ev){

            var container = scope.domElment === document? document.body : scope.domElment;
            
            rotateEnd.set(ev.clientX, ev.clientY);

            var offset = rotateEnd.x - rotateStart.x;

            rotateLeft(2 * Math.PI * offset / container.clientWidth * scope.rotationSpeed);

            rotateStart.copy(rotateEnd);

            scope.update();
        }

        return function(ev){

            if (state === STATE.ROTATE)
                handleRotateMove(ev);
        }
    }();

    var handleMouseDown = function(ev){

        if (ev.button === 0){

            state = STATE.ROTATE;
            handleMouseDownRotation(ev);
        }
    };

    var handleMouseDownRotation = function(ev){

        rotateStart.set(ev.clientX, ev.clientY);
    }

    var handleMouseUp = function(ev){

        state = STATE.NONE;
    }

    this.domElment.addEventListener('mousemove', handleMouseMove, false);
    this.domElment.addEventListener('mousedown', handleMouseDown, false);
    this.domElment.addEventListener('mouseup', handleMouseUp, false);

    var scope = this;
    var changeEvent = {type: 'change'};
}

Object.assign(Control.prototype, THREE.EventDispatcher.prototype, {

});

export {Control};