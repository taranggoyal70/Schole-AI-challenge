import { Sparkle } from "@phosphor-icons/react";

export function Brand() {
  return (
    <div className="brand" aria-label="Scholé AI Project EVOLVE">
      <span className="brand-mark" aria-hidden="true">
        <Sparkle weight="fill" />
      </span>
      <span className="brand-name">Scholé AI</span>
      <span className="brand-divider" aria-hidden="true" />
      <span className="brand-product">EVOLVE</span>
    </div>
  );
}
