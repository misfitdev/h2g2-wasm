# Product Guidelines: H2G2 Web Adaptation

## Prose & Communication
-   **Tone:** The primary tone is **Playful & "Adamsesque"**. Documentation, error messages, and user-facing UI elements should be witty, slightly absurd, and reminiscent of Douglas Adams' writing style.
-   **Core Maxim:** "Don't Panic!" This should guide how we handle errors, help messages, and loading states.
-   **Contribution Tone:** Professional yet approachable, encouraging community involvement with a wink to the source material.

## Visual Identity & UX
-   **Retro-Modern Hybrid:** We aim for a "Hybrid Functional" UI that leans heavily towards an authentic VT220 aesthetic.
-   **UI Elements:** Modern React components (modals, tooltips, buttons) are permitted for better usability but **must** be styled with custom CSS (glow, scanlines, fonts) to seamlessly blend into the terminal environment.
-   **Immersion First:** When in doubt, err on the side of maintaining the retro feel and immersion over standard modern UI conventions.

## Multimedia & ASCII Art
-   **Varied Complexity:** We support a range of ASCII art styles, from minimalist symbolic icons to detailed scene-setting headers and dynamic/animated elements.
-   **Contextual Usage:** The choice of style should be guided by the specific game context—minimalism for items, elaborate scenes for new locations, and animation for high-impact events.
-   **Aesthetic Alignment:** All multimedia assets must adhere to the terminal's phosphor-green/amber color palette and mono-spaced constraints.

## Technical Standards
-   **Conventions:** Maintain the **existing project conventions**. Adhere to idiomatic Rust for the engine (`encrusted`) and idiomatic React/TypeScript for the web app (`apps/web`).
-   **Bridge Layer:** Ensure the WASM interop layer remains clean and well-documented, using descriptive naming to bridge the two ecosystems.
-   **Testing:** New features MUST include appropriate unit/integration tests to maintain the project's goal of "Automated Confidence."
