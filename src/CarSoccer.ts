import * as THREE from 'three'
import { GraphicsApp } from './GraphicsApp'
import { Car } from './Car'
import { Ball } from './Ball';

export class CarSoccer extends GraphicsApp
{
    private inputVector : THREE.Vector2;
    private car : Car;
    private ball : Ball; 

    constructor()
    {
        // Pass in the aspect ratio as a parameter
        super(2);
        
        // Initialize all member variables here
        // This will help prevent runtime errors
        this.inputVector = new THREE.Vector2();
        this.car = new Car(new THREE.Vector3(0, 1, 45), new THREE.Vector3(4, 4, 5), 4);
        this.ball = new Ball(new THREE.Vector3(0, 2.6, 0), 2.6);
    }

    createScene() : void
    {
        // Setup camera
        this.camera.position.set(0, 63, 73);
        this.camera.lookAt(0, 0, 0);
        this.camera.up.set(0, 1, 0);

        // Create an ambient light
        var ambientLight = new THREE.AmbientLight('white', .3);
        this.scene.add(ambientLight);

        // Create a directional light
        var directionalLight = new THREE.DirectionalLight('white', .6);
        directionalLight.position.set(0, 2, 1);
        this.scene.add(directionalLight);

        // Load a texture and set it as the background
        this.scene.background = new THREE.TextureLoader().load('assets/crowd.png');

        // Create the green field material
        var fieldMaterial = new THREE.MeshLambertMaterial();
        fieldMaterial.color = new THREE.Color(16/255, 46/255, 9/255);

        // Create a field mesh
        var field = new THREE.Mesh(new THREE.BoxGeometry(100, 1, 120), fieldMaterial);
        field.position.set(0, -.501, 0);
        this.scene.add(field);

        // Load in the pitch image and create a texture
        var pitchMaterial = new THREE.MeshLambertMaterial();
        pitchMaterial.map = new THREE.TextureLoader().load('assets/pitch.png');

        // Create the mesh for the pitch
        var pitch = new THREE.Mesh(new THREE.BoxGeometry(80, 1, 100), pitchMaterial);
        pitch.position.set(0, -0.5, 0);
        this.scene.add(pitch);

        // Creating boundary line material
        var lineMaterial = new THREE.LineBasicMaterial;
        lineMaterial.color = new THREE.Color(0xff8888);

        // Defining boundary line geometries
        var boundsPoints = [
            new THREE.Vector3(-40,0,-50),
            new THREE.Vector3(-40,0,50),
            new THREE.Vector3(40,0,50),
            new THREE.Vector3(40,0,-50),
            new THREE.Vector3(-40,0,-50)
        ];
        var vertPoints = [
            new THREE.Vector3(0,0,0),
            new THREE.Vector3(0,35,0)
        ];
        var vertGeometry = new THREE.BufferGeometry().setFromPoints(vertPoints);
        var upperGeometry = new THREE.BufferGeometry().setFromPoints(boundsPoints);

        // Draw vertical lines of the boundary at corners of the pitch
        for (var i=0; i<4; i++) 
        {
            let pos = boundsPoints[i];
            let vertOutline = new THREE.Line(vertGeometry, lineMaterial);
            vertOutline.position.set(pos.x, pos.y, pos.z);
            this.scene.add(vertOutline);
        }

        // Draw the upper horizontal lines of the boundary and adjust position
        var upperBoundOutline = new THREE.Line(upperGeometry, lineMaterial);
        upperBoundOutline.position.set(0,35,0);
        this.scene.add(upperBoundOutline);

        // Defining materials for the home and away goals
        var awayGoalMaterial = new THREE.MeshLambertMaterial({color: 0x3b96ff});
        var homeGoalMaterial = new THREE.MeshLambertMaterial({color: 0xff9e3d});

        // Creating the away goal and adding it to the scene
        var awayGoal = this.createGoal(awayGoalMaterial);
        awayGoal.position.z = -50;
        this.scene.add(awayGoal);

        // Creating the home goal and adding it to the scene
        var homeGoal = this.createGoal(homeGoalMaterial);
        homeGoal.position.z = 50;
        this.scene.add(homeGoal);

        // Add the car and ball to the scene
        this.scene.add(this.car);
        this.scene.add(this.ball);
    }

