# CS405 Project 2: Texture + Illumination

## Overview
This project involves enhancing a WebGL-based 3D renderer with advanced texture and illumination capabilities. You will be working with the following key files:

- **project2.html**: The main HTML file, responsible for rendering the scene.
- **project2.js**: JavaScript file that handles the 3D rendering logic. All tasks must be implemented in this file.
- **obj.js**: Utility file for handling OBJ files (3D models).

## Tasks

### Task 1: Accepting Non-Power of Two Textures
In Task 1, the `setTexture` method was modified to handle textures of any size, instead of only accepting textures with dimensions that are powers of two.

- **What was done**: Modified the `setTexture` method to ensure the wrapping and filtering parameters are set correctly for non-power-of-two images by setting `gl.TEXTURE_WRAP_S` and `gl.TEXTURE_WRAP_T` to `gl.CLAMP_TO_EDGE` when needed.
- **Result**: The renderer now supports non-power-of-two textures. This was tested using the `leaves.jpg` image under the resources folder.

### Task 2: Basic Lighting Implementation
In Task 2, ambient and diffuse lighting were implemented to improve the realism of the rendered scene.

- **What was done**: Modified the constructor, `setMesh`, `draw`, `enableLighting`, and `setAmbientLight` methods in **project2.js**. Also updated the fragment shader to include ambient and diffuse lighting calculations.
- **Result**: The scene now includes ambient and diffuse lighting, making it more visually realistic. The `Ambient Light Density` slider allows users to control the ambient parameter, and the arrow keys can be used to move the light source.

### Task 3: Specular Lighting (30 points)
In Task 3, specular lighting was introduced to simulate reflective surfaces and enhance the visual appeal of the scene.

- **What was done**: Added calculations for specular highlights in the fragment shader using the Phong reflection model. Modified the rendering pipeline to include a new slider labeled `Specular Light Intensity` for adjusting the intensity of the specular lighting.
- **Result**: Specular lighting has been successfully implemented, allowing users to adjust the specular intensity and create more dynamic and visually appealing effects in the rendered scene.

