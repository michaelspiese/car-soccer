import * as THREE from 'three'

export class Car extends THREE.Object3D
{
    public velocity : THREE.Vector3;
    public initialPosition : THREE.Vector3;
    public size : THREE.Vector3;
    public collisionRadius : number;

    constructor(position: THREE.Vector3, size : THREE.Vector3, collisionRadius : number)
    {
        super();
        this.initialPosition = position;
        this.velocity = new THREE.Vector3();
        this.size = size;
        this.collisionRadius = collisionRadius;

        // Model the car as a box
        var geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
        var material = new THREE.MeshLambertMaterial();
        material.color = new THREE.Color(0.8, 0.2, 0.2);
        var mesh = new THREE.Mesh(geometry, material);
        this.add(mesh);

        // Add smaller, lighter colored box to indicate the front
        var frontGeometry = new THREE.BoxGeometry(size.x, 0.01, size.z / 4);
        var frontMaterial = new THREE.MeshLambertMaterial();
        frontMaterial.color = new THREE.Color(0.8, 0.5, 0.5);
        var frontMesh = new THREE.Mesh(frontGeometry, frontMaterial);
        frontMesh.position.y = size.y / 2 + 0.01;
        frontMesh.position.z = -size.z / 2 + size.z / 8;
        this.add(frontMesh);
        
        this.reset();
    }

    public reset() : void
    {
        this.position.copy(this.initialPosition);
        this.rotation.set(0, 0, 0);
        this.velocity.set(0, 0, 0);
    }

    public update(deltaTime : number) : void
    {
        // Update car's local z position based on input
        // Since the car can only move forward and backwards relative to itself, only translateZ() needs to be applied
        this.translateZ(this.velocity.z * deltaTime);
        if (this.position.x < -37.4 || this.position.x > 37.4 || this.position.z < -47.4 || this.position.z > 47.4) 
        {
            // Step back if car would go out of bounds
            this.translateZ(-this.velocity.z * deltaTime);
        }
    }
}