    update(deltaTime : number) : void
    {
        // Speed in meters/sec
        const carMaxSpeed = 40;

        // Arbitrary car acceleration value chosen by trial and error
        const carAccel = 75;

        // Car turning/rotation value in red/sec
        const carRotation = 3*Math.PI/2;

        // Move the car based on the user input vector
        this.car.velocity.z += -this.inputVector.y* carAccel *deltaTime;
        if (Math.abs(this.car.velocity.length()) > carMaxSpeed)
            // Bound the speed to the maximum value by reversing the change in velocity
            this.car.velocity.z -= -this.inputVector.y* carAccel *deltaTime;

        // If one of the "drive" buttons is released, decelerate the car
        if (this.inputVector.y == 0) 
        {
            if (this.car.velocity.z < 0)
                this.car.velocity.z += carAccel * deltaTime;
            else if (this.car.velocity.z > 0)
                this.car.velocity.z -= carAccel * deltaTime;
        }

        // Rotate the car at based on the input x and y vectors
        this.car.rotateY(this.inputVector.y * -this.inputVector.x * carRotation * deltaTime);

        // Detect collisions between the car and ball and adjust the velocity of the ball
        let carToBall = this.subtractVectors(this.car.position, this.ball.position);
        if (carToBall.length() < this.car.collisionRadius + this.ball.radius) 
        {
            let vBall = this.ball.velocity.length();
            let vCar = this.car.velocity.length();
            
            // Set the direction of the velocity of the ball to the normal vector of the collision
            this.ball.velocity = carToBall.normalize();

            // Set the length of the new ball velocity based on the old ball velocity with 50% energy loss and the car's velocity
            this.ball.velocity.multiplyScalar(vCar + (vBall * 0.5));

            // Lower y direction of new velocity to correct ball being hit too far upwards
            this.ball.velocity.y -= 0.5;
        }

        // Update the car physics
        this.car.update(deltaTime);

        // Update the ball physics
        this.ball.update(deltaTime);

        // Update the ball shadow
        this.ball.updateShadow();

        // Check if a goal is scored by determining if the ball has entered a goal area
        if ((this.ball.position.x > -12.6 && this.ball.position.x < 12.6) && (this.ball.position.y > 0 && this.ball.position.y < 12.6)) 
        {
            // Away goal
            if (this.ball.position.z < -46.5) 
            {
                this.ball.reset();
                this.car.reset();
            }
            // Home goal
            else if (this.ball.position.z > 46.5) 
            {
                this.ball.reset();
                this.car.reset();
            }
        }
    }

    // Event handler for keyboard input
    // You don't need to modify this function
    onKeyDown(event: KeyboardEvent): void 
    {
        if(event.key == 'w' || event.key == 'ArrowUp') 
            this.inputVector.y = 1;
        else if(event.key == 's' || event.key == 'ArrowDown') 
            this.inputVector.y = -1;
        else if(event.key == 'a' || event.key == 'ArrowLeft')
            this.inputVector.x = -1;
        else if(event.key == 'd' || event.key == 'ArrowRight')
            this.inputVector.x = 1;
        else if(event.key == ' ')
        {
            this.car.reset();
            this.ball.reset();
        }
    }

    // Event handler for keyboard input
    // You don't need to modify this function
    onKeyUp(event: KeyboardEvent): void 
    {
        if((event.key == 'w' || event.key == 'ArrowUp') && this.inputVector.y == 1) 
            this.inputVector.y = 0;
        else if((event.key == 's' || event.key == 'ArrowDown') && this.inputVector.y == -1) 
            this.inputVector.y = 0;
        else if((event.key == 'a' || event.key == 'ArrowLeft')  && this.inputVector.x == -1)
            this.inputVector.x = 0;
        else if((event.key == 'd' || event.key == 'ArrowRight')  && this.inputVector.x == 1)
            this.inputVector.x = 0;
    }

    // Creates a goal mesh made out of a user-specified material
    public createGoal(material : THREE.MeshLambertMaterial) : THREE.Mesh 
    {
        let goal = new THREE.Mesh;
        var goalV = new THREE.BoxGeometry(0.25, 10, 0.25);
        var goalH = new THREE.BoxGeometry(20, 0.25, 0.25);

        // Create vertical lines of goal and add to mesh
        for (var i=-10; i<=10; i++) 
        {
            let goalVMesh = new THREE.Mesh(goalV, material);
            goalVMesh.position.set(i, 5, 0);
            goal.add(goalVMesh);
        }

        // Create horizontal lines of goal and add to mesh
        for (var i=0; i<=10; i++) 
        {
            let goalVMesh = new THREE.Mesh(goalH, material);
            goalVMesh.position.set(0, i, 0);
            goal.add(goalVMesh);
        }

        // Return completed goal mesh
        return goal;
    }

    // Subtracts two vectors and returns the result
    public subtractVectors(p1 : THREE.Vector3, p2 : THREE.Vector3) : THREE.Vector3 
    {
        let v = new THREE.Vector3;

        v.x = p2.x - p1.x;
        v.y = p2.y - p1.y;
        v.z = p2.z - p1.z;

        return v;
    }
}
