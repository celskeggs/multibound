var Sburb = (function (Sburb) {

/////////////////////////////////////////
//Trigger Class
/////////////////////////////////////////

//constructor
    Sburb.Trigger = function (info) {
        if (typeof info == "string") {
            info = [info];
        }

        this.info = info;
        this.waitFor = null;

        this.events = [];
        for (var i = 0; i < info.length; i++) {
            var inf = this.info[i].trim();
            var params = inf.split(",");
            var type = params[0];
            this.events[i] = new Sburb.events[type](inf);
        }
        this.reset();
    };

//parse the trigger info into an actual event to watch
    Sburb.Trigger.prototype.reset = function () {
        for (var i = 0; i < this.events.length; i++) {
            this.events[i].reset();
        }
    };

    Sburb.Trigger.prototype.checkCompletion = function () {
        var result = true;
        for (var i = 0; i < this.events.length; i++) {
            result = result && this.events[i].checkCompletion();
        }
        return result;
    };

//check if the trigger has been satisfied
    Sburb.Trigger.prototype.tryToTrigger = function () {
        if (this.waitFor) {
            if (this.waitFor.checkCompletion()) {
                this.waitFor = null;
            } else {
                return;
            }
        }
        if (this.checkCompletion()) {
            return false;
        }
    };

    return Sburb;
})(Sburb || {});
