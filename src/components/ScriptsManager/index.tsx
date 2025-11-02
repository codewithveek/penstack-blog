import { CanRender } from "../CanRender";
import { ScriptComponent } from "./ScriptComponent";
import {
  ConditionalScriptRendererProps,
  ScriptConfig,
  ScriptPosition,
} from "@/lib/third-party-scripts/types";

// Enhanced ScriptRenderer with global enable/disable support
function ConditionalScriptRenderer({
  scripts,
  position,
  globalEnabled = true,
}: ConditionalScriptRendererProps): JSX.Element {
  const positionScripts = scripts.filter(
    (script) => script.position === position
  );

  return (
    <CanRender enabled={globalEnabled}>
      <>
        {positionScripts.map((script) => (
          <CanRender
            key={script.id}
            enabled={script.enabled !== false}
            fallback={script.fallback || null}
          >
            <ScriptComponent script={script} />
          </CanRender>
        ))}
      </>
    </CanRender>
  );
}

export { CanRender, ConditionalScriptRenderer };
