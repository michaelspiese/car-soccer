import * as THREE from 'three'

export class Ball extends THREE.Object3D
{
    readonly radius : number;

    public velocity : THREE.Vector3;
    public initialPosition : THREE.Vector3;
    private shadow : THREE.Mesh;

    constructor(position: THREE.Vector3, radius : number)
    {
        super();
        this.radius = radius;
        this.velocity = new THREE.Vector3();
        this.initialPosition = position;

        // Create the sphere
        var geometry = new THREE.SphereGeometry(this.radius);
        var material = new THREE.MeshPhongMaterial();
        material.color = new THREE.Color(0.335, 0.775, 0.891);
        this.add(new THREE.Mesh(geometry, material));

        // Create a semi-transparent shadow
        var shadowGeometry = new THREE.CircleGeometry(this.radius, 20);
        var shadowMaterial = new THREE.MeshBasicMaterial();
        shadowMaterial.color = new THREE.Color(0, 0, 0); 
        shadowMaterial.transparent = true;
        shadowMaterial.opacity = 0.5;
        this.shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
        this.shadow.rotation.set(-90 * Math.PI / 180, 0, 0);
        this.add(this.shadow);
          
        this.reset();
    }

    public reset() : void
    {
        // Reset the ball's position
        this.position.copy(this.initialPosition);

        // Throw the ball in a random direction
        var randomAngle = Math.random() * Math.PI * 2;
        this.velocity.set(25*Math.cos(randomAngle), 15, 25* Math.sin(randomAngle));
    }

    public update(deltaTime : number) : void
    {
        // Update the position of the ball in the x, y, and z direction based on velocity
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
        this.position.z += this.velocity.z * deltaTime;

        // If the ball hits an x-wall, correct the position and reflect it with only 80% of "energy"
        if (this.position.x < -37.4) 
        {
            this.position.x -= this.velocity.x * deltaTime;
            this.velocity = this.reflectVector(new THREE.Vector3(1,0,0), this.velocity).multiplyScalar(0.8);
        }
        else if (this.position.x > 37.4) 
        {
            this.position.x -= this.velocity.x * deltaTime;
            this.velocity = this.reflectVector(new THREE.Vector3(-1,0,0), this.velocity).multiplyScalar(0.8);
        }

        // If the ball hits the ceiling or floor, correct the position and reflect it with only 80% of "energy"
        if (this.position.y < 2.6) 
        {
            this.position.y -= this.velocity.y * deltaTime;
            this.velocity = this.reflectVector(new THREE.Vector3(0,1,0), this.velocity).multiplyScalar(0.8);
        }
        else if (this.position.y > 32.4) 
        {
            this.position.y -= this.velocity.y * deltaTime;
            this.velocity = this.reflectVector(new THREE.Vector3(0,-1,0), this.velocity).multiplyScalar(0.8);
        }
        else 
        {
            // Otherwise, accelerate the ball downwards while it is not being reflected
            this.velocity.y += -15 * deltaTime;
        }

        // If the ball hits a z-wall, correct the position and reflect it with only 80% of "energy"
        if (this.position.z < -47.4) 
        {
            this.position.z -= this.velocity.z * deltaTime;
            this.velocity = this.reflectVector(new THREE.Vector3(0,0,1), this.velocity).multiplyScalar(0.8);
        }
        else if (this.position.z > 47.4) 
        {
            this.position.z -= this.velocity.z * deltaTime;
            this.velocity = this.reflectVector(new THREE.Vector3(0,0,-1), this.velocity).multiplyScalar(0.8);
        }
    }

    public updateShadow() : void
    {
        // Move the shadow down and slightly above the ground
        this.shadow.position.set(0, -this.position.y + 0.01, 0);
    }

    // Caltulates and returns a velocity vector reflected off of a surface based its normal vector
    public reflectVector (n : THREE.Vector3, v : THREE.Vector3) : THREE.Vector3 
    {
        // Calculate 2(v.n)n
        let vDotN = v.dot(n);
        let temp = n.multiplyScalar(2 * vDotN);

        // Return v-2(v.n)n
        return v.sub(temp);
    }
}