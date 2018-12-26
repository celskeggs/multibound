var Libs = (function (Libs) {
    Libs.Compat = {};
    Libs.Compat.testCompat = function (levelName, successcb, errcb) {
        if (Modernizr.xhr2) {
            try {
                // Test blob response
                var xhr = new XMLHttpRequest();
                xhr.open("GET", levelName, true);
                xhr.responseType = "blob";
                xhr.onload = function () {
                    if ((this.status == 200 || this.status == 0) && this.response) {
                        Modernizr.addTest('xhrblob', function () {
                            return true;
                        }); // TODO: Test if this.response is actually a blob?
                    } else {
                        Modernizr.addTest('xhrblob', function () {
                            return false;
                        });
                    }
                };
                xhr.onabort = function () {
                    Modernizr.addTest('xhrblob', function () {
                        return false;
                    });
                };
                xhr.onerror = function () {
                    Modernizr.addTest('xhrblob', function () {
                        return false;
                    });
                };
                xhr.send();

                // Test Arraybuffer response
                xhr = new XMLHttpRequest();
                xhr.open("GET", levelName, true);
                xhr.responseType = "arraybuffer";
                xhr.onload = function () {
                    if ((this.status == 200 || this.status == 0) && this.response) {
                        var arr = this.response;
                        Modernizr.addTest('xhrarraybuffer', function () {
                            return true;
                        }); // TODO: test if this.response is actually an arraybuffer?
                    } else {
                        Modernizr.addTest('xhrarraybuffer', function () {
                            return false;
                        });
                    }
                };
                xhr.onabort = function () {
                    Modernizr.addTest('xhrarraybuffer', function () {
                        return false;
                    });
                };
                xhr.onerror = function () {
                    Modernizr.addTest('xhrarraybuffer', function () {
                        return false;
                    });
                };
                xhr.send();
            } catch (e) {
                alert(e.message + "\n\nIf you are running Google Chrome, you need to run it with the -allow-file-access-from-files switch to load this.")
            }
        } else {
            Modernizr.addTest('xhrblob', function () {
                return false;
            });
            Modernizr.addTest('xhrarraybuffer', function () {
                return false;
            });
        }

        function afterAsyncTests() {
            // Make sure Modernizr finished loading async tests
            if (!('xhrblob' in Modernizr && 'xhrarraybuffer' in Modernizr && 'datauri' in Modernizr)) {
                setTimeout(function () {
                    afterAsyncTests();
                }, 200);
                return;
            }

            // Use Modernizr to test compatibility
            var errors = [];
            if (!Modernizr.fontface) errors.push("- Lack of CSS @font-face support.");
            if (!Modernizr.canvas) errors.push("- Lack of canvas support.");
            if (!Modernizr.canvastext) errors.push("- Lack of canvas text support.");
            if (!Modernizr.json) errors.push("- Lack of JSON support.");
            if (!Modernizr.xmlserializer) errors.push("- Lack of XMLSerializer support.");

            if (errors.length) {
                errcb(errors);
            } else {
                tests = {};
                tests['blobrevoke'] = Modernizr.blob && Modernizr.blob.revoke;
                if (Modernizr.audio && (Modernizr.audio.mp3 || Modernizr.audio.ogg)) {
                    tests['audio'] = Boolean(true);
                    tests.audio.mp3 = Modernizr.audio.mp3;
                    tests.audio.ogg = Modernizr.audio.ogg;
                } else {
                    tests['audio'] = false;
                }
                if (Modernizr.localstorage || Modernizr.sessionstorage) {
                    tests['storage'] = Boolean(true);
                    tests.storage.local = Modernizr.localstorage;
                    tests.storage.session = Modernizr.sessionstorage;
                } else {
                    tests['storage'] = false;
                }

                // Caution, weirdness ahead. Tests in order of preference, future tests should use increasing numbers. Do not change existing constants.
                // To deprecate a test, move it to the bottom of the list. To make it obsolete, comment it out.
                // Assets.js and Debugger.js are the only files to reference these constants
                tests['loading'] = 0; // Just pass raw URL to elements
                if (Modernizr.xhrblob && Modernizr.blob && Modernizr.blob.url && Modernizr.blob.creator) {
                    tests.loading = 11; // Load as blob, pass to blob constructor and generate Blob URI
                } else if (Modernizr.xhrblob && Modernizr.blob && Modernizr.blob.url && Modernizr.blob.builder) {
                    tests.loading = 10; // Load as blob, pass to blob builder and generate Blob URI
                } else if (Modernizr.xhrblob && Modernizr.blob && Modernizr.blob.url && Modernizr.blob.slice) {
                    tests.loading = 9; // Load as blob, pass to blob.slice and generate Blob URI
                } else if (Modernizr.xhrblob && Modernizr.datauri && Modernizr.filereader) {
                    tests.loading = 8; // Load as blob, pass to file reader and generate Data URI
                } else if (Modernizr.xhrarraybuffer && Modernizr.arraybuffer && Modernizr.arraybuffer.dataview && Modernizr.blob && Modernizr.blob.url && Modernizr.blob.creator) {
                    tests.loading = 7; // Load as arraybuffer, convert to data view, pass to blob constructor and generate Blob URI
                } else if (Modernizr.xhrarraybuffer && Modernizr.arraybuffer && Modernizr.blob && Modernizr.blob.url && Modernizr.blob.creator) {
                    tests.loading = 6; // Load as arraybuffer, use hacks to pass to blob constructor and generate Blob URI
                } else if (Modernizr.xhrarraybuffer && Modernizr.arraybuffer && Modernizr.blob && Modernizr.blob.url && Modernizr.blob.builder) {
                    tests.loading = 5; // Load as arraybuffer, pass to blob builder and generate Blob URI
                } else if (Modernizr.xhrarraybuffer && Modernizr.arraybuffer && Modernizr.arraybuffer.dataview && Modernizr.datauri) {
                    tests.loading = 4; // Load as arraybuffer, convert to base 64 and generate Data URI
                } else if (Modernizr.overridemimetype && Modernizr.blob && Modernizr.blob.url && Modernizr.blob.creator && Modernizr.arraybuffer && Modernizr.arraybuffer.dataview) {
                    tests.loading = 3; // Load as string, convert to arraybuffer, pass to blob constructor and generate Blob URI
                } else if (Modernizr.overridemimetype && Modernizr.blob && Modernizr.blob.url && Modernizr.blob.builder && Modernizr.arraybuffer && Modernizr.arraybuffer.dataview) {
                    tests.loading = 2; // Load as string, convert to arraybuffer, pass to blob builder and generate Blob URI
                } else if (Modernizr.overridemimetype && Modernizr.datauri) {
                    tests.loading = 1; // Load as string, clean it up, convert to base 64 and generate Data URI
                } else if (Modernizr.vbarray && Modernizr.datauri) {
                    tests.loading = 12; // Load as god knows what, use IE hacks, convert to base 64 and generate Data URI
                }

                successcb(tests);
            }
        }
        afterAsyncTests();
    };

    return Libs;
})(Libs || {});
