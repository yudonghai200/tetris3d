var THREE = require('three');
var OribitControl = require('./lib/controls/OrbitControls');
var Stats = require('./lib/libs/stats.min');
var Decetcor = require('./lib/Detector');
var datGui = require('./lib/libs/dat.gui.min');

import {Control} from './controls/control';  

if (!Decetcor.webgl) Decetcor.addGetWebGLMessage();

var renderer, scene, camera;
var control, stats;

var depthMaterial, effectComposer, depthRenderTarget, ssaoPass;

var params = {

    aoClamp: 0.1,
    lumInfluence: 0.1,
}

init();
function init(){

    //init renderer
    var div = document.createElement('div');
    document.body.appendChild(div);
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setClearColor(0xc0c0c0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.BasicShadowMap;
    renderer.setPixelRatio(window.devicePixelRatio);
    div.appendChild(renderer.domElement);

    stats = new Stats();
    div.appendChild(stats.domElement);

    

    //init camera
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 5000 );
    camera.bott
    camera.up.set(0, 0, 1);
    camera.position.set(1000, 1000, 1000);
    camera.lookAt(new THREE.Vector3);

    // control = new THREE.OrbitControls(camera, renderer.domElement);
    control = new Control(camera, renderer.domElement, new THREE.Vector3);
    // control.addEventListener('change', function(){

    //     console.log('change');
    // });
    //init scene
    scene = new THREE.Scene();
    var cubeGeometry = new THREE.CubeGeometry(50, 50, 50);
    var cubeMaterial = new THREE.MeshPhongMaterial({color: 0xffffff, emissive: 0x222222, shininess: 150, shading: THREE.SmoothShading});
    
    var xmin = -225, ymin = -225;
    for (var i = 0; i < 20; ++i){
        var x = (i % 10) * 50 + xmin;
        //var y = Math.floor(i / 10)*50 + ymin;
        var z = i * 50;
        var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cube.position.set(0, 0, z);
        cube.receiveShadow = true;
        cube.castShadow = true;
        var cubeWire = new THREE.BoxHelper(cube, 0x000000);
        scene.add(cubeWire);
        scene.add(cube);
    }

    
    window.addEventListener('resize', resize, false);

    initPlan();
    initLines();
    // initProcessing();
    // initGui();
    initLights();
    resize();
    animate();
}

function initLights(){

    //init light
    var dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.name = 'Dir. Light';
    dirLight.position.set( 0, 0, 1200 );
    // dirLight.lookAt(new THREE.Vector3);
    dirLight.castShadow = true;
    dirLight.shadow.camera.near = 1;
    dirLight.shadow.camera.far = 2000;
    dirLight.shadow.camera.right = 250;
    dirLight.shadow.camera.left = -250;
    dirLight.shadow.camera.top	= 250;
    dirLight.shadow.camera.bottom = -250;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;

    var pointLight0 = new THREE.PointLight(0xffffff, 0.3);
    pointLight0.position.set(0, -1000, 0);
    var pointLight1 = new THREE.PointLight(0xffffff, 0.3);
    pointLight1.position.set(0, 1000, 0);
    var pointLight2 = new THREE.PointLight(0xffffff, 0.3);
    pointLight2.position.set(1000, 0, 0);
    var pointLight3 = new THREE.PointLight(0xffffff, 0.3);
    pointLight3.position.set(-1000, 0, 0);
    var pointLight4 = new THREE.PointLight(0xffffff, 0.3);
    pointLight4.position.set(0, 0, -1000);

    scene.add(dirLight);
    scene.add(pointLight0);
    scene.add(pointLight1);
    scene.add(pointLight2);
    scene.add(pointLight3);
    scene.add(pointLight4);
}

function initPlan(){

    var plan = new THREE.PlaneGeometry(1000, 1000);
    var planM = new THREE.Mesh(plan, new THREE.MeshPhongMaterial({color: 0x303030, shading: THREE.SmoothShading, specular: 0xc0c0c0}));
    planM.position.set(0, 0, -100);
    planM.receiveShadow = true;
    planM.castShadow = false;
    scene.add(planM);
}

function initLines(){

    var xmin = -250, xmax = 250, ymin = -250, ymax = 250, zmin = -25, zmax = 475;

    var z = -25;

    // x line
    for (var i = 0; i < 11; ++i){
        var x = xmin + i * 50;
        var line = new THREE.Geometry;
        line.vertices.push(
            new THREE.Vector3(x, ymin, z),
            new THREE.Vector3(x, ymax, z)
        );

        var lineM = new THREE.Line(line, new THREE.LineBasicMaterial({color: 0x00ff00}));

        scene.add(lineM);
    }

    //y line
    for (var i = 0; i < 11; ++i){
        var y = ymin + i * 50;
        var line = new THREE.Geometry;
        line.vertices.push(
            new THREE.Vector3(xmin, y, z),
            new THREE.Vector3(xmax, y, z)
        );

        var lineM = new THREE.Line(line, new THREE.LineBasicMaterial({color: 0x00ff00}));

        scene.add(lineM);
    }
    
}

function initGui(){

    var gui = new datGui.GUI();
    gui.add(params, 'aoClamp', 0, 2.0).onChange(function(value){

        ssaoPass.uniforms['aoClamp'].value = value;
    });
    gui.add(params, 'lumInfluence', 0, 2.0).onChange(function(value){

        ssaoPass.uniforms['lumInfluence'].value = value;
    });
}

function resize(){

    var width = window.innerWidth;
    var height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize( width, height );
}

function animate(){

    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    // control.update();
    stats.update();
}

