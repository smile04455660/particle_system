function simulate(app, delta, elapsed, type) {
    const { stage } = app;
    const { gravity } = stage;

    // Waterfall System
    if (type === 'waterfall') {
        const { waterfall } = stage;
        const radiusSlider = document.getElementById("radius_slider");
        const gravitySlider = document.getElementById("gravity_slider");
        waterfall.update({
            obstacles: stage.obstacles,
            radius: parseFloat(radiusSlider.value),
            gravity: new Vector(0, parseFloat(gravitySlider.value))
        });
        waterfall.show();
    }
    // Firework System
    else if (type === 'firework') {
        const { firework } = stage;
        firework.update([gravity]);
        firework.show();
    }

    // Rocket System
    else if (type === 'rocket') {
        const { smoker } = stage;
        const directionSlider = document.getElementById("direction_slider");
        const dir = parseFloat(directionSlider.value)
        const speedSlider = document.getElementById("speed_slider");
        const speed = parseInt(speedSlider.value)
        smoker.update({
            accelerations: [
                new Vector(
                    -dir,
                    0.01 * speed
                ),
                new Vector(
                    0,
                    0.15,
                )
            ],
            num_particles: speed,
            rotation: dir * 4,
        });
        smoker.show();
    }
}

function initializeScene(app, type, args) {
    const { stage } = app;
    const { width, height } = app.view;

    stage.gravity = new Vector(0, 0.125);

    // Waterfall System
    if (type === 'waterfall') {
        let waterfall = new Waterfall(app.view, 50, 2000, stage.gravity);
        stage.addChild(waterfall);
        stage.waterfall = waterfall;
        initializeObstacle(width, height, stage, args?.random);
    }

    // Firework System
    else if (type === 'firework') {
        const firework = new Firework(
            app.view,
            0.05,
            150,
            13,
            new Vector(width / 2, height),
            3,
            80,
        );
        stage.addChild(firework);
        stage.firework = firework;
    }

    // Rocket System
    else if (type === 'rocket') {
        const smoker = new Smoker(
            app.view,
            10,
            2,
            new Vector(width / 2, height / 2 + 25),
            500,
            { init_size: 20, end_size: 10, div_size: 30 }
        );
        document.addEventListener('keydown', (event) => {
            const key = event.key
            const directionSlider = document.getElementById("direction_slider");
            const speedSlider = document.getElementById("speed_slider");
            if (key === 'a') {
                directionSlider.value = (parseFloat(directionSlider.value) - 0.003).toString();
            }
            if (key === 'd') {
                directionSlider.value = (parseFloat(directionSlider.value) + 0.003).toString();
            }
            if (key === 'w') {
                speedSlider.value = (parseFloat(speedSlider.value) + 0.5).toString();
            }
            if (key === 's') {
                speedSlider.value = (parseFloat(speedSlider.value) - 0.5).toString();
            }
        })
        stage.addChild(smoker);
        stage.smoker = smoker;
    }
}

function initializeObstacle(width, height, stage, random) {
    stage.obstacles = [];

    const objArgs = random ? [] : [
        { x: width / 2, y: height / 3, radius: 20 },
        { x: (width / 3) * 2, y: height / 2, radius: 20 },
        { x: (width / 3) * 1, y: height / 2, radius: 20 },
        { x: (width / 4) * 1, y: 2 * height / 3, radius: 20 },
        { x: (width / 4) * 2, y: 2 * height / 3, radius: 20 },
        { x: (width / 4) * 3, y: 2 * height / 3, radius: 20 },
    ];

    if (random) {
        for (let i = 0; i < 20; i++) {
            const margin = 100
            // const x = Math.min(Math.max(Math.round(Math.random() * width), margin), width - margin)
            const x = randomFromInterval(margin, width - margin)
            // const y = Math.min(Math.max(Math.round(Math.random() * height), margin), height - margin)
            const y = randomFromInterval(margin, height - margin)
            objArgs.push(
                {
                    x, y, radius: Math.max(10, Math.round(Math.random() * 20))
                },
            )
        }
    }

    for (const objArg of objArgs) {
        const circleObstacle = generateCircleObstacle(objArg);
        stage.obstacles.push(circleObstacle);
        stage.addChild(circleObstacle);
    }
}
