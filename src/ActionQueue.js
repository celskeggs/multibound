var Sburb = (function (Sburb) {


///////////////////////////////////////
//ActionQueue Class
///////////////////////////////////////

//constructor
    Sburb.ActionQueue = function (action, id, groups, noWait, paused, trigger) {
        this.curAction = action;
        this.id = (id && (id.length > 0)) ? id : Sburb.nextQueueId++;
        this.groups = groups ? groups : [];
        this.noWait = noWait ? noWait : false;
        this.paused = paused ? true : false;
        this.trigger = trigger;
    };

    Sburb.ActionQueue.prototype.hasGroup = function (group) {
        for (var i = 0; i < this.groups.length; i++) {
            if (this.groups[i] == group) {
                return true;
            }
        }
        return false;
    };

//////////////////////////////////////////////////
//Related utility functions
//////////////////////////////////////////////////

    Sburb.getActionQueueById = function (id) {
        for (var i = 0; i < this.actionQueues.length; i++) {
            var queue = this.actionQueues[i];
            if (queue.id == id) {
                return queue;
            }
        }
    };

    Sburb.removeActionQueueById = function (id) {
        for (var i = 0; i < this.actionQueues.length; i++) {
            var queue = this.actionQueues[i];
            if (queue.id == id) {
                this.actionQueues.remove(i);
                return;
            }
        }
    };

    Sburb.forEachActionQueueInGroup = function (group, callback) {
        for (var i = 0; i < this.actionQueues.length; i++) {
            var queue = this.actionQueues[i];
            if (queue.hasGroup(group)) {
                callback(queue);
            }
        }
    };

    Sburb.removeActionQueuesByGroup = function (group) {
        for (var i = 0; i < this.actionQueues.length; i++) {
            var queue = this.actionQueues[i];
            if (queue.hasGroup(group)) {
                this.actionQueues.remove(i);
                i--;
            }
        }
    };

    return Sburb;
})(Sburb || {});
