var Sburb = (function (Sburb) {
///////////////////////////////////////
//Sound Class
///////////////////////////////////////

//Constructor
    Sburb.Sound = function (asset) {
        if (asset) {
            this.asset = asset;
            var that = this;
            window.addEventListener('beforeunload', function () {
                that.pause();
            });
        }
    };

//play this sound
    Sburb.Sound.prototype.play = function (pos) {
        if (window.chrome) {
            if (this.playedOnce) {
                this.asset.load();
            } else {
                this.playedOnce = true;
            }
            if (pos) {
                // chrome doesnt like us changing the play time
                // unless we're already playing
                var oThis = this;
                this.asset.addEventListener('playing', function () {
                    oThis.asset.currentTime = pos;
                    oThis.asset.pause();
                    oThis.asset.removeEventListener('playing', arguments.callee);
                    oThis.asset.play();
                }, false);
            }
        } else if (pos) {
            this.asset.currentTime = pos;
        }
        this.asset.volume = Sburb.globalVolume;
        this.asset.play();
    };

//pause this sound
    Sburb.Sound.prototype.pause = function () {
        this.asset.pause();
    };

//stop this sound
    Sburb.Sound.prototype.stop = function () {
        this.pause();
        this.asset.currentTime = 0;
    };

//has the sound stopped
    Sburb.Sound.prototype.ended = function () {
        return this.asset.ended;
    };

/////////////////////////////////////
//BGM Class (inherits Sound)
/////////////////////////////////////

//constructor
    function BGM(asset, startLoop) {
        Sburb.Sound.call(this, asset);
        this.startLoop = startLoop;

        asset.addEventListener('ended', function () {
            asset.currentTime = startLoop;
            asset.play();
        }, false);
    }

    BGM.prototype = new Sburb.Sound();

    //loop the sound
    BGM.prototype.loop = function () {
        this.play(this.startLoop);
    };

    Sburb.changeBGM = function (asset, startLoop) {
        if (!startLoop) {
            startLoop = 0;
        }
        if (Sburb.bgm) {
            if (Sburb.bgm.asset == asset && Sburb.bgm.startLoop == startLoop) {
                // maybe check for some kind of restart value
                return;
            }
            Sburb.bgm.stop();
        }
        Sburb.bgm = new BGM(asset, startLoop);
        Sburb.bgm.stop();
        Sburb.bgm.play();
    };

    Sburb.globalVolume = 1;

    Sburb.getVolume = function() {
        return Sburb.globalVolume;
    };

    Sburb.setVolume = function(volume) {
        Sburb.globalVolume = volume;
        if (Sburb.bgm) {
            Sburb.bgm.asset.volume = volume;
        }
    };

    return Sburb;
})(Sburb || {});
