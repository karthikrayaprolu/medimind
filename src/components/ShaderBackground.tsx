import React from 'react';
import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react';

export function ShaderBackground() {
    return (
        <div className='fixed top-0 left-0 w-full h-full -z-10 pointer-events-none overflow-hidden'>
            <ShaderGradientCanvas
                style={{
                    width: '100%',
                    height: '100%',
                }}
                pixelDensity={1}
                pointerEvents='none'
            >
                <ShaderGradient
                    animate='on'
                    type='sphere'
                    wireframe={false}
                    shader='defaults'
                    uTime={0}
                    uSpeed={0.3}
                    uStrength={0.3}
                    uDensity={0.8}
                    uFrequency={5.5}
                    uAmplitude={3.2}
                    positionX={-0.1}
                    positionY={0}
                    positionZ={0}
                    rotationX={0}
                    rotationY={130}
                    rotationZ={70}
                    // Theme colors: Primary (Blue), Secondary (Teal), Accent/Light
                    color1='#3b82f6' // Primary Blue
                    color2='#14b8a6' // Secondary Teal
                    color3='#e0f2fe' // Light Blue/White
                    reflection={0.4}
                    // View (camera) props
                    cAzimuthAngle={270}
                    cPolarAngle={180}
                    cDistance={0.5}
                    cameraZoom={15.1}
                    // Effect props
                    lightType='env'
                    brightness={0.8}
                    envPreset='city'
                    grain='on'
                    // Tool props
                    toggleAxis={false}
                    zoomOut={false}
                    hoverState=''
                    enableTransition={false}
                />
            </ShaderGradientCanvas>
        </div>
    );
}
