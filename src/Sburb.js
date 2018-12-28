var Sburb = (function (Sburb) {
    Sburb.Keys = {
        backspace: 8,
        tab: 9,
        enter: 13,
        shift: 16,
        ctrl: 17,
        alt: 18,
        escape: 27,
        space: 32,
        left: 37,
        up: 38,
        right: 39,
        down: 40,
        w: 87,
        a: 65,
        s: 83,
        d: 68,
        tilde: 192
    };

    Sburb.name = 'Jterniabound';
    Sburb.version = '1.0';
    Sburb.document = null;
    Sburb.input = null;
    Sburb.cam = {x: 0, y: 0};
    Sburb.stage = null; //its context
    Sburb.gameState = {};
    Sburb.assetManager = null; //the asset loader
    Sburb.assets = null; //all images, sounds, paths
    Sburb.sprites = null; //all sprites that were Serial loaded
    Sburb.effects = null; //all effects that were Serial loaded
    Sburb.buttons = null; //all buttons that were Serial loaded
    Sburb.rooms = null; //all rooms
    Sburb.char = null; //the player
    Sburb.curRoom = null;
    Sburb.destRoom = null; //current room, the room we are transitioning to, if it exists.
    Sburb.destX = null;
    Sburb.destY = null; //the desired location in the room we are transitioning to, if it exists.
    Sburb.focus = null; //the focus of the camera (a sprite), usually just the char
    Sburb.destFocus = null;
    Sburb.chooser = null; //the option chooser
    Sburb.curAction = null; //the current action being performed
    Sburb.actionQueues = []; //additional queues for parallel actions
    Sburb.nextQueueId = 0; //the next created actionQueue, specified without a id, will get this number and increment it
    Sburb.hud = null; //the hud; help and sound buttons
    Sburb.Mouse = {down: false, x: 0, y: 0}; //current recorded properties of the mouse
    Sburb.waitFor = null;
    Sburb.fading = false;
    Sburb.loadingRoom = false; // Only load one room at a time
    Sburb.tests = null;

    Sburb.updateLoop = null; //the main updateLoop, used to interrupt updating

    function initializeReal(div, levelName) {
        Sburb.chooser = new Sburb.Chooser();
        Sburb.dialoger = null;
        Sburb.assetManager = new Sburb.AssetManager();
        Sburb.assets = Sburb.assetManager.assets; // shortcut for raw asset access
        Sburb.rooms = {};
        Sburb.sprites = {};
        Sburb.effects = {};
        Sburb.buttons = {};
        Sburb.hud = {};
        Sburb.gameState = {};

        Sburb.document = new Libs.Document(document.getElementById(div));
        Sburb.document.registerMouseEvents(Sburb.onMouseDown, Sburb.onMouseUp, Sburb.onMouseMove);

        Sburb.input = new Libs.Input(_onkeypress);
        Sburb.input.register(Sburb.document);

        // Set default dimensions
        Sburb.setDimensions(650, 450);

        Sburb.stage = Sburb.document.getStageContext();

        Sburb.loadSerialFromXML(levelName);
    }

    Sburb.initialize = function (div, levelName) {
        // only calls the callback if everything works
        Libs.Compat.testCompat(levelName, function(tests) {
            Sburb.tests = tests;
            initializeReal(div, levelName);
        }, function(errors) {
            // Display what failed
            var deploy = '<div style="padding-left: 0; padding-right: 0; margin-left: auto; margin-right: auto; display: block; width:650px; height:450px; overflow: auto;">';
            deploy += '<p style="font-weight: bold;">Your browser is too old. Here are the problems we found:</p>';
            for (var i = 0; i < errors.length; i++)
                deploy += '<p>' + errors[i] + '</p>';
            deploy += '<p>Maybe try Chrome instead?</p>';
            deploy += '</div>';
            document.getElementById(div).innerHTML = deploy;
        });
    };

    Sburb.setDimensions = function (width, height) {
        Sburb.document.setDimensions(width, height);
    };

    function startUpdateProcess() {
        haltUpdateProcess();
        Sburb.assetManager.stop();
        var fps = Sburb.document.getFPS();
        Sburb.updateLoop = setInterval(update, 1000 / fps);
        Sburb.drawLoop = setInterval(draw, 1000 / fps);
    }

    function haltUpdateProcess() {
        if (Sburb.updateLoop) {
            clearInterval(Sburb.updateLoop);
            clearInterval(Sburb.drawLoop);
            Sburb.updateLoop = Sburb.drawLoop = null;
        }
        Sburb.assetManager.start();
    }

    function update() {
        Sburb.handleBGM();
        Sburb.document.setCursor("default");
        Sburb.char.handleInputs(hasControl() ? Sburb.input.getMoveDirection() : {"x": 0, "y": 0});
        handleHud();

        if (!Sburb.loadingRoom)
            Sburb.curRoom.update();

        focusCamera();
        handleRoomChange();
        Sburb.chooser.update();
        Sburb.dialoger.update();
        chainAction();
        updateWait();
    }

    function draw() {
        var stagePos = Sburb.document.getStagePos();
        Sburb.stage.save();
        Sburb.document.setOffset(true);
        Sburb.stage.translate(-stagePos.x, -stagePos.y);

        Sburb.curRoom.draw();

        Sburb.stage.restore();
        Sburb.document.setOffset(false);

        var fade = Sburb.document.getFade();
        if (fade > 0.1) {
            Sburb.stage.fillStyle = "rgba(0,0,0," + fade + ")";
            Sburb.stage.fillRect(0, 0, stagePos.width, stagePos.height);
        }

        Sburb.dialoger.draw();
        drawHud();

        Sburb.stage.save();
        Sburb.document.setOffset(true);
        Sburb.stage.translate(-stagePos.x, -stagePos.y);

        Sburb.chooser.draw();

        Sburb.stage.restore();
        Sburb.document.setOffset(false);
    }

    function _onkeypress(key) {
        if (key === Sburb.Keys.space) {
            Sburb.assetManager.onSpace();
        }
        if (!Sburb.updateLoop) {
            // can't do anything
        } else if (Sburb.chooser.choosing) {
            if (key === Sburb.Keys.down || key === Sburb.Keys.s) {
                Sburb.chooser.nextChoice();
            }
            if (key === Sburb.Keys.up || key === Sburb.Keys.w) {
                Sburb.chooser.prevChoice();
            }
            if (key === Sburb.Keys.space) {
                Sburb.performAction(Sburb.chooser.choices[Sburb.chooser.choice]);
                Sburb.chooser.choosing = false;
            }
        } else if (Sburb.dialoger.talking) {
            if (key === Sburb.Keys.space) {
                Sburb.dialoger.nudge();
            }
        } else if (hasControl()) {
            if (key === Sburb.Keys.space) {
                Sburb.chooser.choices = [];
                var queries = Sburb.char.getActionQueries();
                for (var i = 0; i < queries.length; i++) {
                    Sburb.chooser.choices = Sburb.curRoom.queryActions(Sburb.char, queries[i].x, queries[i].y);
                    if (Sburb.chooser.choices.length > 0) {
                        break;
                    }
                }
                if (Sburb.chooser.choices.length > 0) {
                    Sburb.chooser.choices.push(new Sburb.Action("cancel", "cancel", "Cancel."));
                    beginChoosing();
                }
            }
        }
    }

    Sburb.onMouseMove = function (e, canvas) {
        var point = relMouseCoords(e, canvas);
        Sburb.Mouse.x = point.x;
        Sburb.Mouse.y = point.y;
    };

    Sburb.onMouseDown = function (e, canvas) {
        if (!Sburb.updateLoop) return; // Make sure we are loaded before trying to do things
        // TODO: don't let this work
        if (hasControl()) {
            var stagePos = Sburb.document.getStagePos();
            Sburb.chooser.choices = Sburb.curRoom.queryActionsVisual(Sburb.char, stagePos.x + Sburb.Mouse.x, stagePos.y + Sburb.Mouse.y);
            if (Sburb.chooser.choices.length > 0) {
                Sburb.chooser.choices.push(new Sburb.Action("cancel", "cancel", "cancel"));
                beginChoosing();
            }
        }
        Sburb.Mouse.down = true;

    };

    Sburb.onMouseUp = function (e, canvas) {
        Sburb.Mouse.down = false;
        if (!Sburb.updateLoop) return; // Make sure we are loaded before trying to do things
        if (Sburb.dialoger && Sburb.dialoger.box && Sburb.dialoger.box.isVisuallyUnder(Sburb.Mouse.x, Sburb.Mouse.y)) {
            Sburb.dialoger.nudge();
        }
    };

    function relMouseCoords(event, canvas) {
        var totalOffsetX = 0;
        var totalOffsetY = 0;
        var canvasX = 0;
        var canvasY = 0;
        var currentElement = canvas;

        do {
            totalOffsetX += currentElement.offsetLeft;
            totalOffsetY += currentElement.offsetTop;
        }
        while (currentElement = currentElement.offsetParent);
        canvasX = event.pageX - totalOffsetX;
        canvasY = event.pageY - totalOffsetY;
        return {x: canvasX, y: canvasY};
    }

    function handleHud() {
        for (var content in Sburb.hud) {
            if (!Sburb.hud.hasOwnProperty(content)) continue;
            var obj = Sburb.hud[content];
            obj.update();
        }
    }

    function drawHud() {
        for (var content in Sburb.hud) {
            if (!Sburb.hud.hasOwnProperty(content)) continue;
            Sburb.hud[content].draw();
        }
    }

    function hasControl() {
        return !Sburb.dialoger.talking
            && !Sburb.chooser.choosing
            && !Sburb.destRoom
            && !Sburb.fading
            && !Sburb.destFocus;
    }

    function focusCamera() {
        //need to divide these by scaleX and scaleY if repurposed
        var stagePos = Sburb.document.getStagePos();
        if (!Sburb.destFocus) {
            if (Sburb.focus) {
                Sburb.cam.x = Sburb.focus.x - stagePos.width / 2;
                Sburb.cam.y = Sburb.focus.y - stagePos.height / 2;
            }
        } else if (Math.abs(Sburb.destFocus.x - Sburb.cam.x - stagePos.width / 2) > 4 || Math.abs(Sburb.destFocus.y - Sburb.cam.y - stagePos.height / 2) > 4) {
            Sburb.cam.x += (Sburb.destFocus.x - stagePos.width / 2 - Sburb.cam.x) / 5;
            Sburb.cam.y += (Sburb.destFocus.y - stagePos.height / 2 - Sburb.cam.y) / 5;
        } else {
            Sburb.focus = Sburb.destFocus;
            Sburb.destFocus = null;
        }
        var scale = Sburb.document.getScale();
        var nx = Math.max(0, Math.min(Math.round(Sburb.cam.x / scale) * scale, Sburb.curRoom.width - stagePos.width));
        var ny = Math.max(0, Math.min(Math.round(Sburb.cam.y / scale) * scale, Sburb.curRoom.height - stagePos.height));
        Sburb.document.setStagePos(nx, ny);
    }

    function handleRoomChange() {
        var fade = Sburb.document.getFade();
        var fadeRate = Sburb.document.getFadeRate();
        if (Sburb.destRoom || Sburb.fading) {
            if (fade < 1.1) {
                Sburb.document.setFade(Math.min(1.1, fade + fadeRate));
            } else if (Sburb.destRoom) {
                var deltaX = Sburb.destX - Sburb.char.x;
                var deltaY = Sburb.destY - Sburb.char.y;
                var curSprite = Sburb.char;
                while (curSprite) {
                    curSprite.x += deltaX;
                    curSprite.y += deltaY;
                    curSprite.followBuffer = [];
                    curSprite = curSprite.follower;
                }
                Sburb.moveSprite(Sburb.char, Sburb.curRoom, Sburb.destRoom);
                Sburb.curRoom.exit();
                Sburb.curRoom = Sburb.destRoom;
                Sburb.curRoom.enter();
                Sburb.destRoom = null;
            } else {
                Sburb.fading = false;
            }
        } else if (hasControl() && fade > 0.01) {
            Sburb.document.setFade(Math.max(0.01, fade - fadeRate));
            //apparently alpha 0 is buggy?
        }
    }

    function beginChoosing() {
        Sburb.char.idle();
        Sburb.chooser.beginChoosing(Sburb.char.x, Sburb.char.y);
    }

    function chainAction() {
        if (Sburb.curAction) {
            chainActionInQueue(Sburb);
        }
        for (var i = 0; i < Sburb.actionQueues.length; i++) {
            var queue = Sburb.actionQueues[i];
            if (!queue.curAction) {
                Sburb.actionQueues.remove(i);
                i--;
                continue;
            }
            if (queue.paused || queue.waitFor) {
                if ((queue.trigger && queue.trigger.checkCompletion())
                    || queue.waitFor) {
                    queue.paused = false;
                    queue.trigger = null;
                } else {
                    continue;
                }
            }
            chainActionInQueue(queue);
        }
    }

    function chainActionInQueue(queue) {
        if (queue.curAction.times <= 0) {
            if (queue.curAction.followUp) {
                if (hasControl() || queue.curAction.followUp.noWait || queue.noWait) {
                    Sburb.performAction(queue.curAction.followUp, queue);
                }
            } else {
                queue.curAction = null;
            }
        } else if (hasControl() || queue.curAction.noWait || queue.noWait) {
            Sburb.performAction(queue.curAction, queue);
        }
    }

    function updateWait() {
        if (Sburb.waitFor) {
            if (Sburb.waitFor.checkCompletion()) {
                Sburb.waitFor = null;
            }
        }
        Sburb.input.update();
    }

    Sburb.performAction = function (action, queue) {
        if (action.silent) {
            if ((action.times == 1) && (!action.followUp)) {
                Sburb.performActionSilent(action);
                return null;
            }
            if ((!queue) || (queue == Sburb)) {
                if (action.silent === true) {
                    queue = new Sburb.ActionQueue(action);
                } else {
                    var options = action.silent.split(":");
                    var noWait = (options[0] == "full") ? true : false;
                    var id = null;
                    if (noWait) {
                        options.shift();
                    }
                    if (options.length > 0) {
                        id = options.shift();
                    }
                    queue = new Sburb.ActionQueue(action, id, options, noWait);
                }
                Sburb.actionQueues.push(queue);
            }
        }
        if (queue && (queue != Sburb)) {
            performActionInQueue(action, queue);
            return queue;
        }
        if (((Sburb.curAction && Sburb.curAction.followUp != action && Sburb.curAction != action) || !hasControl()) && action.soft) {
            return null;
        }
        performActionInQueue(action, Sburb);
        return null;
    };

    function performActionInQueue(action, queue) {
        var looped = false;
        queue.curAction = action.clone();
        do {
            if (looped) {
                queue.curAction = queue.curAction.followUp.clone();
            }
            var result = Sburb.performActionSilent(queue.curAction);
            handleCommandResult(queue, result);
            looped = true;
        } while (queue.curAction && queue.curAction.times <= 0 && queue.curAction.followUp && queue.curAction.followUp.noDelay);
    }

    Sburb.performActionSilent = function (action) {
        action.times--;
        var info = action.info();
        if (info) {
            info = info.trim();
        }
        return Sburb.commands[action.command.trim()](info);
    };

    function handleCommandResult(queue, result) {
        if (result) {
            if (queue.hasOwnProperty("trigger")) {
                queue.paused = true;
                queue.trigger = result;
            } else {
                queue.waitFor = result;
            }
        }
    }

    Sburb.changeRoom = function (newRoom, newX, newY) {
        Sburb.destRoom = newRoom;
        Sburb.destX = newX;
        Sburb.destY = newY;
    };


    Sburb.moveSprite = function (sprite, oldRoom, newRoom) {
        var curSprite = sprite;
        while (curSprite) {
            oldRoom.removeSprite(curSprite);
            newRoom.addSprite(curSprite);
            curSprite = curSprite.follower;
        }
    };

    Sburb.setCurRoomOf = function (sprite) {
        if (!Sburb.curRoom.contains(sprite)) {
            for (var room in Sburb.rooms) {
                if (!Sburb.rooms.hasOwnProperty(room)) continue;
                if (Sburb.rooms[room].contains(sprite)) {
                    Sburb.changeRoom(Sburb.rooms[room], Sburb.char.x, Sburb.char.y);
                    return;
                }
            }
        }
    };

    Sburb.playEffect = function (effect, x, y) {
        Sburb.curRoom.addEffect(effect.clone(x, y));
    };

    Sburb.startUpdateProcess = startUpdateProcess;
    Sburb.haltUpdateProcess = haltUpdateProcess;
    Sburb.draw = draw;
    return Sburb;
})(Sburb || {});
