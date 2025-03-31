let scene, camera, renderer, jugador, enemigos = [];
let balas = [];
let puntaje = 0;
let vida = 100;

function init() {
    // Configurar escena
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Luz
    const luz = new THREE.DirectionalLight(0xffffff, 1);
    luz.position.set(0, 1, 1);
    scene.add(luz);
    scene.add(new THREE.AmbientLight(0x404040));

    // Suelo
    const geometriaSuelo = new THREE.PlaneGeometry(100, 100);
    const materialSuelo = new THREE.MeshPhongMaterial({ color: 0x666666 });
    const suelo = new THREE.Mesh(geometriaSuelo, materialSuelo);
    suelo.rotation.x = -Math.PI / 2;
    suelo.position.y = -2;
    scene.add(suelo);

    // Jugador
    const geometriaJugador = new THREE.BoxGeometry(1, 2, 1);
    const materialJugador = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    jugador = new THREE.Mesh(geometriaJugador, materialJugador);
    jugador.position.z = 5;
    scene.add(jugador);

    // Posición de la cámara
    camera.position.y = 3;
    camera.position.z = 10;
    camera.lookAt(jugador.position);

    // Eventos de teclado
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    // Crear carretera apocalíptica
    function crearCarretera() {
        // Carretera principal
        const texturaAsfalto = new THREE.TextureLoader().load('https://threejs.org/examples/textures/terrain/grasslight-big.jpg');
        texturaAsfalto.wrapS = texturaAsfalto.wrapT = THREE.RepeatWrapping;
        texturaAsfalto.repeat.set(5, 50);
        texturaAsfalto.encoding = THREE.sRGBEncoding;

        const geometriaCarretera = new THREE.PlaneGeometry(20, 200);
        const materialCarretera = new THREE.MeshPhongMaterial({
            map: texturaAsfalto,
            color: 0x333333,
            displacementScale: 0.1
        });
        const carretera = new THREE.Mesh(geometriaCarretera, materialCarretera);
        carretera.rotation.x = -Math.PI / 2;
        carretera.position.y = -0.5;
        scene.add(carretera);

        // Líneas de la carretera
        const geometriaLinea = new THREE.PlaneGeometry(0.3, 200);
        const materialLinea = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        const lineaCentral = new THREE.Mesh(geometriaLinea, materialLinea);
        lineaCentral.rotation.x = -Math.PI / 2;
        lineaCentral.position.y = -0.48;
        scene.add(lineaCentral);

        // Añadir escombros y obstáculos
        for(let i = 0; i < 50; i++) {
            // Autos destruidos
            const geometriaAuto = new THREE.BoxGeometry(2, 1.5, 4);
            const materialAuto = new THREE.MeshPhongMaterial({ 
                color: Math.random() > 0.5 ? 0x444444 : 0x222222,
                roughness: 0.8
            });
            const auto = new THREE.Mesh(geometriaAuto, materialAuto);
            auto.position.x = Math.random() * 30 - 15;
            auto.position.z = Math.random() * 200 - 100;
            auto.rotation.y = Math.random() * Math.PI;
            scene.add(auto);

            // Fuego en algunos autos
            if(Math.random() > 0.7) {
                const fuego = crearFuego();
                fuego.position.copy(auto.position);
                fuego.position.y += 1;
                scene.add(fuego);
            }
        }

        // Edificios destruidos a los lados
        for(let i = 0; i < 30; i++) {
            const altura = Math.random() * 10 + 5;
            const geometriaEdificio = new THREE.BoxGeometry(
                Math.random() * 5 + 3,
                altura,
                Math.random() * 5 + 3
            );
            const materialEdificio = new THREE.MeshPhongMaterial({
                color: 0x666666,
                roughness: 1
            });
            const edificio = new THREE.Mesh(geometriaEdificio, materialEdificio);
            edificio.position.x = Math.random() > 0.5 ? 
                Math.random() * 20 + 15 : 
                Math.random() * -20 - 15;
            edificio.position.z = Math.random() * 200 - 100;
            edificio.position.y = altura/2 - 0.5;
            scene.add(edificio);

            // Añadir daños a los edificios
            const geometriaDaño = new THREE.SphereGeometry(Math.random() * 2);
            const dano = new THREE.Mesh(geometriaDaño, materialEdificio);
            dano.position.copy(edificio.position);
            dano.position.y += Math.random() * altura - altura/2;
            scene.add(dano);
        }
    }

    function crearFuego() {
        const geometriaFuego = new THREE.ConeGeometry(0.5, 2, 8);
        const materialFuego = new THREE.MeshPhongMaterial({
            color: 0xff4500,
            emissive: 0xff0000,
            transparent: true,
            opacity: 0.7
        });
        const fuego = new THREE.Group();

        for(let i = 0; i < 5; i++) {
            const llama = new THREE.Mesh(geometriaFuego, materialFuego);
            llama.position.x = Math.random() * 0.4 - 0.2;
            llama.position.z = Math.random() * 0.4 - 0.2;
            llama.scale.setScalar(Math.random() * 0.5 + 0.5);
            fuego.add(llama);
        }

        return fuego;
    }

    // Crear niebla
    scene.fog = new THREE.FogExp2(0x666666, 0.01);

    // Cielo apocalíptico
    const geometriaCielo = new THREE.SphereGeometry(100, 32, 32);
    const materialCielo = new THREE.MeshBasicMaterial({
        color: 0x990000,
        side: THREE.BackSide
    });
    const cielo = new THREE.Mesh(geometriaCielo, materialCielo);
    scene.add(cielo);

    // Luces ambientales rojizas
    const luzAmbiente = new THREE.AmbientLight(0x330000);
    scene.add(luzAmbiente);

    // Luz direccional principal
    const luzSol = new THREE.DirectionalLight(0xff5500, 0.5);
    luzSol.position.set(50, 100, 0);
    scene.add(luzSol);

    // Partículas de ceniza
    const geometriaParticulas = new THREE.BufferGeometry();
    const particulas = [];
    for(let i = 0; i < 1000; i++) {
        particulas.push(
            Math.random() * 100 - 50,
            Math.random() * 50,
            Math.random() * 100 - 50
        );
    }
    geometriaParticulas.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(particulas, 3)
    );
    const materialParticulas = new THREE.PointsMaterial({
        color: 0x666666,
        size: 0.1
    });
    const sistemaCenizas = new THREE.Points(geometriaParticulas, materialParticulas);
    scene.add(sistemaCenizas);

    crearCarretera();
}

