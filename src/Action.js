var Sburb = (function (Sburb) {


///////////////////////////////////////////////
//Action Class
///////////////////////////////////////////////

//Constructor
    Sburb.Action = function (command, info, name, sprite, followUp, noWait, noDelay, times, soft, silent) {
        this.sprite = sprite ? sprite : null;
        this.name = name ? name : null;
        this.command = command;
        this._info = info;
        this.followUp = followUp ? followUp : null;
        this.noWait = noWait ? noWait : false;
        this.noDelay = noDelay ? noDelay : false;
        this.soft = soft ? soft : false;
        if (silent == "true") {
            this.silent = true;
        } else {
            this.silent = silent ? silent : false;
        }
        this.times = times ? times : 1;
    };

    Sburb.Action.prototype.info = function () {
        if (this._info) {
            if (typeof (this._info) == "string") {
                return this._info;
            } else if (this._info.text) {
                return this._info.text;
            }
        }
        return "";
    };

//Make an exact copy
    Sburb.Action.prototype.clone = function () {
        return new Sburb.Action(this.command, this._info, this.name, this.sprite, this.followUp, this.noWait, this.noDelay, this.times, this.soft, this.silent);
    };


//////////////////////////////////////////////////
//Related utility functions
//////////////////////////////////////////////////

//Parse a serialized Action from an XML DOM node
    Sburb.parseAction = function (node) {
        var targSprite = null;
        var firstAction = null;
        var oldAction = null;
        do {
            var attributes = node.attributes;

            if (attributes.getNamedItem("sprite") && attributes.getNamedItem("sprite").value != "null") {
                targSprite = attributes.getNamedItem("sprite").value;
            }
            var times = attributes.getNamedItem("times") || attributes.getNamedItem("loops") || attributes.getNamedItem("for");

            var info = node.firstChild ? getNodeText(node) : "";
            if (typeof (info) == "string") {
                info = unescape(info).trim();
            }

            var newAction = new Sburb.Action(
                attributes.getNamedItem("command").value,
                info,
                attributes.getNamedItem("name") ? unescape(attributes.getNamedItem("name").value) : null,
                targSprite,
                null,
                attributes.getNamedItem("noWait") ? attributes.getNamedItem("noWait").value == "true" : false,
                attributes.getNamedItem("noDelay") ? attributes.getNamedItem("noDelay").value == "true" : false,
                times ? parseInt(times.value) : 1,
                attributes.getNamedItem("soft") ? attributes.getNamedItem("soft").value == "true" : false,
                attributes.getNamedItem("silent") ? attributes.getNamedItem("silent").value : false);

            if (oldAction) {
                oldAction.followUp = newAction;
            }
            if (!firstAction) {
                firstAction = newAction;
            }
            oldAction = newAction;
            var oldNode = node;
            node = null;
            for (var i = 0; i < oldNode.childNodes.length; i++) {
                var child = oldNode.childNodes[i];
                if (child.nodeName == "action") {
                    node = child;
                    break;
                }
            }
            if (!node) {
                break;
            }
        } while (node);

        return firstAction;
    };

    function getNodeText(xmlNode) {
        if (!xmlNode) return '';
        for (var i = 0; i < xmlNode.childNodes.length; i++) {
            var child = xmlNode.childNodes[i];
            if (child.tagName == "args") {
                if (child.attributes) {
                    var asset = child.attributes.getNamedItem("body");
                    if (asset && asset.value && Sburb.assetManager.isLoaded(asset.value)) {
                        return Sburb.assets[asset.value];
                    }
                }
                for (var k = 0; k < child.childNodes.length; k++) {
                    if (child.childNodes[k].firstChild) {
                        serializer = new XMLSerializer();
                        var output = "";
                        for (var j = 0; j < child.childNodes.length; j++) {
                            output += serializer.serializeToString(child.childNodes[j]);
                        }
                        return output;
                    }
                }
                if (typeof (child.textContent) != "undefined") {
                    return child.textContent;
                }
                return child.firstChild.nodeValue;
            }
        }
        if (typeof (xmlNode.textContent) != "undefined") {
            return xmlNode.textContent;
        }
        return xmlNode.firstChild.nodeValue;
    }


    return Sburb;
})(Sburb || {});
