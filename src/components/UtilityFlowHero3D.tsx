"use client";

import { Canvas } from "@react-three/fiber";
import { Float, Html, OrbitControls } from "@react-three/drei";
import { Suspense } from "react";

type ModuleCard = {
  label: string;
  status: string;
  position: [number, number, number];
  color: string;
};

const moduleCards: ModuleCard[] = [
  {
    label: "Members",
    status: "Customer records",
    position: [-2.8, 1.4, 0],
    color: "#2563eb",
  },
  {
    label: "Work Orders",
    status: "Intake workflow",
    position: [0, 1.7, 0.2],
    color: "#0f766e",
  },
  {
    label: "Dispatch",
    status: "Crew movement",
    position: [2.8, 1.2, 0],
    color: "#7c3aed",
  },
  {
    label: "QA Testing",
    status: "Quality checks",
    position: [-2.4, -0.8, 0.3],
    color: "#ea580c",
  },
  {
    label: "Bug Reports",
    status: "Issue tracking",
    position: [0.3, -1.1, 0],
    color: "#dc2626",
  },
  {
    label: "AI Help",
    status: "Controlled docs",
    position: [2.7, -0.7, 0.4],
    color: "#0891b2",
  },
];

function ConnectionLine({
  start,
  end,
}: {
  start: [number, number, number];
  end: [number, number, number];
}) {
  const mid: [number, number, number] = [
    (start[0] + end[0]) / 2,
    (start[1] + end[1]) / 2,
    (start[2] + end[2]) / 2,
  ];

  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  const length = Math.sqrt(dx * dx + dy * dy);

  const angle = Math.atan2(dy, dx);

  return (
    <mesh position={mid} rotation={[0, 0, angle]}>
      <boxGeometry args={[length, 0.025, 0.025]} />
      <meshStandardMaterial color="#60a5fa" emissive="#2563eb" emissiveIntensity={0.7} />
    </mesh>
  );
}

function FloatingModuleCard({ card }: { card: ModuleCard }) {
  return (
    <Float speed={1.6} rotationIntensity={0.25} floatIntensity={0.45}>
      <group position={card.position}>
        <mesh>
          <boxGeometry args={[1.65, 0.82, 0.12]} />
          <meshStandardMaterial
            color="#0f172a"
            roughness={0.32}
            metalness={0.18}
          />
        </mesh>

        <mesh position={[0, -0.48, 0.02]}>
          <boxGeometry args={[1.35, 0.035, 0.035]} />
          <meshStandardMaterial
            color={card.color}
            emissive={card.color}
            emissiveIntensity={0.9}
          />
        </mesh>

        <Html
          center
          transform
          distanceFactor={6.5}
          position={[0, 0.02, 0.09]}
          style={{ pointerEvents: "none" }}
        >
          <div className="w-44 rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-center shadow-2xl backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-200">
              {card.status}
            </p>
            <p className="mt-1 text-base font-bold text-white">{card.label}</p>
          </div>
        </Html>
      </group>
    </Float>
  );
}

function UtilityFlowScene() {
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 4, 5]} intensity={1.5} />
      <pointLight position={[-4, -2, 4]} intensity={1.2} color="#38bdf8" />

      <group rotation={[-0.08, -0.22, 0]}>
        <ConnectionLine
          start={moduleCards[0].position}
          end={moduleCards[1].position}
        />
        <ConnectionLine
          start={moduleCards[1].position}
          end={moduleCards[2].position}
        />
        <ConnectionLine
          start={moduleCards[1].position}
          end={moduleCards[3].position}
        />
        <ConnectionLine
          start={moduleCards[3].position}
          end={moduleCards[4].position}
        />
        <ConnectionLine
          start={moduleCards[4].position}
          end={moduleCards[5].position}
        />

        {moduleCards.map((card) => (
          <FloatingModuleCard key={card.label} card={card} />
        ))}
      </group>

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.75}
        maxPolarAngle={Math.PI / 1.9}
        minPolarAngle={Math.PI / 3.2}
      />
    </>
  );
}

export default function UtilityFlowHero3D() {
  return (
    <div className="relative h-[420px] w-full overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 shadow-2xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.35),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.22),_transparent_35%)]" />

      <Canvas camera={{ position: [0, 0, 7.5], fov: 45 }}>
        <Suspense fallback={null}>
          <UtilityFlowScene />
        </Suspense>
      </Canvas>

      <div className="pointer-events-none absolute bottom-4 left-4 right-4 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-100">
          Live workflow map
        </p>
        <p className="mt-1 text-sm leading-6 text-white/85">
          Customer records, work orders, dispatch, QA, issues, training, and AI
          support connected in one operational system.
        </p>
      </div>
    </div>
  );
}