VR_APP.screens.main = (function() {

    var framesBetween = 5000,
        currentFrame = 0,
        canAdd = false,
        loader = new THREE.TextureLoader(),
        raycaster = new THREE.Raycaster(),
        clicked = false,
        meshes = [],
        target;

    var counter = 0;

    function onResize(e) {
        VR_APP.effect.setSize(window.innerWidth, window.innerHeight);
        VR_APP.camera.aspect = window.innerWidth / window.innerHeight;
        VR_APP.camera.updateProjectionMatrix();
    }

    function onClick() {
        clicked = true;
    }

    function initialize(){
        VR_APP.lastRender = 0;

        console.log(VR_APP.manager);

        window.addEventListener('resize', onResize, true);
        window.addEventListener('vrdisplaypresentchange', onResize, true);
        document.addEventListener('click', onClick);

        // Add a repeating grid as a skybox.
        var boxWidth = 20;
        loader.load('/img/background.png', onTextureLoaded);

        function onTextureLoaded(texture) {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(boxWidth, boxWidth);

            var geometry = new THREE.BoxGeometry(boxWidth, boxWidth, boxWidth);

            var material = new THREE.MeshBasicMaterial({
                map: texture,
                side: THREE.BackSide
            });

            var skybox = new THREE.Mesh(geometry, material);
            VR_APP.scene.add(skybox);

            // Target in middle of screen
            var heart = new Image();
            heart.onload = function() {
                var canvas = document.createElement('canvas');
                var context = canvas.getContext('2d');
                canvas.height = 16;
                canvas.width = 16;
                context.fillStyle = '#000000';
                context.drawImage(heart, 0, 0, 16, 16);
                //context.fillRect(0, 0, 8, 8);

                var textureMap = new THREE.Texture(canvas);
                textureMap.needsUpdate = true;

                var material = new THREE.SpriteMaterial({
                    map: textureMap,
                    transparent: false,
                    color: 0xffffff
                });

                target = new THREE.Sprite(material);
                target.scale.set(.02, .02, .02);

                VR_APP.scene.add(target);
            }
            heart.src = '/img/heart.png';
        }
    }

    function drawText(context, text, x, y, fillStyle) {
        context.fillStyle = fillStyle;
        context.fillText(text, x, y);
    }

    function drawLongText(context, text, x, y, fillStyle, size) {
        //text.replace(/https?:.*/, '')
        var words = text.split(' ');
        var currentWidth = 0;
        var currentWord = '';
        var lines = 1;
        for(var i = 0; i < words.length; i++) {
            currentWidth += context.measureText(words[i]).width;
            if(currentWidth > size) {
                drawText(context, currentWord, x, y, fillStyle);
                currentWidth = 0;
                currentWord = words[i];
                y += 20;
                lines += 1;
            } else {
                currentWord += ' ' + words[i];
            }
        }

        if(currentWord != '') {
            drawText(context, currentWord, x, y, fillStyle);
        }

        return lines;
    }

    function getRandomArbitrary(min, max) {
        return Math.random() * (max - min) + min;
    }

    function getRandomOfTwo(num1, num2) {
        return Math.random() > 0.5 ? num1 : num2;
    }

    var randomInList = function(list) {
        return list[Math.floor(Math.random() * list.length)]
    };

    function addTweetToScene(index, canvas, tweet) {
        var textureMap = new THREE.Texture(canvas);
        textureMap.needsUpdate = true;

        var material = new THREE.MeshBasicMaterial({
            map: textureMap,
            transparent: true
        });

        var list = [-5, -4, -3, 0, 3, 4, 5];
        var x = randomInList(list);
        var z;
        if(x !== 0){
            z = randomInList(list) + getRandomArbitrary(-2, 2);
        } else {
            z = randomInList([-5, -4, -3, 3, 4, 5]) + getRandomArbitrary(-2, 2);
        }

        var mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(4, 4),
            material
        );
        mesh.doubleSided = true;
        mesh.position.set(x, 10, z);
        mesh.tweet = tweet;

        VR_APP.scene.add(mesh);
        VR_APP.messages[index].mesh = mesh;
        VR_APP.messages[index].initialized = true;

        meshes.push(mesh);
    }

    // Create a canvas object and draw text on it
    function createMessageText2d(index){
        var canvas = document.createElement('canvas');
        var size = 512;
        var context = canvas.getContext('2d');
        var tweet = VR_APP.messages[index];
        var img = new Image();
        var padding = 10;
        var spacing = 20;

        canvas.width = size;
        canvas.height = size;

        img.crossOrigin = 'anonymous';
        img.onload = function() {
            context.drawImage(img, 0, 0);

            context.fillStyle = '#' + tweet.user.text_color;
            context.textAlign = 'left';
            context.font = '16px Arial';

            drawText(context, tweet.user.name, img.width + padding, 15, '#000000');
            drawText(context, '@' + tweet.user.screen_name, img.width + context.measureText(tweet.user.name).width + 15, 15, '#707070');

            var lines = drawLongText(context, tweet.text, img.width + padding, 45, '#000000', size / 2);

            if (tweet.media_url) {
                var media = new Image();
                media.crossOrigin = 'anonymous';
                media.onload = function() {
                    // TODO set media size restrictions
                    context.drawImage(media, 0 + img.width, (lines + 2) * spacing, media.width / 4, media.height / 4);
                    addTweetToScene(index, canvas, tweet);
                }
                media.src = tweet.media_url;
            } else {
                addTweetToScene(index, canvas, tweet);
            }

        };
        img.src = tweet.user.profile_image_url;
    }

    function updateMessages(){
        var numberOfMesseges = 0;
        for(var i = VR_APP.messages.length - 1; i >= 0; i--){
            if(VR_APP.messages[i].initialized){
                numberOfMesseges += 1;
                VR_APP.messages[i].mesh.position.y -= 0.02;

                var pos = VR_APP.camera.getWorldDirection();
                //VR_APP.messages[i].mesh.position.set(pos.x - 5, pos.y, pos.z - 5);

                // SET ROTATION HERE?!
                //console.log(VR_APP.messages[i].mesh);
                VR_APP.messages[i].mesh.lookAt(VR_APP.camera.getWorldPosition());

                if(VR_APP.messages[i].mesh.position.y < -10){
                    VR_APP.scene.remove(VR_APP.messages[i].mesh);
                    VR_APP.messages.splice(i, 1);
                    currentFrame = 0;
                }

            } else {
                if(canAdd){
                    currentFrame += 1;
                    if(currentFrame >= framesBetween){
                        currentFrame = 0;
                        createMessageText2d(i);
                        //canAdd = false;
                        //console.log('adding');
                    }
                } else {
                    currentFrame = 0;
                }
            }
        }

        if(numberOfMesseges < VR_APP.MAX_MESSAGES && canAdd === false){
            currentFrame = 0;
            canAdd = true;
        }
    }

    function likeTweet(tweet) {
        $.get(
            '/feed/like/' + tweet.id,
            function(data, status) {
                console.log(data, status);
            }
        );
    }

    function getSelectedTweets() {
        raycaster.set(VR_APP.camera.getWorldPosition(), VR_APP.camera.getWorldDirection());

    	var intersects = raycaster.intersectObjects(VR_APP.scene.children);

        for(var i = 0; i < meshes.length; i++) {
            //meshes[i].material.color.set(0x00ff00);
        }

    	for (var i = 0; i < intersects.length; i++) {
            if(intersects[i].object.hasOwnProperty('tweet')) {
                if(!intersects[i].object.hasOwnProperty('liked')) {
                    console.log(intersects[i].object);
                    intersects[i].object.liked = true;
                    intersects[i].object.material.color.set(0xff0000);

                    likeTweet(intersects[i].object.tweet);
                }
            }
    	}
    }

    function getInput() {
        if(clicked) {
            getSelectedTweets();
            clicked = false;
        }
    }

    function updateTarget() {
        if(typeof target !== 'undefined'){
            var pos = VR_APP.camera.getWorldDirection();
            target.position.set(pos.x, pos.y, pos.z);
        }
    }

    function animate(timestamp) {
        var delta = Math.min(timestamp - VR_APP.lastRender, 500);
        VR_APP.lastRender = timestamp;

        getInput();

        updateTarget();
        updateMessages();

        // Update VR headset position and apply to camera.
        VR_APP.controls.update();

        // Render the scene through the manager.
        VR_APP.manager.render(VR_APP.scene, VR_APP.camera, VR_APP.lastRender);

        requestAnimationFrame(animate);
    }

    function show(){
        // Kick off animation loop
        animate(performance ? performance.now() : Date.now());
    }

    function destroy(){
        // remove all objects from the scene
    }

    return {
        initialize: initialize,
        show: show
    }
}());

VR_APP.screens.main.initialize();
VR_APP.screens.main.show();
