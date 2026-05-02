# 3D Models Directory

Place optimized `.glb` or `.gltf` models here. They will be loaded using `useGLTF` from `@react-three/drei`.

## Recommended Sources (Free)

1. **Sketchfab** — [sketchfab.com](https://sketchfab.com) → Filter by "Downloadable" + "glTF"
   - Search: "space station low poly", "sci-fi spaceship", "asteroid"
2. **Poly Pizza** — [poly.pizza](https://poly.pizza) → Already optimized for web
3. **Kenney Assets** — [kenney.nl](https://kenney.nl/assets) → CC0 game-ready models

## Expected Files

```
models/
├── space_station.glb    # Branch visualization
├── spaceship.glb        # Contributor visualization
├── asteroid.glb         # Small commit
├── rocky_planet.glb     # Medium commit (optional)
└── gas_giant.glb        # Large commit (optional)
```

## Requirements

- **Format:** GLTF/GLB (binary preferred for smaller size)
- **Poly count:** Under 10,000 triangles per model
- **Textures:** Baked or PBR (metallic-roughness workflow)
- **Scale:** Normalized to ~1 unit size (will be scaled in code)

## How to Use

Once you have a model file, drop it here and update the component to use `useGLTF`:

```jsx
import { useGLTF } from "@react-three/drei";

function MyModel() {
  const { scene } = useGLTF("/models/space_station.glb");
  return <primitive object={scene.clone()} />;
}

// Preload for faster rendering
useGLTF.preload("/models/space_station.glb");
```

## Current State

The app currently uses **detailed procedural geometry** (multi-mesh groups with PBR materials).
Dropping real GLB models here and updating the components will further enhance visual quality.
