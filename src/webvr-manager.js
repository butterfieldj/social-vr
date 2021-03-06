/**
 * Helper for getting in and out of VR mode.
 */
function WebVRManager(renderer, effect, params) {
    this.params = params || {};

    this.mode = Modes.UNKNOWN;

    // Set option to hide the button.
    this.hideButton = this.params.hideButton || false;
    // Whether or not the FOV should be distorted or un-distorted. By default, it
    // should be distorted, but in the case of vertex shader based distortion,
    // ensure that we use undistorted parameters.
    this.predistorted = !!this.params.predistorted;

    // Save the THREE.js renderer and effect for later.
    this.renderer = renderer;
    this.effect = effect;
    var polyfillWrapper = document.querySelector('.webvr-polyfill-fullscreen-wrapper');
    this.button = new ButtonManager(polyfillWrapper);

    // Only enable VR mode if we're on a mobile device.
    this.isVRCompatible = Util.isMobile();

    this.isFullscreenDisabled = !!Util.getQueryParameter('no_fullscreen');

    // Check if the browser is compatible with WebVR.
    this.getDeviceByType_(VRDisplay).then(function(hmd) {
        this.hmd = hmd;
        this.setMode_(Modes.NORMAL);
        this.emit('initialized');
    }.bind(this));

    // Hook up button listeners.
    this.button.on('vr', this.onVRClick_.bind(this));
    this.button.on('fs', this.onFSClick_.bind(this));

    // Bind to fullscreen events.
    document.addEventListener('webkitfullscreenchange', this.onFullscreenChange_.bind(this));
    document.addEventListener('mozfullscreenchange', this.onFullscreenChange_.bind(this));
    document.addEventListener('msfullscreenchange', this.onFullscreenChange_.bind(this));

    // Bind to VR* specific events.
    window.addEventListener('vrdisplaypresentchange', this.onVRDisplayPresentChange_.bind(this));
    window.addEventListener('vrdisplaydeviceparamschange', this.onVRDisplayDeviceParamsChange_.bind(this));
}

WebVRManager.prototype = new Emitter();

// Expose these values externally.
WebVRManager.Modes = Modes;

/**
 * Promise returns true if there is at least one HMD device available.
 */
WebVRManager.prototype.getDeviceByType_ = function(type) {
    return new Promise(
        function(resolve, reject) {
            navigator.getVRDisplays().then(function(devices) {
            // Promise succeeds, but check if there are any devices actually.
            for (var i = 0; i < devices.length; i++) {
                if (devices[i] instanceof type) {
                    resolve(devices[i]);
                    break;
                }
            }

            resolve(null);
        },
        function() {
            // No devices are found.
            resolve(null);
        });
    });
};

WebVRManager.prototype.render = function(scene, camera, timestamp) {
    if(this.mode === WebVRManager.Modes.NORMAL){
        this.renderer.render(scene, camera);
    } else if (this.mode === WebVRManager.Modes.VR) {
        this.effect.render(scene, camera);
    }
};

/**
 * Helper for entering VR mode.
 */
WebVRManager.prototype.enterVRMode_ = function() {
    this.hmd.requestPresent({
        source: this.renderer.domElement,
        predistorted: this.predistorted
    });
};

WebVRManager.prototype.setMode_ = function(mode) {
    var oldMode = this.mode;
    if (mode == this.mode) {
        console.warn('Not changing modes, already in %s', mode);
        return;
    }
    console.log('Mode change: %s => %s', this.mode, mode);
    this.mode = mode;
    this.button.setMode(mode, this.isVRCompatible);

    // Emit an event indicating the mode changed.
    this.emit('modechange', mode, oldMode);
};

/**
 * Main button was clicked.
 */
WebVRManager.prototype.onVRClick_ = function() {
    console.log("ON VR CLICK");
    switch (this.mode) {
        case Modes.NORMAL:
            console.log("NORMAL VR");
            if (Util.isIOS() && Util.isIFrame()) {
                var url = window.location.href;
                url = Util.appendQueryParameter(url, 'no_fullscreen', 'true');
                url = Util.appendQueryParameter(url, 'start_mode', Modes.MAGIC_WINDOW);
                top.location.href = url;
                return;
            }
            this.setMode_(Modes.VR);
            this.requestFullscreen_();
            break;
        case Modes.VR:
            console.log("MAGIC WINDOW");
            if (this.isFullscreenDisabled) {
                window.history.back();
                return;
            }
            this.setMode_(Modes.NORMAL);
            this.exitFullscreen_();
            break;
    }
};

/**
 * The VR button was clicked.
 */
WebVRManager.prototype.onFSClick_ = function() {
    // TODO: Remove this hack when iOS has fullscreen mode.
    // If this is an iframe on iOS, break out and open in no_fullscreen mode.
    console.log("ON FS CLICK");

    if (this.mode == Modes.NORMAL && Util.isIOS() && Util.isIFrame()) {
        var url = window.location.href;
        url = Util.appendQueryParameter(url, 'no_fullscreen', 'true');
        url = Util.appendQueryParameter(url, 'start_mode', Modes.VR);
        top.location.href = url;
        return;
    }

    this.enterVRMode_();
};

WebVRManager.prototype.requestFullscreen_ = function() {
    var canvas = document.body;
    //var canvas = this.renderer.domElement;
    if (canvas.requestFullscreen) {
        canvas.requestFullscreen();
    } else if (canvas.mozRequestFullScreen) {
        canvas.mozRequestFullScreen();
    } else if (canvas.webkitRequestFullscreen) {
        canvas.webkitRequestFullscreen();
    } else if (canvas.msRequestFullscreen) {
        canvas.msRequestFullscreen();
    }
};

WebVRManager.prototype.exitFullscreen_ = function() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    }
};

WebVRManager.prototype.onVRDisplayPresentChange_ = function(e) {
    console.log('onVRDisplayPresentChange_', e);
    if (this.hmd.isPresenting) {
        this.setMode_(Modes.VR);
    } else {
        this.setMode_(Modes.NORMAL);
    }
};

WebVRManager.prototype.onVRDisplayDeviceParamsChange_ = function(e) {
    console.log('onVRDisplayDeviceParamsChange_', e);
};

WebVRManager.prototype.onFullscreenChange_ = function(e) {
    // If we leave full-screen, go back to normal mode.
    if (document.webkitFullscreenElement === null || document.mozFullScreenElement === null) {
        console.log("GOING BACK TO NORMAL");
        this.setMode_(Modes.NORMAL);
    }
};
