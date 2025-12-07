# H2G2

A monorepo containing a web application, Rust backend, and WebAssembly module for the Hitchhiker's Guide to the Galaxy interactive experience.

## Project Structure

```
h2g2/
├── apps/web/           # React + Vite web application
├── encrusted/          # Rust library (game engine)
├── wasm/              # WebAssembly build of the Rust library
└── moon.yml           # Moon monorepo configuration
```

## Setup

### Prerequisites

- Node.js 18+ (for web development)
- Rust 1.70+ (for building Rust and WASM components)
- Moon (optional, for monorepo task orchestration)

### Installation

```bash
# Install dependencies for the web app
cd apps/web
npm install

# Rust projects use Cargo, no additional setup needed
```

## Development

### Using Moon (Recommended)

```bash
# Start web development server
moon run web:dev

# Build all projects
moon run :build

# Run tests
moon run :test

# Lint code
moon run :lint
```

### Manual Setup

**Web App:**
```bash
cd apps/web
npm run dev
```

The development server runs at `http://localhost:5173`

**Rust Projects:**
```bash
cd encrusted
cargo build
cargo test

cd ../wasm
cargo build --target wasm32-unknown-unknown --release
```

## Available Commands

### Web Application (apps/web)
- `npm run dev` - Start development server with hot reload
- `npm run build` - Create production build
- `npm run build:dev` - Create development build
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build locally

### Encrusted (Rust Library)
- `cargo build --release` - Build release binary
- `cargo test` - Run tests
- `cargo clean` - Clean build artifacts

### WASM
- `cargo build --target wasm32-unknown-unknown --release` - Build WebAssembly module
- `cargo test --target wasm32-unknown-unknown` - Run tests

## Technologies

### Web
- **Vite** - Build tool and dev server
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS
- **shadcn/ui** - Component library
- **React Router** - Client-side routing
- **React Hook Form** - Form management
- **TanStack Query** - Data fetching and caching

### Backend
- **Rust** - System language for the game engine
- **WebAssembly** - Browser-compatible binary module

## Project Details

This project is a web-based adaptation of the classic Hitchhiker's Guide to the Galaxy text adventure game. The game logic is implemented in Rust and compiled to WebAssembly for browser execution, while the user interface is built with React and Tailwind CSS.

## License

See LICENSE file in the encrusted directory.
