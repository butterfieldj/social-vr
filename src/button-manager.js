/**
 * Everything having to do with the WebVR button.
 * Emits a 'click' event when it's clicked.
 */
function ButtonManager(opt_root) {
    var root = opt_root || document.body;
    this.loadIcons_();

    // Make the fullscreen button.
    var vrButton = this.createButton();
    vrButton.src = this.ICONS.cardboard;
    vrButton.title = 'VR Mode';
    vrButton.style.bottom = 0;
    vrButton.style.right = 0;
    vrButton.addEventListener('click', this.createClickHandler_('vr'));
    root.appendChild(vrButton);
    this.vrButton = vrButton;

    // Make the VR button.
    var normalButton = this.createButton();
    normalButton.src = this.ICONS.fullscreen;
    normalButton.title = 'Normal mode';
    normalButton.style.bottom = 0;
    normalButton.style.right = '48px';
    normalButton.addEventListener('click', this.createClickHandler_('fs'));
    root.appendChild(normalButton);
    this.normalButton = normalButton;

    this.isVisible = true;
}
ButtonManager.prototype = new Emitter();

ButtonManager.prototype.createButton = function() {
    var button = document.createElement('img');
    button.className = 'webvr-button';
    var s = button.style;
    s.position = 'fixed';
    s.width = '24px'
    s.height = '24px';
    s.backgroundSize = 'cover';
    s.backgroundColor = 'transparent';
    s.border = 0;
    s.userSelect = 'none';
    s.webkitUserSelect = 'none';
    s.MozUserSelect = 'none';
    s.cursor = 'pointer';
    s.padding = '12px';
    s.zIndex = 1;
    s.display = 'none';
    s.boxSizing = 'content-box';

    // Prevent button from being selected and dragged.
    button.draggable = false;
    button.addEventListener('dragstart', function(e) {
        e.preventDefault();
    });

    // Style it on hover.
    button.addEventListener('mouseenter', function(e) {
        s.filter = s.webkitFilter = 'drop-shadow(0 0 5px rgba(255,255,255,1))';
    });
    button.addEventListener('mouseleave', function(e) {
        s.filter = s.webkitFilter = '';
    });

    return button;
};

ButtonManager.prototype.setMode = function(mode, isVRCompatible) {
    isVRCompatible = isVRCompatible || WebVRConfig.FORCE_ENABLE_VR;
    if (!this.isVisible) {
        return;
    }

    switch (mode) {
        case Modes.NORMAL:
            this.vrButton.style.display = 'block';
            this.vrButton.src = this.ICONS.cardboard;
            break;
        case Modes.MAGIC_WINDOW:
            this.vrButton.style.display = 'block';
            this.vrButton.src = this.ICONS.exitFullscreen;
            break;
        case Modes.VR:
            this.vrButton.style.display = 'none';
            break;
    }

    var oldValue = this.vrButton.style.display;
    this.vrButton.style.display = 'inline-block';
    this.vrButton.offsetHeight;
    this.vrButton.style.display = oldValue;
};

ButtonManager.prototype.setVisibility = function(isVisible) {
    this.isVisible = isVisible;
    this.vrButton.style.display = isVisible ? 'block' : 'none';
    //this.vrButton.style.display = isVisible ? 'block' : 'none';
};

ButtonManager.prototype.createClickHandler_ = function(eventName) {
    return function(e) {
        e.stopPropagation();
        e.preventDefault();
        this.emit(eventName);
    }.bind(this);
};

