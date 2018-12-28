var Libs = (function (Libs) {
    Libs.Input = function(onPress) {
        this.disabled = false;
        this.pressed = {};
        this.pressedOrder = [];
        this.onPress = onPress;
    };

    Libs.Input.prototype.onKeyDown = function(e) {
        var key = e.keyCode;
        if (!this.disabled && !this.pressed[key]) {
            this.onPress(key);
        }
        if (!this.pressed[key])
            this.pressedOrder.push(key);
        this.pressed[key] = true;
        // return true if we want to pass keys along to the browser, i.e. Ctrl-N for a new window
        if (e.altKey || e.ctrlKey || e.metaKey) {
            // don't muck with system stuff
            return true;
        }
        return false;
    };

    Libs.Input.prototype.onKeyUp = function(e) {
        if (this.pressed[e.keyCode]) {
            this.pressedOrder.destroy(e.keyCode);
        }
        this.pressed[e.keyCode] = false;
    };

    Libs.Input.prototype.register = function(doc) {
        var that = this;
        doc.registerKeyEvents(function(e) {
            that.onKeyDown(e);
        }, function(e) {
            that.onKeyUp(e);
        });
        doc.registerBlurEvent(function(e) {
            that.purge();
        });
    };

    Libs.Input.prototype.update = function() {
        if (this.disabled && this.disabled !== true) {
            if (this.disabled()) {
                this.disabled = false;
            }
        }
    };

    Libs.Input.prototype.setDisabled = function(disabled) {
        this.disabled = disabled;
    };

    Libs.Input.prototype.disableUntil = function(until) {
        this.disabled = until;
    };

    Libs.Input.prototype.purge = function() {
        this.pressed = {};
        this.pressedOrder = [];
    };

    Libs.Input.prototype.isPressed = function(key) {
        return this.pressed[key];
    };

    return Libs;
})(Libs || {});
