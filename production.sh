#!/bin/bash
set -e -u
gcc jsmin.c -o jsmin
cat libs/modernizr.js src/Compat.js src/Sburb.js src/Document.js src/Input.js src/Sprite.js src/Character.js src/SpriteButton.js src/Animation.js src/Room.js src/FontEngine.js src/Action.js src/Events.js src/Trigger.js src/Commands.js src/Serialization.js src/Dialoger.js src/Chooser.js src/Audio.js src/Assets.js src/Path.js src/ActionQueue.js > Sburb.js
./jsmin < Sburb.js > Sburb.min.js
cp index.html index_dev.html
rm index.html
cp index_production.html index.html
zip -r Sburb.zip Sburb.min.js index.html README.md resources levels 
rm Sburb.js
rm Sburb.min.js
rm index.html
cp index_dev.html index.html
rm index_dev.html
rm jsmin
