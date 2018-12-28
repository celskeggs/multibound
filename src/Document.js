var Libs = (function (Libs) {
    Libs.Document = function (div) {
        this.deploy = document.createElement('div');
        this.deploy.style.position = "relative";
        this.deploy.style.padding = "0";
        this.deploy.style.margin = "auto";

        this.gameDiv = document.createElement('div');
        this.gameDiv.style.position = "absolute";
        this.gameDiv.style.zIndex = "100";
        this.deploy.appendChild(this.gameDiv);

        this.fontDiv = document.createElement('div');
        this.deploy.appendChild(this.fontDiv);

        this.gifDiv = document.createElement('div');
        this.gifDiv.style.width = "0";
        this.gifDiv.style.height = "0";
        this.gifDiv.style.overflow = "hidden";
        this.deploy.appendChild(this.gifDiv);

        //the canvas, we're gonna load it up with a bunch of flash-like game data like fps and scale factors
        // TODO: figure out what's actually part of the canvas element and move everything else out of this for clarity
        this.gameCanvas = document.createElement("canvas");
        this.gameCanvas.tabIndex = 0;
        this.gameCanvas.scaleX = this.gameCanvas.scaleY = 3;
        this.gameCanvas.x = this.gameCanvas.y = 0;
        this.gameCanvas.fps = 30;
        this.gameCanvas.fade = 0;
        this.gameCanvas.fadeRate = 0.1;
        this.gameCanvas.innerText = "ERROR: Your browser is too old to display this content!";
        this.gameDiv.appendChild(this.gameCanvas);

        this.mapCanvas = document.createElement("canvas");
        this.mapCanvas.width = 1;
        this.mapCanvas.height = 1;
        this.mapCanvas.style.display = "none";
        this.gameDiv.appendChild(this.mapCanvas);

        div.appendChild(this.deploy);
    };

    Libs.Document.prototype.registerMouseEvents = function(mouseDown, mouseUp, mouseMove) {
        this.gameCanvas.onmousedown = function (e) {
            mouseDown(e, this);
        };
        this.gameCanvas.onmouseup = function (e) {
            mouseUp(e, this);
        };
        this.gameCanvas.onmousemove = function (e) {
            mouseMove(e, this);
        };
    };

    Libs.Document.prototype.registerKeyEvents = function(onkeydown, onkeyup) {
        this.gameDiv.onkeydown = function (e) {
            onkeydown(e);
        };
        this.gameDiv.onkeyup = function (e) {
            onkeyup(e);
        };
    };

    Libs.Document.prototype.registerBlurEvent = function(onblur) {
        this.gameCanvas.onblur = onblur;
    };

    Libs.Document.prototype.setDimensions = function(width, height) {
        if (width) {
            this.deploy.style.width = width + "px";
            this.gameCanvas.width = width;
        }
        if (height) {
            this.deploy.style.height = height + "px";
            this.gameCanvas.height = height;
        }
    };

    Libs.Document.prototype.setCursor = function(cursor) {
        this.gameCanvas.style.cursor = cursor;
    };

    Libs.Document.prototype.setOffset = function(isOffset) {
        this.gameCanvas.offset = isOffset;
    };

    Libs.Document.prototype.prepareNewMap = function(width, height) {
        this.mapCanvas.width = width;
        this.mapCanvas.height = height;
        return this.mapCanvas.getContext("2d");
    };

    Libs.Document.prototype.getFade = function() {
        return this.gameCanvas.fade;
    };

    Libs.Document.prototype.setFade = function(fade) {
        this.gameCanvas.fade = fade;
    };

    Libs.Document.prototype.getFadeRate = function() {
        return this.gameCanvas.fadeRate;
    };

    Libs.Document.prototype.getStagePos = function() {
        return {"x": this.gameCanvas.x, "y": this.gameCanvas.y,
                "width": this.gameCanvas.width, "height": this.gameCanvas.height};
    };

    Libs.Document.prototype.setStagePos = function(x, y) {
        this.gameCanvas.x = x;
        this.gameCanvas.y = y;
    };

    Libs.Document.prototype.getOffsetPos = function() {
        if (this.gameCanvas.offset) {
            return this.getStagePos();
        } else {
            return {"x": 0, "y": 0, "width": this.gameCanvas.width, "height": this.gameCanvas.height};
        }
    };

    Libs.Document.prototype.getScale = function() {
        var scale = this.gameCanvas.scaleX;
        if (scale !== this.gameCanvas.scaleY) {
            throw new Error("expected canvas scales to match");
        }
        return scale;
    };

    Libs.Document.prototype.setScale = function(scale) {
        this.gameCanvas.scaleX = this.gameCanvas.scaleY = scale;
    };

    Libs.Document.prototype.getFPS = function() {
        return this.gameCanvas.fps;
    };

    Libs.Document.prototype.getStageContext = function() {
        return this.gameCanvas.getContext("2d");
    };

    Libs.Document.prototype.addFont = function(name, sources, extra) {
        this.fontDiv.innerHTML += '<style type="text/css">@font-face{ font-family: ' + name + '; src: ' + sources.join(',') + '; ' + extra + '}</style>';
    };

    Libs.Document.prototype.clearFonts = function() {
        this.fontDiv.innerHTML = "";
    };

    Libs.Document.prototype.addGif = function(child) {
        this.gifDiv.appendChild(child);
    };

    Libs.Document.prototype.clearGifs = function() {
        this.gifDiv.innerHTML = "";
    };

    return Libs;
})(Libs || {});
