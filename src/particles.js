function ExplodeAnimation(x, y, z, texture)
{
    var movementSpeed = .5;
    var totalObjects = 100;
    var objectSize = .075;
    var sizeRandomness = 4000;
    var color = 0xFF0000;
    var dirs = [];
    var geometry = new THREE.Geometry();
    for (i = 0; i < totalObjects; i ++)
    {
        var vertex = new THREE.Vector3();
        vertex.x = x;
        vertex.y = y;
        vertex.z = z;

        geometry.vertices.push(vertex);
        dirs.push({x:(Math.random() * movementSpeed)-(movementSpeed/2),y:(Math.random() * movementSpeed)-(movementSpeed/2),z:(Math.random() * movementSpeed)-(movementSpeed/2)});
    }

    var material = new THREE.PointsMaterial({
        size: objectSize,
        map: texture
    });

    var particles = new THREE.Points( geometry, material );

    this.object = particles;
    this.status = true;

    this.xDir = (Math.random() * movementSpeed)-(movementSpeed/2);
    this.yDir = (Math.random() * movementSpeed)-(movementSpeed/2);
    this.zDir = (Math.random() * movementSpeed)-(movementSpeed/2);

    this.update = function(){
        var pCount = totalObjects;
        while(pCount--) {
            var particle =  this.object.geometry.vertices[pCount]
            particle.y += dirs[pCount].y;
            particle.x += dirs[pCount].x;
            particle.z += dirs[pCount].z;
        }

        this.object.geometry.verticesNeedUpdate = true;
    }

    return {
        object: this.object,
        update: this.update,
        decay: 180
    };
}
