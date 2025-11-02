import { ScriptRendererProps } from "@/lib/third-party-scripts/types";
import { CanRender } from "../CanRender";
import { ScriptComponent } from "./ScriptComponent";

export function ScriptRenderer({
  scripts,
  position,
}: ScriptRendererProps): JSX.Element {
  const positionScripts = scripts.filter(
    (script) => script.position === position
  );

  return (
    <>
      {positionScripts.map((script) => (
        <CanRender
          key={script.id}
          enabled={script.enabled !== false} // Default to true if not specified
          fallback={script.fallback || null}
        >
          <ScriptComponent script={script} />
        </CanRender>
      ))}
    </>
  );
}
