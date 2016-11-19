VR_APP.screens.main = (function() {

    var framesBetween = 2500,
        currentFrame = 0,
        canAdd = false,
        loader = new THREE.TextureLoader(),
        raycaster = new THREE.Raycaster(),
        clicked = false,
        meshes = [],
        target,
        explosions = [],
        heart;

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

        window.addEventListener('resize', onResize, true);
        window.addEventListener('vrdisplaypresentchange', onResize, true);
        document.addEventListener('click', onClick);

        var grid = new THREE.GridHelper(200, 10, 0xffffff, 0xffffff);
        grid.position.y = -5;
        VR_APP.scene.add(grid);
        VR_APP.scene.fog = new THREE.FogExp2( 0xd8e7ff, 0.0128 );
        VR_APP.renderer.setClearColor( VR_APP.scene.fog.color, 1 );

        // Target in middle of screen
        var crosshairs = new Image();
        crosshairs.onload = function() {
            var canvas = document.createElement('canvas');
            var context = canvas.getContext('2d');
            canvas.height = 128;
            canvas.width = 128;
            context.fillStyle = '#000000';
            context.drawImage(crosshairs, 0, 0, 128, 128);

            var textureMap = new THREE.Texture(canvas);
            textureMap.needsUpdate = true;

            var material = new THREE.SpriteMaterial({
                map: textureMap,
                transparent: false,
                color: 0xffffff
            });

            target = new THREE.Sprite(material);
            target.scale.set(.1, .1, .1);

            VR_APP.scene.add(target);
        }
        crosshairs.src = '/img/crosshairs.png';

        // Add a repeating grid as a skybox.
        /*
        var boxWidth = 20;
        loader.load('/img/gray.png', onTextureLoaded);
        function onTextureLoaded(texture) {
            /*
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
        }
        */
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

        var list = [-4, 0, 4];
        var x = randomInList(list);
        var z;
        if(x !== 0){
            z = randomInList(list) + getRandomArbitrary(-0.5, 0.5);
        } else {
            z = randomInList([-4, 4]) + getRandomArbitrary(-0.5, 0.5);
        }

        var mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(4, 4),
            material
        );
        mesh.doubleSided = true;
        mesh.position.set(x, 7.5, z);
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

                var pos = VR_APP.camera.getWorldPosition();
                VR_APP.messages[i].mesh.lookAt(pos);

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

    function newExplosion() {
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        canvas.height = 128;
        canvas.width = 128;
        context.fillStyle = '#d8e7ff';
        context.fillRect(0, 0, 128, 128);
        context.drawImage(heart, 0, 0, 128, 128);

        var textureMap = new THREE.Texture(canvas);
        textureMap.needsUpdate = true;

        var explosion = ExplodeAnimation(target.position.x, target.position.y, target.position.z, textureMap);
        VR_APP.scene.add(explosion.object);
        explosions.push(explosion);
    }

    function createExplosion() {
        if(!heart) {
            heart = new Image();
            heart.onload = newExplosion;
            heart.src = '/img/heart.png'
        } else {
            newExplosion();
        }
    }

    function getSelectedTweets() {
        raycaster.set(VR_APP.camera.getWorldPosition(), VR_APP.camera.getWorldDirection());

    	var intersects = raycaster.intersectObjects(VR_APP.scene.children);

    	for (var i = 0; i < intersects.length; i++) {
            if(intersects[i].object.hasOwnProperty('tweet')) {
                if(!intersects[i].object.hasOwnProperty('liked')) {
                    createExplosion();
                    //intersects[i].object.liked = true;
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

    function updateExplosions() {
        for(var i = explosions.length - 1; i >= 0; i--) {
            explosions[i].update();
            explosions[i].decay -= 1;
            if(explosions[i].decay < 0) {
                explosions.splice(i, 1);
                VR_APP.scene.remove(explosions[i]);
            }
        }
    }

    function animate(timestamp) {
        var delta = Math.min(timestamp - VR_APP.lastRender, 500);
        VR_APP.lastRender = timestamp;

        getInput();

        updateTarget();
        updateMessages();
        updateExplosions();

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
