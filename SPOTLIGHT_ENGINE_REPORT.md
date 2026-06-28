# SPOTLIGHT ENGINE REPORT

## Overview
The React Spotlight Engine is the core technical enabler for the guided tour. It dynamically highlights UI elements on the page while dimming the surrounding interface, providing a highly focused, cinematic experience.

## Implementation Details
1. **State-Based Computation**: Instead of heavy DOM manipulation, the engine relies on a pure React state object (`SpotlightState`). It computes the bounding rectangle (`getBoundingClientRect()`) of predefined targets defined in `JUDGE_TARGETS`.
2. **Visual Aesthetics**: The spotlight hole uses a heavily blurred backdrop filter and an SVG-like polygon clip-path for a sharp cutout. Overlaid on this cutout is a pulsing, green-tinted border that explicitly draws the eye, leveraging the `var(--color-accent-primary)` design token.
3. **Responsive Adaptation**: The engine listens to `resize` and `scroll` events, aggressively recalculating bounds to ensure the spotlight never drifts off-target on mobile devices or smaller screens.

## Impact
The engine transforms a static dashboard into a narrated, step-by-step presentation. It forcibly manages the user's attention, guaranteeing they see the exact features OPTIMUS wants to highlight.
