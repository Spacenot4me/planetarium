import './App.css';
import {useEffect, useRef} from "react";
import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import starsTexture from './images/stars.jpg';
import sunTexture from './images/sun.jpg';
import mercuryTexture from './images/mercury.jpg';
import venusTexture from './images/venus.jpg';
import earthTexture from './images/earth.jpg';
import marsTexture from './images/mars.jpg';
import jupiterTexture from './images/jupiter.jpg';
import saturnTexture from './images/saturn.jpg';
import saturnRingTexture from './images/saturn ring.png';
import uranusTexture from './images/uranus.jpg';
import uranusRingTexture from './images/uranus ring.png';
import neptuneTexture from './images/neptune.jpg';
import plutoTexture from './images/pluto.jpg';

function App() {
    
    const refContainer = useRef(null);
    useEffect(() => {
        // renderer
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);


        // scene
        const scene = new THREE.Scene();
        const cubeTextureLoader = new THREE.CubeTextureLoader();
        scene.background = cubeTextureLoader.load([
            starsTexture,
            starsTexture,
            starsTexture,
            starsTexture,
            starsTexture,
            starsTexture
        ]);


        //camera
        const camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            0.1,
            1500
        );
        camera.position.set(-90, 100, 140);


        //orbit controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.minPolarAngle = Math.PI * 0.3;
        controls.maxPolarAngle =  Math.PI * 0.5;
        controls.addEventListener('start', () => {
            renderer.setAnimationLoop(animateUserControls)
        });
        controls.addEventListener('end', () => {
            renderer.setAnimationLoop(animateDef)
        });
        controls.update();


        //light
        const ambientLight = new THREE.AmbientLight(0x333333);
        scene.add(ambientLight);
        const pointLight = new THREE.PointLight(0xFFFFFF, 3000, 300);
        scene.add(pointLight);


        // sun mesh
        const textureLoader = new THREE.TextureLoader();
        const sunGeo = new THREE.SphereGeometry(16, 30, 30);
        const sunMat = new THREE.MeshBasicMaterial({
            map: textureLoader.load(sunTexture)
        });
        const sun = new THREE.Mesh(sunGeo, sunMat);
        scene.add(sun);


        // planets create
        function createPlanet(size, texture, position, ring) {
            const geo = new THREE.SphereGeometry(size, 30, 30);
            const mat = new THREE.MeshStandardMaterial({
                map: textureLoader.load(texture)
            });
            const mesh = new THREE.Mesh(geo, mat);
            const obj = new THREE.Object3D();
            obj.add(mesh);
            if(ring) {
                const ringGeo = new THREE.RingGeometry(
                    ring.innerRadius,
                    ring.outerRadius,
                    32);
                const ringMat = new THREE.MeshBasicMaterial({
                    map: textureLoader.load(ring.texture),
                    side: THREE.DoubleSide
                });
                const ringMesh = new THREE.Mesh(ringGeo, ringMat);
                obj.add(ringMesh);
                ringMesh.position.x = position;
                ringMesh.rotation.x = -0.5 * Math.PI;
            }
            scene.add(obj);
            mesh.position.x = position;
            return {mesh, obj}
        }

        const mercury = createPlanet(3.2, mercuryTexture, 28);
        const venus = createPlanet(5.8, venusTexture, 44);
        const earth = createPlanet(6, earthTexture, 62);
        const mars = createPlanet(4, marsTexture, 78);
        const jupiter = createPlanet(12, jupiterTexture, 100);
        const saturn = createPlanet(10, saturnTexture, 138, {
            innerRadius: 10,
            outerRadius: 20,
            texture: saturnRingTexture
        });
        const uranus = createPlanet(7, uranusTexture, 176, {
            innerRadius: 7,
            outerRadius: 12,
            texture: uranusRingTexture
        });
        const neptune = createPlanet(7, neptuneTexture, 200);
        const pluto = createPlanet(2.8, plutoTexture, 216);


        // planets properties
        mercury.mesh.material.transparent = true;
        venus.mesh.material.transparent = true;
        earth.mesh.material.transparent = true;
        mars.mesh.material.transparent = true;
        jupiter.mesh.material.transparent = true;
        saturn.mesh.material.transparent = true;
        uranus.mesh.material.transparent = true;
        neptune.mesh.material.transparent = true;
        pluto.mesh.material.transparent = true;


        // detect intersection
        let mousePointer = new THREE.Vector2();
        const raycaster = new THREE.Raycaster();
        function getMouseVector2(event, window){
            let mousePointer = new THREE.Vector2()

            mousePointer.x = (event.clientX / window.innerWidth) * 2 - 1;
            mousePointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

            return mousePointer;
        }
        function checkRayIntersections(mousePointer, camera, raycaster, scene, getFirstValue) {
            raycaster.setFromCamera(mousePointer, camera);

            let intersections = raycaster.intersectObjects(scene.children, true);

            intersections = getFirstValue ? intersections[0] : intersections;

            return intersections;
        }

        document.addEventListener('mousemove', onMouseMove, false);
        function onMouseMove(event) {
            const planets = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];

            mousePointer = getMouseVector2(event, window);

            const getFirstValue = true;

            const intersections = checkRayIntersections(mousePointer, camera, raycaster, scene, getFirstValue);
            if(intersections !== undefined){
                for (const planet of planets) {
                    
                }
                eval('earth').mesh.material.opacity = 0.1;
            }
            // const cardList = getCardObjects(intersections);
            // flipCards(cardList, flippedCardsList);
        }




        function animateDef() {
            //Self-rotation
            sun.rotateY(0.004);
            mercury.mesh.rotateY(0.004);
            venus.mesh.rotateY(0.002);
            earth.mesh.rotateY(0.02);
            mars.mesh.rotateY(0.018);
            jupiter.mesh.rotateY(0.04);
            saturn.mesh.rotateY(0.038);
            uranus.mesh.rotateY(0.03);
            neptune.mesh.rotateY(0.032);
            pluto.mesh.rotateY(0.008);

            //Around-sun-rotation
            mercury.obj.rotateY(0.04);
            venus.obj.rotateY(0.015);
            earth.obj.rotateY(0.01);
            mars.obj.rotateY(0.008);
            jupiter.obj.rotateY(0.002);
            saturn.obj.rotateY(0.0009);
            uranus.obj.rotateY(0.0004);
            neptune.obj.rotateY(0.0001);
            pluto.obj.rotateY(0.00007);

            renderer.render(scene, camera);
        }

        function animateUserControls() {
            //Self-rotation
            sun.rotateY(0.004);
            mercury.mesh.rotateY(0.004);
            venus.mesh.rotateY(0.002);
            earth.mesh.rotateY(0.02);
            mars.mesh.rotateY(0.018);
            jupiter.mesh.rotateY(0.04);
            saturn.mesh.rotateY(0.038);
            uranus.mesh.rotateY(0.03);
            neptune.mesh.rotateY(0.032);
            pluto.mesh.rotateY(0.008);

            renderer.render(scene, camera);
        }



        renderer.setAnimationLoop(animateDef);


        window.addEventListener('resize', function() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });


    }, []);


    return (
        <div ref={refContainer}></div>

    );
}

export default App;
