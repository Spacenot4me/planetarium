import './App.css';
import planet1 from "./images/planet1.png"
import planet2 from "./images/planet2.png"
import planet3 from "./images/planet3.png"
import {useEffect, useRef} from "react";
import * as THREE from "three";
import {Mesh} from "three";
import {OrbitControls} from "three/addons";

function App() {
    const refContainer = useRef(null);
    useEffect(() => {
        //scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color('skyblue');

        //camera
        const fov = 35;
        const aspect = window.innerWidth / window.innerHeight;
        const near = 0.1;
        const far = 100;
        const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        camera.position.set(0,0,10);


        //mesh
        const geometry = new THREE.SphereGeometry(2);
        const material = new THREE.MeshBasicMaterial();
        const sphere = new Mesh(geometry, material);

        scene.add(sphere);

        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);

        refContainer.current.append(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement)

        controls.update();
        renderer.render(scene, camera);

    }, []);


    return (
        <div ref={refContainer}></div>

    );
}

export default App;
