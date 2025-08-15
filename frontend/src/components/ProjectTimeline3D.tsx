import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import axios from 'axios';
import { motion } from 'framer-motion';

interface Project {
    id: number;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
}

const ProjectTimeline3D: React.FC = () => {
    const mountRef = useRef<HTMLDivElement>(null);
    const [projects, setProjects] = useState<Project[]>([]);

    useEffect(() => {
        // Fetch projects
        const fetchProjects = async () => {
            const response = await axios.get('http://localhost:8080/api/projects');
            setProjects(response.data);
            setupScene();
        };

        // Three.js setup
        const setupScene = () => {
            if (!mountRef.current) return;

            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer();
            renderer.setSize(window.innerWidth, window.innerHeight);
            mountRef.current.appendChild(renderer.domElement);

            // Add a simple cube for each project
            projects.forEach((project, index) => {
                const geometry = new THREE.BoxGeometry(1, 1, 1);
                const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
                const cube = new THREE.Mesh(geometry, material);
                cube.position.x = index * 2; // Spread cubes along x-axis
                scene.add(cube);
            });

            // Add a line for the timeline
            const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
            const points = [
                new THREE.Vector3(-10, 0, 0),
                new THREE.Vector3(10, 0, 0),
            ];
            const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(lineGeometry, lineMaterial);
            scene.add(line);

            camera.position.z = 5;

            // Animation loop
            const animate = () => {
                requestAnimationFrame(animate);
                scene.children.forEach(child => {
                    if (child instanceof THREE.Mesh) {
                        child.rotation.x += 0.01;
                        child.rotation.y += 0.01;
                    }
                });
                renderer.render(scene, camera);
            };
            animate();

            // Handle window resize
            const handleResize = () => {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            };
            window.addEventListener('resize', handleResize);

            // Cleanup
            return () => {
                window.removeEventListener('resize', handleResize);
                mountRef.current?.removeChild(renderer.domElement);
            };
        };

        fetchProjects();
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full h-screen"
            ref={mountRef}
        />
    );
};

export default ProjectTimeline3D;