import { X } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ConceptExperiencePanel } from "./ConceptExperiencePanel";
import { LandingConcept } from "./LandingConcept";
import type { Concept } from "../types";

export function ConceptModal({
  concept,
  onClose,
}: {
  concept: Concept;
  onClose: () => void;
}) {
  const [experience, setExperience] = useState<"primary" | "secondary" | null>(
    null,
  );
  const experienceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!experience) return;
    experienceRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [experience]);

  return (
    <motion.div
      className="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="presentation"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
    >
      <motion.div
        className="concept-modal"
        role="dialog"
        aria-modal="true"
        aria-label={`${concept.name} landing page`}
        initial={{ y: 32, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 24, opacity: 0, scale: 0.98 }}
      >
        <button
          className="modal-close"
          type="button"
          onClick={onClose}
          aria-label="Close landing page preview"
        >
          <X weight="bold" />
        </button>
        <LandingConcept
          concept={concept}
          onPrimaryAction={() => setExperience("primary")}
          onSecondaryAction={() => setExperience("secondary")}
        />
        {experience && (
          <div ref={experienceRef}>
            <ConceptExperiencePanel
              concept={concept}
              mode={experience}
              onClose={() => setExperience(null)}
            />
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
