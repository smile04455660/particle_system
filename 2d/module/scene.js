function simulate(app, delta, elapsed) {
    const { stage } = app;
    const { gravity } = stage;

    // const { waterfall } = stage;
    // waterfall.update(stage.obstacles);
    // waterfall.show();

    // const { smoker } = stage;
    // smoker.update([new Vector(0.05, -0.1)]);
    // smoker.show();

    const { firework } = stage;
    firework.update([gravity]);
    firework.show();
}

function initializeScene(app) {
    const { stage } = app;
    const { width, height } = app.view;

    stage.gravity = new Vector(0, 0.11);

    // Waterfall System
    let waterfall = new Waterfall(app.view, 50, 5000, stage.gravity);
    // stage.addChild(waterfall);
    stage.waterfall = waterfall;

    // Smoker System
    const smoker = new Smoker(
        app.view,
        10,
        2,
        new Vector(width / 2, height / 2),
        { lifespan: 500, life_decay: 5 },
        { init_size: 20, end_size: 10, div_size: 30 }
    );
    // stage.addChild(smoker);
    stage.smoker = smoker;

    // Firework System
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

    // initializeObstacle(width, height, stage);
}

function initializeObstacle(width, height, stage) {
    stage.obstacles = [];

    const objArgs = [
        { x: width / 2, y: height / 3, radius: 20 },
        { x: (width / 3) * 2, y: height / 2, radius: 20 },
        { x: (width / 3) * 1, y: height / 2, radius: 20 },
    ];

    for (const objArg of objArgs) {
        const circleObstacle = generateCircleObstacle(objArg);
        stage.obstacles.push(circleObstacle);
        stage.addChild(circleObstacle);
    }
}
