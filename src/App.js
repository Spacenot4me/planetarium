import './App.css';
import {useEffect, useRef, useState} from "react";
import * as THREE from "three";
import {gsap} from 'gsap';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
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
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import {Object3D} from "three";
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';

function App() {
    const [planetTitle, setPlanetTitle] = useState('');

    const refContainer = useRef(null);
    useEffect(() => {
        //params
        const WIDTH = 1800; // window.innerWidth
        const HEIGHT = 920; // window.innerHeight
        const params = {
            threshold: 0,
            strength: 0.4,
            radius: 0.3,
            exposure: 1,
            x: 0,
            y: 110,
            z: 305,
            rotX: -Math.PI/6,
            rotY: 0,
            rotZ: Math.PI/30
        };



        // renderer
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(WIDTH, HEIGHT);
        refContainer.current.appendChild(renderer.domElement);


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
            WIDTH / HEIGHT,
            0.1,
            1500
        );
        camera.position.set(params.x, params.y, params.z);
        camera.layers.enable(1);

        const gui = new GUI();
        gui.add(camera.position, 'x', -500,500).step(5);
        gui.add(camera.position, 'y', -500,500).step(5);
        gui.add(camera.position, 'z', -5000,5000).step(5);
        gui.add(camera.rotation, 'x', -Math.PI,Math.PI).step(Math.PI/360);
        gui.add(camera.rotation, 'y', -Math.PI,Math.PI).step(Math.PI/360);
        gui.add(camera.rotation, 'z', -Math.PI,Math.PI).step(Math.PI/360);


        function defaultCameraPosition(){

            gsap.to(camera.rotation, {
                x: -Math.PI/6,
                z: Math.PI/30,
                y: 0,
                duration: 1
            })

            gsap.to(camera.position, {
                x: 0,
                z: 110,
                y: 305,
                duration: 1
            })

            console.log(camera)

        }
        defaultCameraPosition();



        //orbit controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.minPolarAngle = Math.PI * 0;
        controls.maxPolarAngle = Math.PI * 0.35;
        controls.maxDistance = 400;
        controls.addEventListener('start', () => {
            renderer.setAnimationLoop(animateUserControls);
        });
        controls.addEventListener('end', () => {
            renderer.setAnimationLoop(animateDef);
            defaultCameraPosition();

        });
        controls.target = new THREE.Vector3(0,-70,0);


        //light
        const ambientLight = new THREE.AmbientLight(0x333333);
        scene.add(ambientLight);
        const pointLight = new THREE.PointLight(0xFFFFFF, 2000, 300);
        scene.add(pointLight);


        // sun mesh
        const textureLoader = new THREE.TextureLoader();
        const sunGeo = new THREE.SphereGeometry(16, 30, 30);
        const sunMat = new THREE.MeshBasicMaterial({
            map: textureLoader.load(sunTexture)
        });
        const sun = new THREE.Mesh(sunGeo, sunMat);
        sun.name = 'sun';
        sun.layers.set(1);
        scene.add(sun);

        ////////////
        // CUSTOM //
        ////////////



        const BLOOM_SCENE = 1;

        const bloomLayer = new THREE.Layers();
        bloomLayer.set( BLOOM_SCENE );



        const darkMaterial = new THREE.MeshBasicMaterial( { color: 'black' } );
        const materials = {};

        const renderScene = new RenderPass( scene, camera );

        const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
        bloomPass.threshold = params.threshold;
        bloomPass.strength = params.strength;
        bloomPass.radius = params.radius;

        const bloomComposer = new EffectComposer( renderer );
        bloomComposer.renderToScreen = false;
        bloomComposer.addPass( renderScene );
        bloomComposer.addPass( bloomPass );

        const mixPass = new ShaderPass(
            new THREE.ShaderMaterial( {
                uniforms: {
                    baseTexture: { value: null },
                    bloomTexture: { value: bloomComposer.renderTarget2.texture }
                },
                vertexShader: document.getElementById( 'vertexshader' ).textContent,
                fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
                defines: {}
            } ), 'baseTexture'
        );
        mixPass.needsSwap = true;

        const outputPass = new OutputPass();

        const finalComposer = new EffectComposer( renderer );
        finalComposer.addPass( renderScene );
        finalComposer.addPass( mixPass );
        finalComposer.addPass( outputPass );



        const bloomFolder = gui.addFolder( 'bloom' );

        bloomFolder.add( params, 'threshold', 0.0, 1.0 ).onChange( function ( value ) {

            bloomPass.threshold = Number( value );
            render();

        } );

        bloomFolder.add( params, 'strength', 0.0, 3 ).onChange( function ( value ) {

            bloomPass.strength = Number( value );
            render();

        } );

        bloomFolder.add( params, 'radius', 0.0, 1.0 ).step( 0.01 ).onChange( function ( value ) {

            bloomPass.radius = Number( value );
            render();

        } );



        function render() {
            scene.traverse( darkenNonBloomed );
            bloomComposer.render();
            scene.traverse( restoreMaterial );
            // render the entire scene, then render bloom scene on top
            finalComposer.render();
        }

        function darkenNonBloomed( obj ) {
            if ( obj.isMesh && bloomLayer.test( obj.layers ) === false ) {
                materials[ obj.uuid ] = obj.material;
                obj.material = darkMaterial;
            }
        }

        function restoreMaterial( obj ) {
            if ( materials[ obj.uuid ] ) {
                obj.material = materials[ obj.uuid ];
                delete materials[ obj.uuid ];
            }
        }




        // planets create
        function createPlanet(name, size, texture, position, ring) {
            const geo = new THREE.SphereGeometry(size, 30, 30);
            const mat = new THREE.MeshStandardMaterial({
                map: textureLoader.load(texture)
            });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.name = name;

            const orbitGeo = new THREE.TorusGeometry( position, 0.1, 16, 100 );
            const orbitMat = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
            const orbit = new THREE.Mesh( orbitGeo, orbitMat );
            orbit.rotateX(Math.PI / 2)

            const obj = new THREE.Object3D();
            obj.name = name;
            obj.add(mesh);
            obj.add(orbit);

            if (ring) {
                const ringGeo = new THREE.RingGeometry(
                    ring.innerRadius,
                    ring.outerRadius,
                    32);
                const ringMat = new THREE.MeshBasicMaterial({
                    map: textureLoader.load(ring.texture),
                    side: THREE.DoubleSide
                });
                const ringMesh = new THREE.Mesh(ringGeo, ringMat);
                ringMesh.name = name;
                obj.add(ringMesh);
                ringMesh.position.x = position;
                ringMesh.rotation.x = -0.5 * Math.PI;
            }
            scene.add(obj);
            obj.children.map(child => child.material.transparent = true)
            mesh.position.x = position;
            return {mesh, obj}
        }

        const mercury = createPlanet('mercury', 3.2, mercuryTexture, 28);
        const venus = createPlanet('venus', 5.8, venusTexture, 44);
        const earth = createPlanet('earth', 6, earthTexture, 62);
        const mars = createPlanet('mars', 4, marsTexture, 78);
        const jupiter = createPlanet('jupiter', 12, jupiterTexture, 100);
        const saturn = createPlanet('saturn', 10, saturnTexture, 138, {
            innerRadius: 10,
            outerRadius: 20,
            texture: saturnRingTexture
        });
        const uranus = createPlanet('uranus', 7, uranusTexture, 176, {
            innerRadius: 7,
            outerRadius: 12,
            texture: uranusRingTexture
        });
        const neptune = createPlanet('neptune', 7, neptuneTexture, 200);
        const pluto = createPlanet('pluto', 2.8, plutoTexture, 216);


        // planets orbits
        // const geometry = new THREE.TorusGeometry( 80, 0.1, 16, 100 );
        // const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
        // const torus = new THREE.Mesh( geometry, material );
        // torus.rotateX(Math.PI / 2)
        // scene.add( torus );




        // detect intersection
        let mousePointer = new THREE.Vector2();
        const raycaster = new THREE.Raycaster();

        function getMouseVector2(event, window) {
            let mousePointer = new THREE.Vector2()

            let rect = renderer.domElement.getBoundingClientRect();
            mousePointer.x = ( ( event.clientX - rect.left ) / ( rect.width - rect.left ) ) * 2 - 1;
            mousePointer.y = - ( ( event.clientY - rect.top ) / ( rect.bottom - rect.top) ) * 2 + 1;

            // mousePointer.x = (event.clientX / WIDTH) * 2 - 1;
            // mousePointer.y = -(event.clientY / HEIGHT) * 2 + 1;

            return mousePointer;
        }

        function checkRayIntersections(mousePointer, camera, raycaster, scene, getFirstValue) {
            raycaster.setFromCamera(mousePointer, camera);

            let intersections = raycaster.intersectObjects(scene.children, true);

            intersections = getFirstValue ? intersections[0] : intersections;

            return intersections;
        }

        document.addEventListener('mousemove', onMouseMove, false);
        document.addEventListener('mousedown', onMouseDown, false);

        function onMouseMove(event) {
            const planets = [];
            for (const planet of scene.children) {
                if (planet.type === 'Object3D') {
                    planets.push(planet.name);
                }
            }

            mousePointer = getMouseVector2(event, window);

            const getFirstValue = true;

            const intersections = checkRayIntersections(mousePointer, camera, raycaster, scene, getFirstValue);

            if (intersections !== undefined) {
                setPlanetTitle(intersections.object.name.toUpperCase())
                for (const planet of planets) {
                    if (planet === intersections.object.name) {
                        eval(planet).obj.children.map(child => child.material.opacity = 1);
                        continue;
                    }
                    eval(planet).obj.children.map(child => child.material.opacity = 0.1);
                }
            } else {
                setPlanetTitle('')
                for (const planet of planets) {
                    eval(planet).obj.children.map(child => child.material.opacity = 1);
                }
            }
        }

        function onMouseDown(event) {
            const planets = [];
            for (const planet of scene.children) {
                if (planet.type === 'Object3D') {
                    planets.push(planet.name);
                }
            }

            mousePointer = getMouseVector2(event, window);

            const getFirstValue = true;

            const intersections = checkRayIntersections(mousePointer, camera, raycaster, scene, getFirstValue);

            if (intersections !== undefined) {
                console.log(intersections.object.name)
            } else {

            }
        }


        function animateDef() {
            //Self-rotation
            let speed = 10;
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
            mercury.obj.rotateY(0.04 / speed);
            venus.obj.rotateY(0.015 / speed);
            earth.obj.rotateY(0.01 / speed);
            mars.obj.rotateY(0.008 / speed);
            jupiter.obj.rotateY(0.002 / speed);
            saturn.obj.rotateY(0.0009 / speed);
            uranus.obj.rotateY(0.0004 / speed);
            neptune.obj.rotateY(0.0001 / speed);
            pluto.obj.rotateY(0.00007 / speed);

            render();
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

            render();
        }

        renderer.setAnimationLoop(animateDef);


        window.addEventListener('resize', function () {
            const width = WIDTH;
            const height = HEIGHT;

            camera.aspect = width / height;
            camera.updateProjectionMatrix();

            renderer.setSize(width, height);

            renderer.render(scene, camera);
        });


    }, []);


    return (
        // <div style={{
        //     minHeight: '100vh',
        //     display: "flex",
        //     justifyContent: "center",
        //     alignItems: "center",
        //     flexDirection: "column"
        // }}>
        //     <h1 >SkyWalker</h1>
        //     <hr style={{marginBottom: '15px'}}/>
        //
        //     <hr style={{marginTop: '15px'}}/>
        // </div>
        <div ref={refContainer}></div>

    );
}

export default App;
