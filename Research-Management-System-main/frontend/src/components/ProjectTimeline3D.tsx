import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import axios from 'axios';
import { motion } from 'framer-motion';
// @ts-ignore - three examples types may not be present
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// @ts-ignore - CSS2DRenderer lacks types by default
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

interface Dependency {
    fromId: number;
    toId: number;
    type?: 'FS' | 'SS' | 'FF' | 'SF';
    lagDays?: number;
}

interface Phase {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    color?: string;
}

interface Milestone {
    id: number;
    title: string;
    date: string;
    color?: string;
    status?: string;
}

interface Project {
    id: number;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    // optional advanced fields (rendered if present)
    dependencies?: Dependency[]; // edges originating from this project
    phases?: Phase[];
    milestones?: Milestone[];
    criticalPath?: number[]; // optional server-provided CP by project ids
}

const ProjectTimeline3D: React.FC = () => {
    const mountRef = useRef<HTMLDivElement>(null);
    const canvasHostRef = useRef<HTMLDivElement>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [search, setSearch] = useState('');
    const [hoverInfo, setHoverInfo] = useState<{ x: number; y: number; text: string } | null>(null);
    const [selected, setSelected] = useState<{ title: string; description: string; startDate: string; endDate: string } | null>(null);
    const [dateRange, setDateRange] = useState<{ min: string | null; max: string | null }>({ min: null, max: null });
    const [loading, setLoading] = useState(false);
    const [showCritical, setShowCritical] = useState(true);
    const [showMiniMap, setShowMiniMap] = useState(true);

    const baseUrl = useMemo(() => process.env.REACT_APP_API_URL || 'http://localhost:8080', []);

    // derive min/max from projects
    const { globalMinDate, globalMaxDate } = useMemo(() => {
        if (!projects.length) return { globalMinDate: null as Date | null, globalMaxDate: null as Date | null };
        const ds = projects.map(p => new Date(p.startDate).getTime());
        const de = projects.map(p => new Date(p.endDate).getTime());
        const min = new Date(Math.min(...ds));
        const max = new Date(Math.max(...de));
        return { globalMinDate: min, globalMaxDate: max };
    }, [projects]);

    const filtered = useMemo(() => {
        const s = search.trim().toLowerCase();
        let list = projects.filter(p => (!s || p.title.toLowerCase().includes(s) || p.description.toLowerCase().includes(s)));
        if (dateRange.min) {
            const minT = new Date(dateRange.min).getTime();
            list = list.filter(p => new Date(p.endDate).getTime() >= minT);
        }
        if (dateRange.max) {
            const maxT = new Date(dateRange.max).getTime();
            list = list.filter(p => new Date(p.startDate).getTime() <= maxT);
        }
        return list;
    }, [projects, search, dateRange]);

    // server-side filtered fetch with debounce
    useEffect(() => {
        let ignore = false;
        let timer: number | undefined;
        const run = async () => {
            try {
                setLoading(true);
                const params: any = {};
                if (dateRange.min) params.from = dateRange.min;
                if (dateRange.max) params.to = dateRange.max;
                if (search.trim()) params.q = search.trim();
                const response = await axios.get(`${baseUrl}/api/projects`, { params });
                if (!ignore) setProjects(response.data || []);
            } catch (e) {
                console.error('Failed to load projects', e);
            } finally {
                setLoading(false);
            }
        };
        // debounce 250ms
        timer = window.setTimeout(run, 250);
        return () => { ignore = true; if (timer) window.clearTimeout(timer); };
    }, [baseUrl, search, dateRange.min, dateRange.max]);

    useEffect(() => {
        if (!canvasHostRef.current) return;
        if (!filtered.length) {
            // clear previous renderers if any
            while (canvasHostRef.current.firstChild) canvasHostRef.current.removeChild(canvasHostRef.current.firstChild);
            return;
        }

        const host = canvasHostRef.current;
        const width = host.clientWidth;
        const height = host.clientHeight || 520;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0b1220);

        const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 2000);
        camera.position.set(0, 8, 22);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(width, height);
        host.appendChild(renderer.domElement);

        const labelRenderer = new CSS2DRenderer();
        labelRenderer.setSize(width, height);
        labelRenderer.domElement.style.position = 'absolute';
        labelRenderer.domElement.style.top = '0';
        labelRenderer.domElement.style.pointerEvents = 'none';
        host.appendChild(labelRenderer.domElement);

        // lights
        const ambient = new THREE.AmbientLight(0xffffff, 0.7);
        scene.add(ambient);
        const dir = new THREE.DirectionalLight(0xffffff, 0.6);
        dir.position.set(5, 10, 7);
        scene.add(dir);

        // controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.08;
        controls.minDistance = 5;
        controls.maxDistance = 120;
        controls.maxPolarAngle = Math.PI / 2.1;

        // compute scale
        const tMin = globalMinDate ? globalMinDate.getTime() : new Date().getTime();
        const tMax = globalMaxDate ? globalMaxDate.getTime() : tMin + 86400000;
        const axisLength = 40; // world units
        const scale = (t: number) => {
            if (tMax === tMin) return 0;
            const ratio = (t - tMin) / (tMax - tMin);
            return -axisLength / 2 + ratio * axisLength;
        };

        // axis line
        const axisMat = new THREE.LineBasicMaterial({ color: 0x6b7280 });
        const axisPts = [new THREE.Vector3(-axisLength / 2, 0, 0), new THREE.Vector3(axisLength / 2, 0, 0)];
        const axisGeom = new THREE.BufferGeometry().setFromPoints(axisPts);
        const axis = new THREE.Line(axisGeom, axisMat);
        scene.add(axis);

        // ticks (monthly up to 12)
        const tickGroup = new THREE.Group();
        const tickCount = 10;
        for (let i = 0; i <= tickCount; i++) {
            const t = tMin + ((tMax - tMin) * i) / tickCount;
            const x = scale(t);
            const g = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(x, -0.2, 0),
                new THREE.Vector3(x, 0.2, 0),
            ]);
            const l = new THREE.Line(g, new THREE.LineBasicMaterial({ color: 0x9ca3af }));
            tickGroup.add(l);
            const d = new Date(t);
            const lab = document.createElement('div');
            lab.className = 'text-xs text-gray-300';
            lab.style.whiteSpace = 'nowrap';
            lab.textContent = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            const lblObj = new CSS2DObject(lab);
            lblObj.position.set(x, 0.5, 0);
            tickGroup.add(lblObj);
        }
        scene.add(tickGroup);

        // today marker
        const now = Date.now();
        if (now >= tMin && now <= tMax) {
            const x = scale(now);
            const g = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(x, -4, 0),
                new THREE.Vector3(x, 6, 0),
            ]);
            const todayLine = new THREE.Line(g, new THREE.LineBasicMaterial({ color: 0xef4444 }));
            scene.add(todayLine);
        }

        // bars group
        const bars = new THREE.Group();
        scene.add(bars);

        // maps for quick lookups
        const idToMesh = new Map<number, THREE.Mesh>();
        const idToSpan = new Map<number, { x1: number; x2: number; y: number; durationMs: number }>();

        const laneGap = 1.4;
        const barHeight = 0.5;
        const barDepth = 0.6;

        const tmpColor = new THREE.Color();

        filtered.forEach((p, idx) => {
            const sT = new Date(p.startDate).getTime();
            const eT = new Date(p.endDate).getTime();
            const x1 = scale(sT);
            const x2 = scale(eT);
            const width = Math.max(0.3, Math.abs(x2 - x1));
            const geom = new THREE.BoxGeometry(width, barHeight, barDepth);
            const color = tmpColor.setHSL((idx % 12) / 12, 0.6, 0.5).getHex();
            const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.1 });
            const mesh = new THREE.Mesh(geom, mat);
            mesh.position.set((x1 + x2) / 2, -idx * laneGap - 1, 0);
            mesh.userData = { id: p.id, title: p.title, description: p.description, startDate: p.startDate, endDate: p.endDate };
            bars.add(mesh);
            idToMesh.set(p.id, mesh);
            idToSpan.set(p.id, { x1, x2, y: mesh.position.y, durationMs: Math.max(0, eT - sT) });

            // label
            const label = document.createElement('div');
            label.className = 'text-xs text-gray-200 bg-black/40 px-1.5 py-0.5 rounded';
            label.textContent = p.title;
            const labelObj = new CSS2DObject(label);
            labelObj.position.set((x1 + x2) / 2, -idx * laneGap - 0.3, 0);
            scene.add(labelObj);

            // phases (segmented overlays)
            if (p.phases && p.phases.length) {
                for (const ph of p.phases) {
                    const ps = scale(new Date(ph.startDate).getTime());
                    const pe = scale(new Date(ph.endDate).getTime());
                    const pw = Math.max(0.12, Math.abs(pe - ps));
                    const pGeom = new THREE.BoxGeometry(pw, 0.18, barDepth + 0.02);
                    const pMat = new THREE.MeshStandardMaterial({ color: ph.color ? new THREE.Color(ph.color) : tmpColor.setHSL((idx % 12) / 12, 0.5, 0.65) });
                    const pMesh = new THREE.Mesh(pGeom, pMat);
                    pMesh.position.set((ps + pe) / 2, mesh.position.y + 0.38, 0.01);
                    scene.add(pMesh);

                    const plab = document.createElement('div');
                    plab.className = 'text-[10px] text-gray-100 bg-black/50 px-1 rounded';
                    plab.textContent = ph.name;
                    const plabObj = new CSS2DObject(plab);
                    plabObj.position.set((ps + pe) / 2, mesh.position.y + 0.7, 0);
                    scene.add(plabObj);
                }
            }

            // milestones
            if (p.milestones && p.milestones.length) {
                for (const m of p.milestones) {
                    const mx = scale(new Date(m.date).getTime());
                    const geo = new THREE.SphereGeometry(0.08, 12, 12);
                    const mat = new THREE.MeshStandardMaterial({ color: m.color ? new THREE.Color(m.color) : 0xffd166, emissive: 0x222222 });
                    const ms = new THREE.Mesh(geo, mat);
                    ms.position.set(mx, mesh.position.y + 0.45, 0.05);
                    scene.add(ms);

                    const mLab = document.createElement('div');
                    mLab.className = 'text-[10px] text-yellow-100 bg-yellow-900/70 px-1 rounded shadow';
                    mLab.textContent = m.title;
                    const mObj = new CSS2DObject(mLab);
                    mObj.position.set(mx, mesh.position.y + 0.95, 0);
                    scene.add(mObj);
                }
            }
        });

        // helper to compute inverse scale from x to time
        const xToTime = (x: number) => {
            const ratio = (x + axisLength / 2) / axisLength;
            return tMin + ratio * (tMax - tMin);
        };

        // dependencies arrows (if present)
        const depGroup = new THREE.Group();
        scene.add(depGroup);
        const allDeps: Dependency[] = [];
        for (const p of filtered) if (p.dependencies && p.dependencies.length) allDeps.push(...p.dependencies);
        const filteredIds = new Set(filtered.map(p => p.id));
        for (const d of allDeps) {
            if (!filteredIds.has(d.fromId) || !filteredIds.has(d.toId)) continue;
            const fromSpan = idToSpan.get(d.fromId);
            const toSpan = idToSpan.get(d.toId);
            if (!fromSpan || !toSpan) continue;
            // end of from depends on type
            const startX = (d.type === 'SS') ? fromSpan.x1 : (d.type === 'FF') ? fromSpan.x2 : fromSpan.x2;
            const endX = (d.type === 'FF' || d.type === 'SF') ? toSpan.x2 : toSpan.x1;
            const start = new THREE.Vector3(startX, fromSpan.y + 0.25, -0.06);
            const end = new THREE.Vector3(endX, toSpan.y + 0.25, -0.06);
            // slight vertical arc using control point
            const mid = new THREE.Vector3((start.x + end.x) / 2, (start.y + end.y) / 2 + 0.6, -0.06);
            const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
            const points = curve.getPoints(24);
            const g = new THREE.BufferGeometry().setFromPoints(points);
            const isCritical = showCritical && (filtered.find(p => p.criticalPath)?.criticalPath?.includes(d.fromId) && filtered.find(p => p.criticalPath)?.criticalPath?.includes(d.toId));
            const mat = new THREE.LineBasicMaterial({ color: isCritical ? 0xef4444 : 0x94a3b8, linewidth: isCritical ? 2 : 1 });
            const line = new THREE.Line(g, mat);
            depGroup.add(line);
            // arrowhead
            const dirVec = new THREE.Vector3().subVectors(end, points[points.length - 2]).normalize();
            const cone = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.28, 10), new THREE.MeshStandardMaterial({ color: isCritical ? 0xef4444 : 0x94a3b8 }));
            cone.position.copy(end);
            // orient cone to direction
            const axis = new THREE.Vector3(0, 1, 0);
            cone.quaternion.setFromUnitVectors(axis, dirVec.clone().normalize());
            depGroup.add(cone);
        }

        // raycasting for hover & drag-to-reschedule
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        let dragging: { id: number; mesh: THREE.Mesh; span: { x1: number; x2: number; y: number; durationMs: number } } | null = null;
        const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        const onMove = (ev: MouseEvent) => {
            const rect = renderer.domElement.getBoundingClientRect();
            mouse.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);
            if (dragging) {
                // intersect with plane at bar's Y
                plane.constant = -dragging.span.y; // plane equation uses -distance from origin
                const pt = new THREE.Vector3();
                raycaster.ray.intersectPlane(plane, pt);
                // keep width constant; move center to pt.x
                const width = dragging.span.x2 - dragging.span.x1;
                const newCenterX = pt.x;
                dragging.mesh.position.x = newCenterX;
                // update hover info live
                const centerT = xToTime(newCenterX);
                const startT = centerT - (dragging.span.durationMs / 2);
                const endT = centerT + (dragging.span.durationMs / 2);
                setHoverInfo({ x: ev.clientX - rect.left + 12, y: ev.clientY - rect.top + 12, text: `${dragging.mesh.userData.title}\n${new Date(startT).toDateString()} → ${new Date(endT).toDateString()}` });
                return;
            }
            const intersects = raycaster.intersectObjects(bars.children, false);
            if (intersects.length > 0) {
                const i = intersects[0];
                const d = i.object.userData;
                setHoverInfo({ x: ev.clientX - rect.left + 12, y: ev.clientY - rect.top + 12, text: `${d.title}\n${new Date(d.startDate).toDateString()} → ${new Date(d.endDate).toDateString()}` });
            } else {
                setHoverInfo(null);
            }
        };
        renderer.domElement.addEventListener('mousemove', onMove);
        const onDown = (ev: MouseEvent) => {
            const rect = renderer.domElement.getBoundingClientRect();
            mouse.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(bars.children, false);
            if (intersects.length > 0) {
                const obj = intersects[0].object as THREE.Mesh;
                const id = obj.userData.id as number;
                const span = idToSpan.get(id);
                if (span) {
                    dragging = { id, mesh: obj, span: { ...span } };
                }
            }
        };
        const onUp = async (ev: MouseEvent) => {
            if (!dragging) return;
            // compute final times
            const centerX = dragging.mesh.position.x;
            const centerT = xToTime(centerX);
            const startT = centerT - (dragging.span.durationMs / 2);
            const endT = centerT + (dragging.span.durationMs / 2);
            const newStart = new Date(startT);
            const newEnd = new Date(endT);
            // optimistic UI: update userData
            dragging.mesh.userData.startDate = newStart.toISOString().slice(0,10);
            dragging.mesh.userData.endDate = newEnd.toISOString().slice(0,10);
            const updateId = dragging.id;
            const prev = idToSpan.get(updateId)!;
            // update span store
            const half = (dragging.span.x2 - dragging.span.x1) / 2;
            idToSpan.set(updateId, { x1: centerX - half, x2: centerX + half, y: prev.y, durationMs: dragging.span.durationMs });
            // send to backend
            try {
                await axios.put(`${baseUrl}/api/projects/${updateId}/schedule`, {
                    startDate: newStart.toISOString().slice(0,10),
                    endDate: newEnd.toISOString().slice(0,10),
                });
            } catch (e) {
                console.error('Failed to update schedule', e);
            } finally {
                dragging = null;
            }
        };
        renderer.domElement.addEventListener('mousedown', onDown);
        window.addEventListener('mouseup', onUp);
        const onClick = (ev: MouseEvent) => {
            const rect = renderer.domElement.getBoundingClientRect();
            mouse.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(bars.children, false);
            if (intersects.length > 0) {
                const d = intersects[0].object.userData as { title: string; description: string; startDate: string; endDate: string };
                setSelected(d);
            } else {
                setSelected(null);
            }
        };
        renderer.domElement.addEventListener('click', onClick);

        // mini-map vars (declared before animate to avoid TDZ)
        let miniRenderer: THREE.WebGLRenderer | null = null;
        let miniCamera: THREE.OrthographicCamera | null = null;

        // animation loop
        let raf = 0;
        const animate = () => {
            raf = requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
            labelRenderer.render(scene, camera);
            if (miniRenderer && miniCamera) {
                miniRenderer.render(scene, miniCamera);
            }
        };
        animate();

        // keyboard shortcuts
        const onKey = (e: KeyboardEvent) => {
            const pan = (dx: number, dy: number) => {
                camera.position.x += dx; camera.position.y += dy; controls.target.x += dx; controls.target.y += dy;
            };
            switch (e.key) {
                case 'ArrowLeft': pan(-0.8, 0); break;
                case 'ArrowRight': pan(0.8, 0); break;
                case 'ArrowUp': pan(0, 0.6); break;
                case 'ArrowDown': pan(0, -0.6); break;
                case '+': case '=': camera.position.z = Math.max(6, camera.position.z - 1); break;
                case '-': case '_': camera.position.z = Math.min(150, camera.position.z + 1); break;
                case 'f': case 'F': {
                    // fit view
                    controls.target.set(0, -((filtered.length - 1) * laneGap) / 2 - 1, 0);
                    camera.position.set(0, 8, 22);
                    break;
                }
                case 'h': case 'H': setShowCritical(s => !s); break;
                case 'm': case 'M': setShowMiniMap(s => !s); break;
            }
        };
        window.addEventListener('keydown', onKey);

        // resize observer
        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const cr = entry.contentRect;
                const w = cr.width;
                const h = cr.height;
                camera.aspect = w / h;
                camera.updateProjectionMatrix();
                renderer.setSize(w, h);
                labelRenderer.setSize(w, h);
            }
        });
        resizeObserver.observe(host);

        // mini-map
        const miniDiv = document.createElement('div');
        miniDiv.style.position = 'absolute';
        miniDiv.style.right = '8px';
        miniDiv.style.bottom = '8px';
        miniDiv.style.border = '1px solid rgba(255,255,255,0.2)';
        miniDiv.style.background = 'rgba(0,0,0,0.3)';
        miniDiv.style.pointerEvents = 'none';
        const initMiniMap = () => {
            const w = 200, h = 120;
            miniRenderer = new THREE.WebGLRenderer({ antialias: true });
            miniRenderer.setSize(w, h);
            miniRenderer.setPixelRatio(1);
            miniDiv.appendChild(miniRenderer.domElement);
            host.appendChild(miniDiv);
            miniCamera = new THREE.OrthographicCamera(-axisLength/1.5, axisLength/1.5, 12, -12, 0.1, 500);
            miniCamera.position.set(0, 60, 0.0001);
            miniCamera.up.set(0,0,-1);
            miniCamera.lookAt(0,0,0);
        };
        if (showMiniMap) initMiniMap();

        // cleanup
        return () => {
            resizeObserver.disconnect();
            renderer.domElement.removeEventListener('mousemove', onMove);
            renderer.domElement.removeEventListener('mousedown', onDown);
            renderer.domElement.removeEventListener('click', onClick);
            window.removeEventListener('mouseup', onUp);
            window.removeEventListener('keydown', onKey);
            cancelAnimationFrame(raf);
            // dispose
            scene.traverse((obj) => {
                if ((obj as THREE.Mesh).geometry) (obj as THREE.Mesh).geometry.dispose?.();
                // @ts-ignore
                if ((obj as THREE.Mesh).material?.dispose) (obj as THREE.Mesh).material.dispose();
            });
            host.removeChild(renderer.domElement);
            host.removeChild(labelRenderer.domElement);
            if (miniRenderer && miniRenderer.domElement.parentElement) {
                miniRenderer.dispose();
                miniRenderer.domElement.parentElement.removeChild(miniRenderer.domElement);
            }
            if (miniDiv && miniDiv.parentElement) {
                miniDiv.parentElement.removeChild(miniDiv);
            }
        };
    }, [filtered, globalMinDate, globalMaxDate, showCritical, showMiniMap]);

    const onExport = () => {
        const host = canvasHostRef.current;
        if (!host) return;
        const canvas = host.querySelector('canvas');
        if (!canvas) return;
        const url = (canvas as HTMLCanvasElement).toDataURL('image/png');
        const a = document.createElement('a');
        a.href = url;
        a.download = 'timeline.png';
        a.click();
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full"
            ref={mountRef}
        >
            <div className="flex flex-wrap items-center gap-3 mb-3">
                <input
                    type="text"
                    placeholder="Search projects..."
                    className="border rounded px-3 py-1 text-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600">From</span>
                    <input
                        type="date"
                        className="border rounded px-2 py-1"
                        value={dateRange.min ?? ''}
                        onChange={(e) => setDateRange(r => ({ ...r, min: e.target.value || null }))}
                        min={globalMinDate ? globalMinDate.toISOString().slice(0,10) : undefined}
                        max={globalMaxDate ? globalMaxDate.toISOString().slice(0,10) : undefined}
                    />
                    <span className="text-gray-600">To</span>
                    <input
                        type="date"
                        className="border rounded px-2 py-1"
                        value={dateRange.max ?? ''}
                        onChange={(e) => setDateRange(r => ({ ...r, max: e.target.value || null }))}
                        min={globalMinDate ? globalMinDate.toISOString().slice(0,10) : undefined}
                        max={globalMaxDate ? globalMaxDate.toISOString().slice(0,10) : undefined}
                    />
                </div>
                <button onClick={onExport} className="ml-auto bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-3 py-1 rounded">Export PNG</button>
                <div className="text-xs text-gray-400 ml-2">Keys: Arrows pan, +/- zoom, F fit, H toggle CP, M mini-map</div>
            </div>
            <div ref={canvasHostRef} className="relative w-full" style={{ height: 520 }}>
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 text-gray-700 text-sm">Loading…</div>
                )}
                {hoverInfo && (
                    <div
                        className="absolute z-10 pointer-events-none bg-gray-900 text-white text-xs px-2 py-1 rounded shadow"
                        style={{ left: hoverInfo.x, top: hoverInfo.y }}
                    >
                        {hoverInfo.text.split('\n').map((l, i) => <div key={i}>{l}</div>)}
                    </div>
                )}
                {selected && (
                    <div className="absolute top-0 right-0 h-full w-80 bg-white/95 backdrop-blur border-l shadow-lg p-4 overflow-y-auto">
                        <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-gray-900">{selected.title}</h3>
                            <button className="text-gray-500 hover:text-gray-700" onClick={() => setSelected(null)}>✕</button>
                        </div>
                        <div className="text-sm text-gray-700 whitespace-pre-wrap mb-3">{selected.description || 'No description'}</div>
                        <div className="text-sm text-gray-600">
                            <div><span className="font-medium">Start:</span> {new Date(selected.startDate).toLocaleString()}</div>
                            <div><span className="font-medium">End:</span> {new Date(selected.endDate).toLocaleString()}</div>
                            <div className="mt-3 text-xs text-gray-500">Tip: Use mouse to orbit/pan/zoom. Drag edge of panel to resize window.</div>
                        </div>
                    </div>
                )}
            </div>
            <div className="text-xs text-gray-500 mt-2">Projects: {filtered.length}</div>
        </motion.div>
    );
};

export default ProjectTimeline3D;