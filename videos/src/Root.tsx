import "./index.css";
import { Composition } from "remotion";
import { CotizacionesDemo } from "./CotizacionesDemo";
import { FacturacionDemo } from "./FacturacionDemo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Cotizaciones"
        component={CotizacionesDemo}
        durationInFrames={19 * 30}
        fps={30}
        width={1366}
        height={646}
      />
      <Composition
        id="Facturacion"
        component={FacturacionDemo}
        durationInFrames={57 * 30}
        fps={30}
        width={1360}
        height={646}
      />
    </>
  );
};
