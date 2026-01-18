# Technology Stack: H2G2 Web Adaptation

## Languages & Runtimes
-   **Rust:** Core game engine and Z-machine interpreter logic.
-   **TypeScript:** Type-safe development for the web frontend.
-   **WebAssembly (WASM):** Target for the Rust engine, enabling high-performance execution in the browser.
-   **Node.js:** Runtime for the frontend development environment and build tools (v22.16.0+).

## Frontend (apps/web)
-   **React 18:** UI library for building the terminal interface and management components.
-   **Vite 7:** Fast build tool and development server.
-   **CSS Modules:** For scoped and maintainable styling of UI components.
-   **Vitest:** Modern testing framework for React components.

## Game Engine (encrusted)
-   **Rust Library:** A standalone crate for the Z-machine interpreter.
-   **Key Dependencies:**
    -   `serde` & `serde_json`: For state serialization and hint data processing.
    -   `wasm-bindgen`: Facilitates the high-level bridge between Rust and JavaScript.
    -   `base64`: For portable save-game encoding.
    -   `rand`: For game randomization logic.

## Infrastructure & Tooling
-   **Moon:** Monorepo task orchestration for managing the web, engine, and WASM sub-projects.
-   **asdf:** Version management for Node.js and Rust to ensure environment consistency.
-   **Cloudflare Pages:** Automated deployment platform.
-   **Custom Build Pipeline:** `build.sh` script for managing the WASM compilation and post-processing steps.

## Testing & Quality
-   **Cargo Test:** For comprehensive testing of the Rust game engine logic.
-   **Vitest:** For testing terminal UI interactions and React hooks.
-   **CI/CD:** Integrated via Cloudflare Pages for automatic builds and deployments on push.
