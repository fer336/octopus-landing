import { AbsoluteFill, useCurrentFrame, interpolate, Sequence, spring, staticFile, Easing, useVideoConfig } from "remotion";
import { Video } from "@remotion/media";

// ── Steps timeline ──────────────────────────────────────────────
// Edit these: add/remove steps, adjust timestamps as you create more clips
interface Step {
  /** Start time in seconds */
  startSec: number;
  /** End time in seconds */
  endSec: number;
  /** Short bold title (shown on the badge) */
  title: string;
  /** Longer subtitle */
  subtitle: string;
}

const STEPS: Step[] = [
  { startSec: 0, endSec: 4, title: "Seleccionar productos", subtitle: "Usá ENTER para agregar múltiples items" },
  { startSec: 4, endSec: 7, title: "Carrito de importación", subtitle: "Editá cantidades y descuentos individuales" },
  { startSec: 7, endSec: 9, title: "Elegir cliente", subtitle: "Seleccioná de tu lista de clientes" },
];

// ── Main composition ────────────────────────────────────────────
export const CotizacionesDemo: React.FC = () => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill>
      {/* ── Raw screen recording ── */}
      <Video
        src={staticFile("video-cotizaciones.mp4")}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          background: "#07090f",
        }}
      />

      {/* ── Top gradient — improves overlay readability ── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 110,
          background: "linear-gradient(to bottom, rgba(5,7,10,0.65) 0%, transparent 100%)",
          pointerEvents: "none",
        }}
      />

      {/* ── Bottom gradient ── */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 80,
          background: "linear-gradient(to top, rgba(5,7,10,0.45) 0%, transparent 100%)",
          pointerEvents: "none",
        }}
      />

      {/* ── Step sequences ── */}
      {STEPS.map((step) => {
        const from = Math.round(step.startSec * fps);
        const duration = Math.round((step.endSec - step.startSec) * fps);
        return (
          <Sequence key={step.title} from={from} durationInFrames={duration} layout="none">
            <StepOverlay step={step} fps={fps} />
          </Sequence>
        );
      })}

      {/* ── Generic "procesando" for the remaining time ── */}
      <Sequence from={9 * fps} durationInFrames={Infinity} layout="none">
        <OngoingBadge fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Step overlay — top-left badge ────────────────────────────────
function StepOverlay({ step, fps }: { step: Step; frame?: number; fps: number }) {
  const frame = useCurrentFrame();
  const duration = (step.endSec - step.startSec) * fps;

  // Fade in/out
  const opacity = interpolate(frame, [0, 10, duration - 10, duration], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  // Slide up on enter
  const translateY = spring({
    frame,
    fps,
    from: 24,
    to: 0,
    config: { damping: 16, stiffness: 200 },
  });

  // Step number (1-based)
  const stepIndex = STEPS.indexOf(step) + 1;

  return (
    <div
      style={{
        position: "absolute",
        top: 20,
        left: 20,
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "rgba(10, 11, 25, 0.8)",
          backdropFilter: "blur(12px)",
          borderRadius: 14,
          padding: "10px 18px",
          border: "1px solid rgba(59, 130, 246, 0.25)",
        }}
      >
        {/* Step number pill */}
        <span
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 24,
            height: 24,
            borderRadius: 8,
            background: "rgba(59, 130, 246, 0.2)",
            color: "#93c5fd",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          {stepIndex}
        </span>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 13, color: "#93c5fd", fontWeight: 700, letterSpacing: "0.03em" }}>
            {step.title}
          </span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 1 }}>
            {step.subtitle}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── "Procesando…" badge for unannotated sections ────────────────
function OngoingBadge({ fps }: { fps: number }) {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const pulse = interpolate(Math.sin(frame * 0.04), [-1, 1], [0.6, 1]);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        opacity: opacity * pulse,
        background: "rgba(10, 11, 25, 0.6)",
        backdropFilter: "blur(8px)",
        borderRadius: 20,
        padding: "8px 20px",
        border: "1px solid rgba(59, 130, 246, 0.15)",
        fontSize: 12,
        color: "rgba(255,255,255,0.4)",
        fontWeight: 500,
        letterSpacing: "0.06em",
      }}
    >
      Cotización en proceso…
    </div>
  );
}