ButtonManager.prototype.loadIcons_ = function() {
    // Preload some hard-coded SVG.
    this.ICONS = {};
    this.ICONS.cardboard = Util.base64('image/svg+xml', 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNHB4IiBoZWlnaHQ9IjI0cHgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI0ZGRkZGRiI+CiAgICA8cGF0aCBkPSJNMjAuNzQgNkgzLjIxQzIuNTUgNiAyIDYuNTcgMiA3LjI4djEwLjQ0YzAgLjcuNTUgMS4yOCAxLjIzIDEuMjhoNC43OWMuNTIgMCAuOTYtLjMzIDEuMTQtLjc5bDEuNC0zLjQ4Yy4yMy0uNTkuNzktMS4wMSAxLjQ0LTEuMDFzMS4yMS40MiAxLjQ1IDEuMDFsMS4zOSAzLjQ4Yy4xOS40Ni42My43OSAxLjExLjc5aDQuNzljLjcxIDAgMS4yNi0uNTcgMS4yNi0xLjI4VjcuMjhjMC0uNy0uNTUtMS4yOC0xLjI2LTEuMjh6TTcuNSAxNC42MmMtMS4xNyAwLTIuMTMtLjk1LTIuMTMtMi4xMiAwLTEuMTcuOTYtMi4xMyAyLjEzLTIuMTMgMS4xOCAwIDIuMTIuOTYgMi4xMiAyLjEzcy0uOTUgMi4xMi0yLjEyIDIuMTJ6bTkgMGMtMS4xNyAwLTIuMTMtLjk1LTIuMTMtMi4xMiAwLTEuMTcuOTYtMi4xMyAyLjEzLTIuMTNzMi4xMi45NiAyLjEyIDIuMTMtLjk1IDIuMTItMi4xMiAyLjEyeiIvPgogICAgPHBhdGggZmlsbD0ibm9uZSIgZD0iTTAgMGgyNHYyNEgwVjB6Ii8+Cjwvc3ZnPgo=');
    this.ICONS.fullscreen = Util.base64('image/svg+xml', 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNHB4IiBoZWlnaHQ9IjI0cHgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI0ZGRkZGRiI+CiAgICA8cGF0aCBkPSJNMCAwaDI0djI0SDB6IiBmaWxsPSJub25lIi8+CiAgICA8cGF0aCBkPSJNNyAxNEg1djVoNXYtMkg3di0zem0tMi00aDJWN2gzVjVINXY1em0xMiA3aC0zdjJoNXYtNWgtMnYzek0xNCA1djJoM3YzaDJWNWgtNXoiLz4KPC9zdmc+Cg==');
    this.ICONS.exitFullscreen = Util.base64('image/svg+xml', 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNHB4IiBoZWlnaHQ9IjI0cHgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI0ZGRkZGRiI+CiAgICA8cGF0aCBkPSJNMCAwaDI0djI0SDB6IiBmaWxsPSJub25lIi8+CiAgICA8cGF0aCBkPSJNNSAxNmgzdjNoMnYtNUg1djJ6bTMtOEg1djJoNVY1SDh2M3ptNiAxMWgydi0zaDN2LTJoLTV2NXptMi0xMVY1aC0ydjVoNVY4aC0zeiIvPgo8L3N2Zz4K');
    this.ICONS.settings = Util.base64('image/svg+xml', 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNHB4IiBoZWlnaHQ9IjI0cHgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI0ZGRkZGRiI+CiAgICA8cGF0aCBkPSJNMCAwaDI0djI0SDB6IiBmaWxsPSJub25lIi8+CiAgICA8cGF0aCBkPSJNMTkuNDMgMTIuOThjLjA0LS4zMi4wNy0uNjQuMDctLjk4cy0uMDMtLjY2LS4wNy0uOThsMi4xMS0xLjY1Yy4xOS0uMTUuMjQtLjQyLjEyLS42NGwtMi0zLjQ2Yy0uMTItLjIyLS4zOS0uMy0uNjEtLjIybC0yLjQ5IDFjLS41Mi0uNC0xLjA4LS43My0xLjY5LS45OGwtLjM4LTIuNjVDMTQuNDYgMi4xOCAxNC4yNSAyIDE0IDJoLTRjLS4yNSAwLS40Ni4xOC0uNDkuNDJsLS4zOCAyLjY1Yy0uNjEuMjUtMS4xNy41OS0xLjY5Ljk4bC0yLjQ5LTFjLS4yMy0uMDktLjQ5IDAtLjYxLjIybC0yIDMuNDZjLS4xMy4yMi0uMDcuNDkuMTIuNjRsMi4xMSAxLjY1Yy0uMDQuMzItLjA3LjY1LS4wNy45OHMuMDMuNjYuMDcuOThsLTIuMTEgMS42NWMtLjE5LjE1LS4yNC40Mi0uMTIuNjRsMiAzLjQ2Yy4xMi4yMi4zOS4zLjYxLjIybDIuNDktMWMuNTIuNCAxLjA4LjczIDEuNjkuOThsLjM4IDIuNjVjLjAzLjI0LjI0LjQyLjQ5LjQyaDRjLjI1IDAgLjQ2LS4xOC40OS0uNDJsLjM4LTIuNjVjLjYxLS4yNSAxLjE3LS41OSAxLjY5LS45OGwyLjQ5IDFjLjIzLjA5LjQ5IDAgLjYxLS4yMmwyLTMuNDZjLjEyLS4yMi4wNy0uNDktLjEyLS42NGwtMi4xMS0xLjY1ek0xMiAxNS41Yy0xLjkzIDAtMy41LTEuNTctMy41LTMuNXMxLjU3LTMuNSAzLjUtMy41IDMuNSAxLjU3IDMuNSAzLjUtMS41NyAzLjUtMy41IDMuNXoiLz4KPC9zdmc+Cg==');
};