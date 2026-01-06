
import React, { useEffect, useRef } from 'react';
import Matter from 'matter-js';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, PHYSICS, SCORE_VALUES } from '../constants';

interface PinballEngineProps {
  isPlaying: boolean;
  onScore: (points: number) => void;
  onBallLost: () => void;
  onGameOver: (score: number) => void;
}

const PinballEngine: React.FC<PinballEngineProps> = ({ isPlaying, onScore, onBallLost }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const ballRef = useRef<Matter.Body | null>(null);
  const leftFlipperRef = useRef<Matter.Body | null>(null);
  const rightFlipperRef = useRef<Matter.Body | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Matter.js components
    const { Engine, Render, Runner, Bodies, Composite, Constraint, Events, Vector } = Matter;

    // Create engine
    const engine = Engine.create();
    engineRef.current = engine;
    engine.gravity.y = PHYSICS.GRAVITY;

    // Create renderer
    const render = Render.create({
      element: containerRef.current,
      engine: engine,
      options: {
        width: GAME_WIDTH,
        height: GAME_HEIGHT,
        wireframes: false,
        background: COLORS.BACKGROUND,
        pixelRatio: window.devicePixelRatio,
      }
    });

    // Create Runner
    const runner = Runner.create();
    Runner.run(runner, engine);
    Render.run(render);

    // --- Boundaries & Static Objects ---
    const wallStyle = { fillStyle: COLORS.WALL, strokeStyle: COLORS.GLOW_BLUE, lineWidth: 2 };

    const topWall = Bodies.rectangle(GAME_WIDTH / 2, 5, GAME_WIDTH, 10, { isStatic: true, render: wallStyle });
    const leftWall = Bodies.rectangle(5, GAME_HEIGHT / 2, 10, GAME_HEIGHT, { isStatic: true, render: wallStyle });
    const rightWall = Bodies.rectangle(GAME_WIDTH - 5, GAME_HEIGHT / 2, 10, GAME_HEIGHT, { isStatic: true, render: wallStyle });
    
    // Plunger lane wall
    const plungerWall = Bodies.rectangle(GAME_WIDTH - 50, GAME_HEIGHT - 150, 10, 300, { isStatic: true, render: wallStyle });

    // Table Slopes
    const leftSlope = Bodies.trapezoid(80, GAME_HEIGHT - 120, 150, 40, -0.4, { isStatic: true, angle: Math.PI / 10, render: wallStyle });
    const rightSlope = Bodies.trapezoid(GAME_WIDTH - 120, GAME_HEIGHT - 120, 150, 40, -0.4, { isStatic: true, angle: -Math.PI / 10, render: wallStyle });

    // --- Bumpers ---
    const bumperOptions = {
      isStatic: true,
      label: 'bumper',
      restitution: 1.5,
      render: { fillStyle: COLORS.BUMPER, strokeStyle: '#fff', lineWidth: 4 }
    };
    const bumpers = [
      Bodies.circle(GAME_WIDTH / 2 - 60, 200, 25, bumperOptions),
      Bodies.circle(GAME_WIDTH / 2 + 60, 200, 25, bumperOptions),
      Bodies.circle(GAME_WIDTH / 2, 280, 25, bumperOptions),
    ];

    // --- Targets ---
    const targets = [
        Bodies.rectangle(40, 400, 30, 10, { isStatic: true, label: 'target', angle: Math.PI/4, render: { fillStyle: '#ff0' } }),
        Bodies.rectangle(GAME_WIDTH - 80, 400, 30, 10, { isStatic: true, label: 'target', angle: -Math.PI/4, render: { fillStyle: '#ff0' } }),
    ];

    // --- Flippers ---
    const createFlipper = (x: number, y: number, isRight: boolean) => {
      const flipperWidth = 80;
      const flipperHeight = 15;
      const pivotX = isRight ? x + flipperWidth / 2 : x - flipperWidth / 2;
      
      const group = Matter.Body.nextGroup(true);
      
      const flipper = Bodies.rectangle(x, y, flipperWidth, flipperHeight, {
        label: 'flipper',
        collisionFilter: { group: group },
        chamfer: { radius: 7 },
        render: { fillStyle: COLORS.FLIPPER }
      });

      const pivot = Constraint.create({
        bodyB: flipper,
        pointB: { x: isRight ? flipperWidth / 2 : -flipperWidth / 2, y: 0 },
        pointA: { x: pivotX, y: y },
        stiffness: 1,
        length: 0,
        render: { visible: false }
      });

      // Stop constraints to limit rotation
      const stop = Constraint.create({
        bodyB: flipper,
        pointB: { x: isRight ? -flipperWidth / 2 : flipperWidth / 2, y: 0 },
        pointA: { x: isRight ? pivotX - 60 : pivotX + 60, y: y - 20 },
        stiffness: 0.1,
        length: 40,
        render: { visible: false }
      });

      return { flipper, pivot, stop };
    };

    const left = createFlipper(130, GAME_HEIGHT - 100, false);
    const right = createFlipper(GAME_WIDTH - 170, GAME_HEIGHT - 100, true);
    
    leftFlipperRef.current = left.flipper;
    rightFlipperRef.current = right.flipper;

    // --- Ball Creation ---
    const createBall = () => {
      const ball = Bodies.circle(GAME_WIDTH - 25, GAME_HEIGHT - 30, PHYSICS.BALL_RADIUS, {
        label: 'ball',
        restitution: PHYSICS.RESTITUTION,
        friction: PHYSICS.FRICTION,
        render: { fillStyle: COLORS.BALL, strokeStyle: COLORS.GLOW_BLUE, lineWidth: 2 }
      });
      ballRef.current = ball;
      Composite.add(engine.world, ball);
    };

    // Add everything to world
    Composite.add(engine.world, [
      topWall, leftWall, rightWall, plungerWall,
      leftSlope, rightSlope,
      ...bumpers, ...targets,
      left.flipper, left.pivot, left.stop,
      right.flipper, right.pivot, right.stop
    ]);

    // --- Collision Events ---
    Events.on(engine, 'collisionStart', (event) => {
      event.pairs.forEach((pair) => {
        if (pair.bodyA.label === 'bumper' || pair.bodyB.label === 'bumper') {
          onScore(SCORE_VALUES.BUMPER);
          // Visual feedback - flash bumper
          const b = pair.bodyA.label === 'bumper' ? pair.bodyA : pair.bodyB;
          b.render.fillStyle = '#fff';
          setTimeout(() => { b.render.fillStyle = COLORS.BUMPER; }, 100);
        }
        if (pair.bodyA.label === 'target' || pair.bodyB.label === 'target') {
            onScore(SCORE_VALUES.TARGET);
        }
      });
    });

    // --- Game Loop Logic ---
    Events.on(engine, 'beforeUpdate', () => {
      if (!ballRef.current) return;

      // Check if ball out of bounds
      if (ballRef.current.position.y > GAME_HEIGHT + 50) {
        Composite.remove(engine.world, ballRef.current);
        ballRef.current = null;
        onBallLost();
      }

      // Restoring flipper position (fake spring tension)
      if (leftFlipperRef.current) {
        Matter.Body.setAngle(leftFlipperRef.current, Math.max(-0.5, Math.min(0.5, leftFlipperRef.current.angle + 0.1)));
      }
      if (rightFlipperRef.current) {
        Matter.Body.setAngle(rightFlipperRef.current, Math.max(-0.5, Math.min(0.5, rightFlipperRef.current.angle - 0.1)));
      }
    });

    // --- Input Handling ---
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;

      if (e.code === 'KeyZ' && leftFlipperRef.current) {
        Matter.Body.applyForce(leftFlipperRef.current, leftFlipperRef.current.position, { x: 0, y: -PHYSICS.FLIPPER_STRENGTH });
      }
      if (e.code === 'KeyM' && rightFlipperRef.current) {
        Matter.Body.applyForce(rightFlipperRef.current, rightFlipperRef.current.position, { x: 0, y: -PHYSICS.FLIPPER_STRENGTH });
      }
      if (e.code === 'Space' && !ballRef.current) {
        createBall();
        setTimeout(() => {
          if (ballRef.current) {
            Matter.Body.applyForce(ballRef.current, ballRef.current.position, { x: 0, y: -0.05 });
          }
        }, 10);
      } else if (e.code === 'Space' && ballRef.current && ballRef.current.position.x > GAME_WIDTH - 50) {
        Matter.Body.applyForce(ballRef.current, ballRef.current.position, { x: 0, y: -0.06 });
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Initial ball spawn
    if (isPlaying) createBall();

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      Render.stop(render);
      Runner.stop(runner);
      Engine.clear(engine);
      render.canvas.remove();
      render.textures = {};
    };
  }, [isPlaying]);

  return (
    <div className="relative cursor-none">
      <div ref={containerRef} />
      {/* Overlay effects (Scanlines) */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
    </div>
  );
};

export default PinballEngine;
