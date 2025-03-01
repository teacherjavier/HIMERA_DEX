//src/components/SnowEffect.tsx
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
interface SnowEffectProps {
  isPlaying: boolean;
  onComplete: () => void;
}
const SnowEffect = ({ isPlaying, onComplete }: SnowEffectProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const snowParticlesRef = useRef<THREE.Points | null>(null);
  useEffect(() => {
    if (!containerRef.current || !isPlaying) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);
    camera.position.z = 10;
    const snowGeometry = new THREE.BufferGeometry();
    const particles = 1000;
    const positions = new Float32Array(particles * 3);
    const sizes = new Float32Array(particles);
    for (let i = 0; i < particles * 3; i += 3) {
      positions[i] = Math.random() * 10 + 5;
      positions[i + 1] = Math.random() * 10 + 5;
      positions[i + 2] = Math.random() * 15 - 5;
      sizes[i/3] = Math.random() * 0.03 + 0.02;
    }
    snowGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    snowGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 32;
    canvas.height = 32;
    if (ctx) {
      ctx.beginPath();
      ctx.arc(16, 16, 14, 0, Math.PI * 2);
      ctx.fillStyle = 'white';
      ctx.fill();
    }
    const snowTexture = new THREE.Texture(canvas);
    snowTexture.needsUpdate = true;
    const snowMaterial = new THREE.PointsMaterial({
      size: 0.05,
      map: snowTexture,
      transparent: true,
      opacity: 0.6,
      depthTest: false,
      blending: THREE.AdditiveBlending
    });
    const snow = new THREE.Points(snowGeometry, snowMaterial);
    scene.add(snow);
    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    snowParticlesRef.current = snow;
    let startTime = Date.now();
    const totalDuration = 9000;
    const windStart = 6500;
    const animate = () => {
      const currentTime = Date.now() - startTime;
      if (currentTime < totalDuration) {
        requestAnimationFrame(animate);
        const positions = snow.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < positions.length; i += 3) {
          positions[i] -= 0.03;
          positions[i + 1] -= (0.02 + Math.random() * 0.01);
          if (positions[i + 1] < -5 || positions[i] < -10) {
            positions[i] = Math.random() * 10 + 5;
            positions[i + 1] = Math.random() * 10 + 5;
            positions[i + 2] = Math.random() * 15 - 5;
          }
        }
        snow.geometry.attributes.position.needsUpdate = true;
        if (currentTime > windStart) {
          const windProgress = (currentTime - windStart) / (totalDuration - windStart);
          for (let i = 0; i < positions.length; i += 3) {
            positions[i] -= 0.1 * windProgress;
            if (i % 5 === 0) {
              positions[i + 1] += 0.02 * windProgress;
            }
          }
          snow.material.opacity = 0.6 * (1 - windProgress);
        }
        renderer.render(scene, camera);
      } else {
        onComplete();
      }
    };
    animate();
    return () => {
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      scene.remove(snow);
      renderer.dispose();
    };
  }, [isPlaying, onComplete]);
  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ opacity: isPlaying ? 1 : 0, transition: 'opacity 0.3s' }}
    />
  );
};
export default SnowEffect;
