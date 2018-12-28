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

    Libs.Input.prototype.indexOf = function(key) {
        return this.pressedOrder.indexOf(key);
    };

    Libs.Input.prototype.maxIndexOf = function(a, b) {
        return Math.max(this.indexOf(a), this.indexOf(b));
    };

    function moreRecently(query, other) {
        return query >= 0 && query >= other;
    }

    Libs.Input.prototype.getMoveDirection = function() {
        if (this.disabled) {
            return {"x": 0, "y": 0};
        }
        // TODO: don't reference Sburb here
        var down = this.maxIndexOf(Sburb.Keys.down, Sburb.Keys.s);
        var up = this.maxIndexOf(Sburb.Keys.up, Sburb.Keys.w);
        var left = this.maxIndexOf(Sburb.Keys.left, Sburb.Keys.a);
        var right = this.maxIndexOf(Sburb.Keys.right, Sburb.Keys.d);
        // we can do this because they'll only ever be equal if both are missing
        return {
            "x": left > right ? -1 : right > left ? 1 : 0,
            "y":   up > down  ? -1 :  down > up   ? 1 : 0,
        };
    };

    return Libs;
})(Libs || {});
