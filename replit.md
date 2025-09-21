# Overview

This is a full-stack 3D Minecraft-like game built with React Three Fiber on the frontend and Express.js on the backend. The application features a voxel-based world with procedural terrain generation, first-person controls, chunk-based world loading, and 3D graphics rendered using WebGL. The game includes features like terrain generation with grass and dirt blocks, tree placement, collision detection, physics simulation, and a minimap for navigation.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React 18** with TypeScript for component-based UI development
- **React Three Fiber** (@react-three/fiber) for 3D scene management and WebGL rendering
- **Three.js** ecosystem including @react-three/drei for 3D utilities and @react-three/postprocessing for visual effects
- **Zustand** for state management with dedicated stores for game state, audio management, and Minecraft world data
- **Vite** as the build tool with support for GLSL shaders, hot module replacement, and asset handling
- **Tailwind CSS** with Radix UI components for styling and UI elements
- **Component structure**: Organized into game components (Player, Terrain, Chunks), UI components, and utility hooks

## Backend Architecture
- **Express.js** server with TypeScript for API handling
- **RESTful API structure** with routes prefixed under `/api`
- **Development/Production separation** using Vite middleware in development and static file serving in production
- **Error handling middleware** with proper HTTP status codes and JSON responses
- **Request logging** with timing and response capture for API endpoints

## Data Storage Architecture
- **Drizzle ORM** with PostgreSQL dialect for type-safe database operations
- **Schema definition** using Drizzle's pgTable with Zod validation schemas
- **Database migrations** managed through Drizzle Kit with schema versioning
- **Dual storage approach**: In-memory storage (MemStorage) for development and PostgreSQL for production
- **Storage interface pattern** (IStorage) allowing easy switching between storage implementations

## Game Engine Architecture
- **Chunk-based world system** with 16x16 block chunks and dynamic loading/unloading based on player position
- **Procedural terrain generation** using deterministic height functions with multiple noise layers
- **Instanced rendering** for performance optimization using THREE.InstancedMesh for block rendering
- **Physics simulation** with gravity, collision detection, and movement mechanics
- **First-person controls** with mouse look, WASD movement, and pointer lock API integration

## Asset and Resource Management
- **Texture system** with nearest-neighbor filtering for pixelated Minecraft-style appearance
- **3D model support** for GLTF/GLB files and audio formats (MP3, OGG, WAV)
- **Font loading** using Fontsource for consistent typography
- **Static asset serving** through Vite's asset pipeline with proper content types

# External Dependencies

## Database Services
- **Neon Database** (@neondatabase/serverless) - Serverless PostgreSQL for data persistence
- **PostgreSQL** - Primary database system configured through DATABASE_URL environment variable

## 3D Graphics and Game Libraries
- **Three.js ecosystem** - Core 3D rendering engine with React Three Fiber integration
- **WebGL** - Hardware-accelerated 3D graphics rendering in the browser
- **GLSL shader support** - Custom shader loading through vite-plugin-glsl

## UI and Styling Framework
- **Radix UI** - Comprehensive set of accessible, unstyled UI primitives for building the interface
- **Tailwind CSS** - Utility-first CSS framework for responsive design and styling
- **Lucide React** - Icon library for consistent iconography throughout the application

## Development and Build Tools
- **TypeScript** - Type safety across the entire application stack
- **ESBuild** - Fast JavaScript bundler for production builds
- **PostCSS with Autoprefixer** - CSS processing and vendor prefix management
- **TSX** - TypeScript execution for development server

## Audio Management
- **HTML5 Audio API** - Native browser audio capabilities for background music and sound effects
- **Audio state management** - Custom Zustand store for muting, sound playback, and audio control

## Session and State Management
- **TanStack React Query** - Server state management with caching and synchronization
- **Zustand** - Lightweight state management for client-side application state
- **Connect PG Simple** - PostgreSQL session store for Express sessions (configured but not actively used)