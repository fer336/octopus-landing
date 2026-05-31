import { AbsoluteFill, useCurrentFrame, interpolate, Sequence, spring, staticFile, Easing, useVideoConfig } from "remotion";
import { Video } from "@remotion/media";

// ── Steps timeline ──────────────────────────────────────────────
interface Step {
  startSec: number;
  endSec: number;
  title: string;
  subtitle: string;
}

const STEPS: Step[] = [
  { startSec: 0, endSec: 14, title: "Seleccionar productos", subtitle: "Agregá los items a facturar" },
  { startSec: 14, endSec: 19, title: "Elegir cliente", subtitle: "Buscá y seleccioná de tu lista" },
  { startSec: 21, endSec: 26, title: "Ir a Facturación Electrónica", subtitle: "Avanzá desde Cotizaciones hacia Factura" },
  { startSec: 26, endSec: 33, title: "Seleccionar medio de pago", subtitle: "En este caso, efectivo" },
  { startSec: 34, endSec: 43, title: "Emitir facturación electrónica", subtitle: "Se genera la factura y se muestra el detalle completo" },
];

// ── Main composition ────────────────────────────────────────────
export const FacturacionDemo: React.FC = () => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill>
      {/* ── Raw screen recording ── */}
      <Video
        src={staticFile("video-facturacion.mp4")}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          background: "#07090f",
        }}
      />

      {/* ── Top gradient ── */}
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

      {/* ── Generic badge for unannotated sections ── */}
      <Sequence from={44 * fps} durationInFrames={Infinity} layout="none">
        <OngoingBadge fps={fps} label="Facturación en proceso…" />
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Reusable step overlay ────────────────────────────────────────
function StepOverlay({ step, fps }: { step: Step; fps: number }) {
  const frame = useCurrentFrame();
  const duration = (step.endSec - step.startSec) * fps;

  const opacity = interpolate(frame, [0, 10, duration - 10, duration], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const translateY = spring({
    frame,
    fps,
    from: 24,
    to: 0,
    config: { damping: 16, stiffness: 200 },
  });

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

// ── Ongoing badge ────────────────────────────────────────────────
function OngoingBadge({ fps, label }: { fps: number; label: string }) {
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
      {label}
    </div>
  );
}
