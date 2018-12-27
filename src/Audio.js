var Sburb = (function (Sburb) {
///////////////////////////////////////
//Sound Class
///////////////////////////////////////

    var globalVolume = 1;

//Constructor
    Sburb.Sound = function (asset) {
        this.asset = asset;
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
        this.asset.volume = globalVolume;
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
    var bgm = null; //the current background music

    Sburb.changeBGM = function (asset) {
        if (bgm) {
            if (bgm.asset === asset) {
                return;
            }
            bgm.stop();
        }
        bgm = new Sburb.Sound(asset);
        bgm.stop();
        bgm.play();
    };

    Sburb.getVolume = function() {
        return globalVolume;
    };

    Sburb.setVolume = function(volume) {
        globalVolume = volume;
        if (bgm) {
            bgm.asset.volume = volume;
        }
    };

    Sburb.haltBGM = function() {
        if (bgm) {
            bgm.stop();
            bgm = null;
        }
    };

    var lastMusicTime = -1;
    var musicStoppedFor = 0;

    Sburb.handleBGM = function() {
        if (bgm) {
            if (bgm.asset.ended || bgm.asset.currentTime >= bgm.asset.duration) {
                bgm.play(0);
            }
            if (lastMusicTime === bgm.asset.currentTime) {
                musicStoppedFor++;
                if (musicStoppedFor > 4) {
                    bgm.asset.pause();
                    bgm.asset.play(); // asset.play() because sometimes this condition is true on startup
                }
            } else {
                musicStoppedFor = 0;
            }
            if (bgm.asset.paused) {
                bgm.play();
            }
            lastMusicTime = bgm.asset.currentTime;
        }
    };

    return Sburb;
})(Sburb || {});