let teclas = {
    izquierda: false,
    derecha: false,
    arriba: false,
    abajo: false,
    disparo: false
};

function onKeyDown(event) {
    switch(event.key) {
        case 'ArrowLeft':
            teclas.izquierda = true;
            break;
        case 'ArrowRight':
            teclas.derecha = true;
            break;
        case 'ArrowUp':
            teclas.arriba = true;
            break;
        case 'ArrowDown':
            teclas.abajo = true;
            break;
        case ' ':
            disparar();
            break;
    }
}

function onKeyUp(event) {
    switch(event.key) {
        case 'ArrowLeft':
            teclas.izquierda = false;
            break;
        case 'ArrowRight':
            teclas.derecha = false;
            break;
        case 'ArrowUp':
            teclas.arriba = false;
            break;
        case 'ArrowDown':
            teclas.abajo = false;
            break;
    }
}

function disparar() {
    const geometriaBala = new THREE.SphereGeometry(0.1);
    const materialBala = new THREE.MeshPhongMaterial({ color: 0xff0000 });
    const bala = new THREE.Mesh(geometriaBala, materialBala);
    bala.position.copy(jugador.position);
    bala.position.y += 0.5;
    bala.velocidad = new THREE.Vector3(0, 0, -0.5);
    balas.push(bala);
    scene.add(bala);
}

function crearEnemigo() {
    const geometriaEnemigo = new THREE.BoxGeometry(1, 1, 1);
    const materialEnemigo = new THREE.MeshPhongMaterial({ color: 0xff0000 });
    const enemigo = new THREE.Mesh(geometriaEnemigo, materialEnemigo);
    enemigo.position.x = Math.random() * 10 - 5;
    enemigo.position.z = -20;
    enemigos.push(enemigo);
    scene.add(enemigo);
}

function actualizarJuego() {
    // Mover jugador
    if (teclas.izquierda) jugador.position.x -= 0.1;
    if (teclas.derecha) jugador.position.x += 0.1;
    if (teclas.arriba) jugador.position.z -= 0.1;
    if (teclas.abajo) jugador.position.z += 0.1;

    // Límites del jugador
    jugador.position.x = Math.max(-5, Math.min(5, jugador.position.x));
    jugador.position.z = Math.max(-10, Math.min(10, jugador.position.z));

    // Actualizar balas
    for (let i = balas.length - 1; i >= 0; i--) {
        balas[i].position.add(balas[i].velocidad);
        if (balas[i].position.z < -30) {
            scene.remove(balas[i]);
            balas.splice(i, 1);
        }
    }

    // Actualizar enemigos
    if (Math.random() < 0.02) crearEnemigo();
    
    for (let i = enemigos.length - 1; i >= 0; i--) {
        enemigos[i].position.z += 0.1;
        
        // Verificar colisiones con balas
        for (let j = balas.length - 1; j >= 0; j--) {
            if (enemigos[i].position.distanceTo(balas[j].position) < 1) {
                scene.remove(enemigos[i]);
                scene.remove(balas[j]);
                enemigos.splice(i, 1);
                balas.splice(j, 1);
                puntaje += 10;
                break;
            }
        }

        // Verificar si el enemigo pasó al jugador
        if (enemigos[i] && enemigos[i].position.z > 10) {
            scene.remove(enemigos[i]);
            enemigos.splice(i, 1);
            vida -= 10;
        }
    }

    // Verificar fin del juego
    if (vida <= 0) {
        alert('¡Juego Terminado! Puntaje: ' + puntaje);
        location.reload();
    }

    // Actualizar HUD
    document.querySelector('#hud')?.remove();
    const hud = document.createElement('div');
    hud.id = 'hud';
    hud.style.position = 'absolute';
    hud.style.top = '10px';
    hud.style.left = '10px';
    hud.style.color = 'white';
    hud.innerHTML = `Puntaje: ${puntaje}<br>Vida: ${vida}`;
    document.body.appendChild(hud);
}

function animate() {
    requestAnimationFrame(animate);

    // Efecto de fuego
    scene.children.forEach(objeto => {
        if(objeto.type === 'Group') { // Grupos de fuego
            objeto.children.forEach(llama => {
                llama.scale.y = 1 + Math.sin(Date.now() * 0.01) * 0.2;
                llama.material.opacity = 0.5 + Math.sin(Date.now() * 0.005) * 0.2;
            });
        }
    });

    // Mover partículas de ceniza
    scene.children.forEach(objeto => {
        if(objeto.type === 'Points') {
            objeto.rotation.y += 0.0001;
            objeto.position.y = Math.sin(Date.now() * 0.001) * 0.1;
        }
    });

    actualizarJuego();
    renderer.render(scene, camera);
}

init();
animate();

// Ajustar tamaño de ventana
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});