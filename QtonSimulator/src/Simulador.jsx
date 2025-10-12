import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import Icons from './Icons';

const QuantumSimulator = () => {
    const { Atom, Search, Numbers, Lightning, Wave, Refresh, Save, Rocket, Info, Noise, Chart, Warning, Check, X, Computer, Trophy, TrendingUp, Download, Clipboard, Bulb, Cog, ArrowRight, Sun, Moon, ChevronUp, ChevronDown, Play, Pause, Book, Clock, Badge } = Icons;
    const [selectedAlgorithm, setSelectedAlgorithm] = useState('');
    const [showAlgorithmDropdown, setShowAlgorithmDropdown] = useState(false);
    const [userInput, setUserInput] = useState('');
    const [qubits, setQubits] = useState(5);
    const [problemSize, setProblemSize] = useState(32);
    const [simulationSpeed, setSimulationSpeed] = useState(1);
    const [showExamplesModal, setShowExamplesModal] = useState(false);
    const [showQuantumStateModal, setShowQuantumStateModal] = useState(false);
    const [isSimulating, setIsSimulating] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const pausedRef = useRef(false);
    const pauseStartTimeRef = useRef(0);
    const totalPausedTimeRef = useRef(0);
  
    // Métricas
    const [quantumSteps, setQuantumSteps] = useState(0);
    const [classicalSteps, setClassicalSteps] = useState(0);
    const [quantumProgress, setQuantumProgress] = useState(0);
    const [classicalProgress, setClassicalProgress] = useState(0);
    const [quantumTime, setQuantumTime] = useState(0);
    const [classicalTime, setClassicalTime] = useState(0);
    
    const [quantumOperations, setQuantumOperations] = useState({
        hadamard: 0,
        oracle: 0,
        diffusion: 0,
        cnot: 0,
        phase: 0,
        measurement: 0,
        total: 0
    });

    const [classicalOperations, setClassicalOperations] = useState({
        comparisons: 0,
        assignments: 0,
        iterations: 0,
        total: 0
    });
    
    const [quantumHasNoise, setQuantumHasNoise] = useState(false);
    const [errorRate, setErrorRate] = useState(0);
    const [fidelity, setFidelity] = useState(null);
    const [accuracy, setAccuracy] = useState(null);
    const [successProbability, setSuccessProbability] = useState(null);
    const [simulationComplete, setSimulationComplete] = useState(false);
    const [currentPhase, setCurrentPhase] = useState('');
    const [quantumData, setQuantumData] = useState([]);
    const [classicalData, setClassicalData] = useState([]);
    const [inputError, setInputError] = useState('');
    const [quantumPerformanceData, setQuantumPerformanceData] = useState([]);
    const [classicalPerformanceData, setClassicalPerformanceData] = useState([]);
    const [quantumStateData, setQuantumStateData] = useState([]);
    const [entanglementLevel, setEntanglementLevel] = useState(0);
    const [superpositionStates, setSuperpositionStates] = useState(0);
    
    // LOGS
    const [quantumLog, setQuantumLog] = useState([]);
    const [classicalLog, setClassicalLog] = useState([]);
    const quantumLogRef = useRef(null);
    const classicalLogRef = useRef(null);
    const iterationsRef = useRef(0);
    
    const cancelRef = useRef(false);
    const dropdownRef = useRef(null);

    const [noiseEnabled, setNoiseEnabled] = useState(true);
    const [customErrorRate, setCustomErrorRate] = useState(1.0);
    const [gateErrors, setGateErrors] = useState(0);
    const [measurementError, setMeasurementError] = useState(0);

    const algorithms = {
        grover: {
            name: "Grover (Búsqueda)",
            icon: <Search />,
            quantumName: "Búsqueda Cuántica de Grover",
            classicalName: "Búsqueda Lineal Clásica",
            description: "Busca un elemento específico en una base de datos no ordenada",
            inputLabel: "Número a buscar",
            inputPlaceholder: "Ej: 42",
            inputExample: "Ingresa cualquier número entre 0 y el tamaño del problema menos 1",
            helpText: "¿Qué es esto?",
            helpDescription: "El algoritmo de Grover busca un elemento específico en una lista desordenada. Es como buscar un nombre en una guía telefónica que no está ordenada alfabéticamente.",
            examples: [
                { input: "15", explanation: "Busca el número 15 en la base de datos" },
                { input: "0", explanation: "Busca el primer elemento (posición 0)" },
                { input: "31", explanation: "Busca el último elemento con 5 qubits" },
                { input: "7", explanation: "Busca el elemento en la posición 7" }
            ],
            whyItMatters: "En una computadora clásica, si tienes N elementos, en promedio necesitas revisar N/2 elementos. Grover lo hace revisando solo √N elementos. Con 128 elementos, solo necesita ~11 pasos en lugar de ~64.",
            quantumComplexity: "O(√N)",
            classicalComplexity: "O(N)",
            quantumGates: ["Hadamard", "Oracle", "Diffusion"],
            entanglementUsed: false,
            validate: (val, size) => {
                const num = parseInt(val);
                return !isNaN(num) && num >= 0 && num < size;
            },
            defaultInput: (size) => Math.floor(Math.random() * size).toString()
        },
        shor: {
            name: "Shor (Factorización)",
            icon: <Numbers />,
            quantumName: "Factorización Cuántica de Shor",
            classicalName: "Factorización por Prueba y Error",
            description: "Encuentra los factores primos de un número compuesto",
            inputLabel: "Número a factorizar",
            inputPlaceholder: "Ej: 15",
            inputExample: "Ingresa un número compuesto (producto de dos primos)",
            helpText: "¿Qué números puedo usar?",
            helpDescription: "El algoritmo de Shor encuentra los dos números primos que multiplicados dan el número que ingresaste. Por ejemplo, 15 = 3 × 5.",
            examples: [
                { input: "15", explanation: "15 = 3 × 5" },
                { input: "21", explanation: "21 = 3 × 7" },
                { input: "35", explanation: "35 = 5 × 7" },
                { input: "77", explanation: "77 = 7 × 11" }
            ],
            whyItMatters: "La seguridad RSA depende de que factorizar sea difícil. Una computadora clásica tardaría años en factorizar números de 300 dígitos, pero Shor lo haría en minutos.",
            quantumComplexity: "O((log N)³)",
            classicalComplexity: "O(√N)",
            quantumGates: ["Hadamard", "QFT", "Modular Exp", "CNOT"],
            entanglementUsed: true,
            validate: (val) => {
                const num = parseInt(val);
                return !isNaN(num) && num > 3 && num < 200;
            },
            defaultInput: () => "15"
        },
        simon: {
            name: "Simon (Periodicidad)",
            icon: <Refresh />,
            quantumName: "Algoritmo Cuántico de Simon",
            classicalName: "Búsqueda Exhaustiva de Periodos",
            description: "Encuentra el periodo oculto en una función",
            inputLabel: "Cadena binaria del periodo",
            inputPlaceholder: "Ej: 101",
            inputExample: "Escribe una secuencia de 0s y 1s (máximo 7 bits)",
            helpText: "¿Qué es una cadena binaria?",
            helpDescription: "Una cadena binaria es una secuencia de 0s y 1s. El algoritmo de Simon descubre el patrón oculto que se repite.",
            examples: [
                { input: "101", explanation: "Periodo de 3 bits: 1-0-1" },
                { input: "110", explanation: "Periodo de 3 bits: 1-1-0" },
                { input: "1001", explanation: "Periodo de 4 bits: 1-0-0-1" },
                { input: "10101", explanation: "Periodo de 5 bits: 1-0-1-0-1" }
            ],
            whyItMatters: "Encontrar patrones repetitivos es fundamental en criptografía. Simon puede encontrar estos patrones exponencialmente más rápido que los métodos clásicos.",
            quantumComplexity: "O(n)",
            classicalComplexity: "O(2ⁿ)",
            quantumGates: ["Hadamard", "Oracle", "Measurement"],
            entanglementUsed: true,
            validate: (val, size) => {
                return /^[01]+$/.test(val) && val.length > 0 && val.length <= 7;
            },
            defaultInput: () => "101"
        },
        deutsch: {
            name: "Deutsch-Jozsa",
            icon: <Lightning />,
            quantumName: "Algoritmo Cuántico Deutsch-Jozsa",
            classicalName: "Evaluación Clásica de Función",
            description: "Determina si una función es constante o balanceada",
            inputLabel: "Tipo de función",
            inputPlaceholder: "constante o balanceada",
            inputExample: "Escribe 'constante' o 'balanceada'",
            helpText: "¿Qué significan estos términos?",
            helpDescription: "Una función 'constante' siempre da el mismo resultado. Una función 'balanceada' da 0 la mitad de las veces y 1 la otra mitad.",
            examples: [
                { input: "constante", explanation: "La función siempre devuelve el mismo valor (0 o 1)" },
                { input: "balanceada", explanation: "La función devuelve 0 la mitad de las veces y 1 la otra mitad" }
            ],
            whyItMatters: "Clásicamente necesitarías probar más de la mitad de las entradas. Deutsch-Jozsa lo determina con una sola consulta cuántica.",
            quantumComplexity: "O(1)",
            classicalComplexity: "O(2ⁿ⁻¹ + 1)",
            quantumGates: ["Hadamard", "Oracle", "Measurement"],
            entanglementUsed: false,
            validate: (val) => {
                return val.toLowerCase() === 'constante' || val.toLowerCase() === 'balanceada';
            },
            defaultInput: () => 'constante'
        },
        fourier: {
            name: "QFT (Fourier)",
            icon: <Wave />,
            quantumName: "Transformada Cuántica de Fourier",
            classicalName: "Transformada Rápida de Fourier (FFT)",
            description: "Transformación del dominio del tiempo al de frecuencia",
            inputLabel: "Número de puntos (potencia de 2)",
            inputPlaceholder: "Ej: 32",
            inputExample: "Ingresa una potencia de 2 (16, 32, 64, 128)",
            helpText: "¿Qué es una transformada de Fourier?",
            helpDescription: "Convierte una señal en las frecuencias que la componen. Es como descomponer una canción en sus notas musicales.",
            examples: [
                { input: "16", explanation: "Transforma 16 puntos de datos" },
                { input: "32", explanation: "Transforma 32 puntos de datos" },
                { input: "64", explanation: "Transforma 64 puntos de datos" },
                { input: "128", explanation: "Transforma 128 puntos de datos" }
            ],
            whyItMatters: "La FFT es fundamental en audio y telecomunicaciones. La QFT es cuadráticamente más rápida y es componente clave de Shor.",
            quantumComplexity: "O((log N)²)",
            classicalComplexity: "O(N log N)",
            quantumGates: ["Hadamard", "Phase Rotation", "SWAP"],
            entanglementUsed: true,
            validate: (val) => {
                const num = parseInt(val);
                return !isNaN(num) && num >= 16 && num <= 128 && (num & (num - 1)) === 0;
            },
            defaultInput: (size) => size.toString()
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowAlgorithmDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Auto-scroll de logs
    useEffect(() => {
        if (quantumLogRef.current) {
            quantumLogRef.current.scrollTop = quantumLogRef.current.scrollHeight;
        }
    }, [quantumLog]);

    useEffect(() => {
        if (classicalLogRef.current) {
            classicalLogRef.current.scrollTop = classicalLogRef.current.scrollHeight;
        }
    }, [classicalLog]);

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const addQuantumLog = (message, type = 'info') => {
        const timestamp = new Date().toLocaleTimeString('es-ES', { hour12: false });
        setQuantumLog(prev => [...prev, { timestamp, message, type }]);
    };

    const addClassicalLog = (message, type = 'info') => {
        const timestamp = new Date().toLocaleTimeString('es-ES', { hour12: false });
        setClassicalLog(prev => [...prev, { timestamp, message, type }]);
    };

    const generateQuantumStateVisualization = (step, total) => {
        const stateCount = Math.min(16, Math.pow(2, qubits));
        const data = [];
        const progress = step / total;
        
        for (let i = 0; i < stateCount; i++) {
            const amplitude = Math.cos((i / stateCount) * Math.PI * 2 * (1 - progress)) * (1 - progress) + 
                            progress * (i === Math.floor(stateCount / 2) ? 1 : 0.1);
            data.push({
                state: `|${i.toString(2).padStart(Math.ceil(Math.log2(stateCount)), '0')}⟩`,
                amplitude: Math.abs(amplitude),
                probability: Math.pow(Math.abs(amplitude), 2)
            });
        }
        return data;
    };

    const generateVisualizationData = (type, step, total) => {
        const data = [];
        const barCount = 20;
        
        if (type === 'quantum') {
        for (let i = 0; i < barCount; i++) {
            const progress = step / total;
            const amplitude = Math.cos((i / barCount) * Math.PI * 2 * (1 - progress)) * (1 - progress) + 
                            progress * (i === Math.floor(barCount / 2) ? 1 : 0.1);
            data.push({
                index: i,
                height: Math.abs(amplitude) * 100,
                highlighted: progress > 0.8 && i === Math.floor(barCount / 2)
            });
        }
        } else {
        for (let i = 0; i < barCount; i++) {
            data.push({
                index: i,
                height: 50 + Math.random() * 50,
                highlighted: i === Math.floor((step / total) * barCount),
                checked: i < Math.floor((step / total) * barCount)
            });
        }
        }
        return data;
    };

    const runQuantumSimulation = async (algo) => {
        const iterations = Math.ceil(Math.sqrt(problemSize));
        iterationsRef.current = iterations;
        const baseDelay = 800 / simulationSpeed;
        
        setCurrentPhase('quantum');
        setQuantumSteps(0);
        setQuantumProgress(0);
        setQuantumTime(0);
        setSuperpositionStates(Math.pow(2, qubits));
        
        // Inicializar operaciones
        const ops = {
            hadamard: 0,
            oracle: 0,
            diffusion: 0,
            cnot: 0,
            phase: 0,
            measurement: 0,
            total: 0
        };
        
        // Contadores de errores acumulativos
        let totalGateErrors = 0;
        let hasNoise = false;
        
        totalPausedTimeRef.current = 0;
        const startTime = Date.now();
        
        addQuantumLog(`    Iniciando algoritmo cuántico: ${algorithms[algo].quantumName}`, 'success');
        addQuantumLog(`    Configuración: ${qubits} qubits, N=${problemSize} elementos`, 'info');
        addQuantumLog(`(-) Objetivo: "${userInput}"`, 'info');
        
        if (noiseEnabled) {
            addQuantumLog(`   Modelo de ruido habilitado (tasa por puerta: ${customErrorRate}%)`, 'warning');
        }
        
        // SIMULACIÓN POR ALGORITMO
        if (algo === 'grover') {
            // ============ GROVER ============
            addQuantumLog(`  FASE 1: Inicialización de qubits en |0⟩`, 'operation');
            await sleep(baseDelay * 0.5);
            
            // Aplicar Hadamard con ruido
            addQuantumLog(`   Aplicando ${qubits} puertas Hadamard (H)`, 'operation');
            addQuantumLog(`   └─ Creando superposición uniforme de ${Math.pow(2, qubits)} estados`, 'detail');
            ops.hadamard += qubits;
            ops.total += qubits;
        
            if (noiseEnabled) {
                for (let q = 0; q < qubits; q++) {
                    if (Math.random() * 100 < customErrorRate) {
                        totalGateErrors++;
                        hasNoise = true;
                    }
                }
                if (totalGateErrors > 0) {
                    addQuantumLog(`      ${totalGateErrors} error(es) en puertas Hadamard`, 'warning');
                }
            }
        
            await sleep(baseDelay * 0.5);
            
            addQuantumLog(`   FASE 2: Iteraciones de Grover (${iterations} iteraciones)`, 'operation');
        
            for (let i = 0; i <= iterations && !cancelRef.current; i++) {
                while (pausedRef.current && !cancelRef.current) {
                    await sleep(100);
                }
                
                if (cancelRef.current) break;
                
                setQuantumSteps(i);
                setQuantumProgress((i / iterations) * 100);
                setQuantumData(generateVisualizationData('quantum', i, iterations));
                setQuantumStateData(generateQuantumStateVisualization(i, iterations));
                
                if (i < iterations) {
                    addQuantumLog(`   -- Iteración ${i + 1}/${iterations}`, 'info');
                    addQuantumLog(`      ├─ Aplicando Oracle (Uf) - Marcando solución`, 'detail');
                    ops.oracle += 1;
                    ops.total += 1;
                
                    if (noiseEnabled && Math.random() * 100 < customErrorRate) {
                        totalGateErrors++;
                        hasNoise = true;
                    }
                
                    addQuantumLog(`      └─ Aplicando Difusión (D) - Amplificando amplitud`, 'detail');
                    ops.diffusion += 1;
                    ops.hadamard += qubits * 2;
                    ops.total += 1 + qubits * 2;
                
                    if (noiseEnabled) {
                        const diffusionGates = qubits * 2 + 1;
                        for (let g = 0; g < diffusionGates; g++) {
                            if (Math.random() * 100 < customErrorRate) {
                                totalGateErrors++;
                                hasNoise = true;
                            }
                        }
                    }
                }
                
                setQuantumOperations(ops);
                
                const elapsedTime = (Date.now() - startTime - totalPausedTimeRef.current) / 1000;
                const theoreticalTime = (Math.sqrt(problemSize) * 0.001) + elapsedTime;
                setQuantumTime(theoreticalTime.toFixed(3));
                
                const progressPercent = (i / iterations) * 100;
                setQuantumPerformanceData(prev => [...prev, {
                    tiempo: parseFloat(theoreticalTime.toFixed(3)),
                    progreso: parseFloat(progressPercent.toFixed(1))
                }]);
                
                await sleep(baseDelay);
            }
        
        } else if (algo === 'shor') {
        // ============ SHOR ============
            addQuantumLog(`   FASE 1: Inicialización y superposición`, 'operation');
            await sleep(baseDelay * 0.5);
            
            addQuantumLog(`   Aplicando ${qubits} puertas Hadamard (H)`, 'operation');
            ops.hadamard += qubits;
            ops.total += qubits;
            
            if (noiseEnabled) {
                for (let q = 0; q < qubits; q++) {
                    if (Math.random() * 100 < customErrorRate) {
                        totalGateErrors++;
                        hasNoise = true;
                    }
                }
            }
            await sleep(baseDelay);
        
            const shorIterations = Math.ceil(Math.log2(problemSize));
            addQuantumLog(`   FASE 2: Exponenciación modular (${shorIterations} pasos)`, 'operation');
        
            for (let i = 0; i <= shorIterations && !cancelRef.current; i++) {
                while (pausedRef.current && !cancelRef.current) await sleep(100);
                if (cancelRef.current) break;
                
                setQuantumSteps(i);
                setQuantumProgress((i / shorIterations) * 100);
                setQuantumData(generateVisualizationData('quantum', i, shorIterations));
                setQuantumStateData(generateQuantumStateVisualization(i, shorIterations));
                setEntanglementLevel(Math.min(100, (i / shorIterations) * 120));
                
                if (i < shorIterations) {
                    addQuantumLog(`   -- Paso ${i + 1}/${shorIterations}`, 'info');
                    addQuantumLog(`      ├─ Aplicando exponenciación modular`, 'detail');
                    ops.cnot += qubits;
                    ops.total += qubits;
                    
                    if (noiseEnabled) {
                        for (let g = 0; g < qubits; g++) {
                            if (Math.random() * 100 < customErrorRate) {
                                totalGateErrors++;
                                hasNoise = true;
                            }
                        }
                    }
                }
                
                setQuantumOperations(ops);
                const elapsedTime = (Date.now() - startTime - totalPausedTimeRef.current) / 1000;
                setQuantumTime(elapsedTime.toFixed(3));
                setQuantumPerformanceData(prev => [...prev, {
                    tiempo: parseFloat(elapsedTime.toFixed(3)),
                    progreso: parseFloat(((i / shorIterations) * 100).toFixed(1))
                }]);
                
                await sleep(baseDelay);
            }
        
            addQuantumLog(`   FASE 3: Transformada Cuántica de Fourier (QFT)`, 'operation');
            const qftOps = qubits * (qubits + 1) / 2;
            ops.phase += qftOps;
            ops.hadamard += qubits;
            ops.total += qftOps + qubits;
            
            if (noiseEnabled) {
                for (let g = 0; g < qftOps + qubits; g++) {
                    if (Math.random() * 100 < customErrorRate) {
                        totalGateErrors++;
                        hasNoise = true;
                    }
                }
            }
            await sleep(baseDelay);
        
        } else if (algo === 'simon') {
            // ============ SIMON ============
            const simonIterations = qubits;
            addQuantumLog(`   FASE 1: Preparación de ${qubits} qubits`, 'operation');
            await sleep(baseDelay * 0.5);
            
            addQuantumLog(`   Aplicando ${qubits} puertas Hadamard en registro 1`, 'operation');
            ops.hadamard += qubits;
            ops.total += qubits;
            
            if (noiseEnabled) {
                for (let q = 0; q < qubits; q++) {
                    if (Math.random() * 100 < customErrorRate) {
                        totalGateErrors++;
                        hasNoise = true;
                    }
                }
            }
            await sleep(baseDelay);
            
            addQuantumLog(`   FASE 2: Consultas al oráculo (${simonIterations} consultas)`, 'operation');
            
            for (let i = 0; i <= simonIterations && !cancelRef.current; i++) {
                while (pausedRef.current && !cancelRef.current) await sleep(100);
                if (cancelRef.current) break;
                
                setQuantumSteps(i);
                setQuantumProgress((i / simonIterations) * 100);
                setQuantumData(generateVisualizationData('quantum', i, simonIterations));
                setQuantumStateData(generateQuantumStateVisualization(i, simonIterations));
                setEntanglementLevel(Math.min(100, (i / simonIterations) * 150));
                
                if (i < simonIterations) {
                    addQuantumLog(`   -- Consulta ${i + 1}/${simonIterations}`, 'info');
                    addQuantumLog(`      ├─ Aplicando Oracle y creando entrelazamiento`, 'detail');
                    ops.oracle += 1;
                    ops.cnot += qubits;
                    ops.total += 1 + qubits;
                    
                    if (noiseEnabled) {
                        for (let g = 0; g < 1 + qubits; g++) {
                            if (Math.random() * 100 < customErrorRate) {
                                totalGateErrors++;
                                hasNosise = true;
                            }
                        }
                    }
                    
                    addQuantumLog(`      └─ Aplicando Hadamard en registro 1`, 'detail');
                    ops.hadamard += qubits;
                    ops.total += qubits;
                    
                    if (noiseEnabled) {
                        for (let q = 0; q < qubits; q++) {
                            if (Math.random() * 100 < customErrorRate) {
                                totalGateErrors++;
                                hasNoise = true;
                            }
                        }
                    }
                }
                
                setQuantumOperations(ops);
                const elapsedTime = (Date.now() - startTime - totalPausedTimeRef.current) / 1000;
                setQuantumTime(elapsedTime.toFixed(3));
                setQuantumPerformanceData(prev => [...prev, {
                    tiempo: parseFloat(elapsedTime.toFixed(3)),
                    progreso: parseFloat(((i / simonIterations) * 100).toFixed(1))
                }]);
                
                await sleep(baseDelay);
            }
        
        } else if (algo === 'deutsch') {
            // ============ DEUTSCH-JOZSA ============
            addQuantumLog(`⚡ FASE 1: Inicialización de qubits`, 'operation');
            await sleep(baseDelay * 0.5);
            
            addQuantumLog(`   Aplicando Hadamard en todos los qubits`, 'operation');
            ops.hadamard += qubits + 1;
            ops.total += qubits + 1;
            
            if (noiseEnabled) {
                for (let q = 0; q < qubits + 1; q++) {
                    if (Math.random() * 100 < customErrorRate) {
                        totalGateErrors++;
                        hasNoise = true;
                    }
                }
            }
            await sleep(baseDelay);
            
            addQuantumLog(`   FASE 2: Aplicando Oracle único`, 'operation');
            addQuantumLog(`   └─ Evaluando función ${userInput}`, 'detail');
            ops.oracle += 1;
            ops.total += 1;
            
            if (noiseEnabled && Math.random() * 100 < customErrorRate) {
                totalGateErrors++;
                hasNoise = true;
            }
            
            setQuantumSteps(1);
            setQuantumProgress(50);
            setQuantumData(generateVisualizationData('quantum', 1, 2));
            setQuantumStateData(generateQuantumStateVisualization(1, 2));
            await sleep(baseDelay);
            
            addQuantumLog(`   FASE 3: Aplicando Hadamard final`, 'operation');
            ops.hadamard += qubits;
            ops.total += qubits;
            
            if (noiseEnabled) {
                for (let q = 0; q < qubits; q++) {
                    if (Math.random() * 100 < customErrorRate) {
                        totalGateErrors++;
                        hasNoise = true;
                    }
                }
            }
            
            setQuantumSteps(2);
            setQuantumProgress(100);
            await sleep(baseDelay);
        } else if (algo === 'fourier') {
            // ============ QFT ============
            const qftSteps = qubits;
            addQuantumLog(`   FASE 1: Transformada Cuántica de Fourier`, 'operation');
            addQuantumLog(`   └─ Procesando ${qubits} qubits`, 'detail');
            await sleep(baseDelay * 0.5);
            
            for (let i = 0; i <= qftSteps && !cancelRef.current; i++) {
                while (pausedRef.current && !cancelRef.current) await sleep(100);
                if (cancelRef.current) break;
                
                setQuantumSteps(i);
                setQuantumProgress((i / qftSteps) * 100);
                setQuantumData(generateVisualizationData('quantum', i, qftSteps));
                setQuantumStateData(generateQuantumStateVisualization(i, qftSteps));
                setEntanglementLevel(Math.min(100, (i / qftSteps) * 140));
                
                if (i < qftSteps) {
                    addQuantumLog(`   -- Qubit ${i + 1}/${qubits}`, 'info');
                    addQuantumLog(`      ├─ Aplicando Hadamard`, 'detail');
                    ops.hadamard += 1;
                    ops.total += 1;
                    
                    if (noiseEnabled && Math.random() * 100 < customErrorRate) {
                        totalGateErrors++;
                        hasNoise = true;
                    }
                    
                    const rotations = qubits - i - 1;
                    if (rotations > 0) {
                        addQuantumLog(`      ├─ Aplicando ${rotations} rotaciones de fase`, 'detail');
                        ops.phase += rotations;
                        ops.total += rotations;
                        
                        if (noiseEnabled) {
                            for (let r = 0; r < rotations; r++) {
                                if (Math.random() * 100 < customErrorRate) {
                                    totalGateErrors++;
                                    hasNoise = true;
                                }
                            }
                        }
                    }
                }
                
                setQuantumOperations(ops);
                const elapsedTime = (Date.now() - startTime - totalPausedTimeRef.current) / 1000;
                setQuantumTime(elapsedTime.toFixed(3));
                setQuantumPerformanceData(prev => [...prev, {
                    tiempo: parseFloat(elapsedTime.toFixed(3)),
                    progreso: parseFloat(((i / qftSteps) * 100).toFixed(1))
                }]);
                
                await sleep(baseDelay);
            }
            
            addQuantumLog(`   FASE 2: Operaciones SWAP`, 'operation');
            const swaps = Math.floor(qubits / 2);
            ops.total += swaps * 3;
            
            if (noiseEnabled) {
                for (let s = 0; s < swaps * 3; s++) {
                    if (Math.random() * 100 < customErrorRate) {
                        totalGateErrors++;
                        hasNoise = true;
                    }
                }
            }
            await sleep(baseDelay);
        }
        
        // MEDICIÓN FINAL
        if (!cancelRef.current) {
            addQuantumLog(`   FASE FINAL: Medición del estado cuántico`, 'operation');
            
            let measurementErrors = 0;
            if (noiseEnabled) {
                const measurementErrorRate = Math.min(customErrorRate * 2, 5);
                for (let q = 0; q < qubits; q++) {
                    if (Math.random() * 100 < measurementErrorRate) {
                        measurementErrors++;
                    }
                }
                if (measurementErrors > 0) {
                    addQuantumLog(`      ${measurementErrors} error(es) en medición`, 'warning');
                }
            }
        
            addQuantumLog(`   └─ Colapso del estado cuántico`, 'detail');
            ops.measurement += qubits;
            ops.total += qubits;
            setQuantumOperations(ops);
            
            setQuantumHasNoise(hasNoise);
            setGateErrors(totalGateErrors);
            setMeasurementError(measurementErrors);
            
            const effectiveErrorRate = ((totalGateErrors + measurementErrors) / ops.total) * 100;
            setErrorRate(effectiveErrorRate);
            
            // CALCULAR Métricas
            // 1. Fidelidad
            let calculatedFidelity;
            const totalErrors = totalGateErrors + measurementErrors;
        
            if (totalErrors > 0 && ops.total > 0) {
                const realErrorRate = totalErrors / ops.total;
                calculatedFidelity = (1 - realErrorRate) * 100;
                calculatedFidelity = Math.max(0, calculatedFidelity);
            } else {
                calculatedFidelity = 100;
            }

            setFidelity(calculatedFidelity);
            
            // 2. Exactitud (basada en algoritmo teórico)
            const theoreticalAccuracy = Math.pow(Math.sin((2 * iterationsRef.current + 1) * Math.PI / (2 * Math.sqrt(problemSize))), 2) * 100;
            const actualAccuracy = theoreticalAccuracy * (calculatedFidelity / 100);
            setAccuracy(actualAccuracy);
            
            // 3. Probabilidad de éxito teórica
            const successProb = Math.min(99.9, theoreticalAccuracy);
            setSuccessProbability(successProb);
            
            const finalTime = (Date.now() - startTime - totalPausedTimeRef.current) / 1000;
            setQuantumTime(finalTime.toFixed(3));
        
            addQuantumLog(`   Algoritmo completado en ${finalTime.toFixed(3)}s`, 'success');
            addQuantumLog(`   Total de operaciones: ${ops.total}`, 'success');
            addQuantumLog(`   ├─ Hadamard: ${ops.hadamard}`, 'detail');
            addQuantumLog(`   ├─ Oracle: ${ops.oracle}`, 'detail');
            addQuantumLog(`   ├─ Diffusion: ${ops.diffusion}`, 'detail');
            addQuantumLog(`   ├─ CNOT: ${ops.cnot}`, 'detail');
            addQuantumLog(`   ├─ Phase: ${ops.phase}`, 'detail');
            addQuantumLog(`   └─ Measurement: ${ops.measurement}`, 'detail');
        
            if (hasNoise || measurementErrors > 0) {
                addQuantumLog(`   Errores detectados:`, 'warning');
                addQuantumLog(`   ├─ Errores de puerta: ${totalGateErrors}`, 'detail');
                addQuantumLog(`   ├─ Errores de medición: ${measurementErrors}`, 'detail');
                addQuantumLog(`   └─ Tasa de error efectiva: ${effectiveErrorRate.toFixed(2)}%`, 'detail');
            }
        }
    };

    const runClassicalSimulation = async (algo) => {
        const baseDelay = 600 / simulationSpeed;
        
        setCurrentPhase('classical');
        setClassicalSteps(0);
        setClassicalProgress(0);
        setClassicalTime(0);
        
        const ops = {
            comparisons: 0,
            assignments: 0,
            iterations: 0,
            total: 0
        };
        
        totalPausedTimeRef.current = 0;
        const startTime = Date.now();
        
        addClassicalLog(`    Iniciando algoritmo clásico: ${algorithms[algo].classicalName}`, 'success');
        addClassicalLog(`    Configuración: N=${problemSize} elementos`, 'info');
        addClassicalLog(`(-) Objetivo: "${userInput}"`, 'info');
        addClassicalLog(``, 'info');
        
        // IMPLEMENTACIÓN POR ALGORITMO
        if (algo === 'grover') {
            // ============ BÚSQUEDA LINEAL CLÁSICA ============
            addClassicalLog(`   Búsqueda lineal iniciada...`, 'operation');
            addClassicalLog(`   └─ Revisando cada elemento secuencialmente`, 'detail');
            
            for (let i = 0; i <= problemSize && !cancelRef.current; i++) {
                while (pausedRef.current && !cancelRef.current) {
                    await sleep(100);
                }
                
                if (cancelRef.current) break;
                
                const updateInterval = Math.ceil(problemSize / 50);
                
                if (i % updateInterval === 0 || i === problemSize) {
                    setClassicalSteps(i);
                    setClassicalProgress((i / problemSize) * 100);
                    setClassicalData(generateVisualizationData('classical', i, problemSize));
                    
                    if (i % (updateInterval * 5) === 0 && i > 0) {
                        addClassicalLog(`   -- Elemento ${i}/${problemSize} revisado`, 'info');
                        addClassicalLog(`      ├─ array[${i}] == ${userInput}? No`, 'detail');
                        addClassicalLog(`      └─ Continuar búsqueda...`, 'detail');
                    }
                    
                    ops.iterations = i;
                    ops.comparisons = i;
                    ops.assignments = i;
                    ops.total = i * 3;
                    setClassicalOperations(ops);
                    
                    const elapsedTime = (Date.now() - startTime - totalPausedTimeRef.current) / 1000;
                    const theoreticalTime = (problemSize * 0.0001) + elapsedTime;
                    setClassicalTime(theoreticalTime.toFixed(3));
                    
                    const progressPercent = (i / problemSize) * 100;
                    setClassicalPerformanceData(prev => [...prev, {
                        tiempo: parseFloat(theoreticalTime.toFixed(3)),
                        progreso: parseFloat(progressPercent.toFixed(1))
                    }]);
                    
                    await sleep(baseDelay);
                }
            }
            
            addClassicalLog(``, 'info');
            addClassicalLog(`   Elemento encontrado en posición ${userInput}`, 'success');
        
        } else if (algo === 'shor') {
            // ============ FACTORIZACIÓN POR DIVISIÓN/PRUEBA ============
            const numberToFactor = parseInt(userInput);
            addClassicalLog(`   Factorización por división de prueba`, 'operation');
            addClassicalLog(`   └─ Probando divisores desde 2 hasta √${numberToFactor}`, 'detail');
            
            const limit = Math.ceil(Math.sqrt(numberToFactor));
            
            for (let i = 2; i <= limit && !cancelRef.current; i++) {
                while (pausedRef.current && !cancelRef.current) await sleep(100);
                if (cancelRef.current) break;
                
                setClassicalSteps(i);
                setClassicalProgress((i / limit) * 100);
                setClassicalData(generateVisualizationData('classical', i, limit));
                
                if (i % Math.max(1, Math.ceil(limit / 20)) === 0 || i === limit) {
                    addClassicalLog(`   -- Probando divisor ${i}`, 'info');
                    addClassicalLog(`      ├─ ${numberToFactor} % ${i} = ${numberToFactor % i}`, 'detail');
                    
                    if (numberToFactor % i === 0) {
                        addClassicalLog(`      └─    ¡Factor encontrado! ${numberToFactor} = ${i} × ${numberToFactor/i}`, 'success');
                    } else {
                        addClassicalLog(`      └─ No es divisor, continuar...`, 'detail');
                    }
                }
                
                ops.iterations = i;
                ops.comparisons = i;
                ops.assignments = i * 2;
                ops.total = i * 4;
                setClassicalOperations(ops);
                
                const elapsedTime = (Date.now() - startTime - totalPausedTimeRef.current) / 1000;
                setClassicalTime(elapsedTime.toFixed(3));
                setClassicalPerformanceData(prev => [...prev, {
                    tiempo: parseFloat(elapsedTime.toFixed(3)),
                    progreso: parseFloat(((i / limit) * 100).toFixed(1))
                }]);
                
                await sleep(baseDelay);
            }
            
            addClassicalLog(``, 'info');
            addClassicalLog(`   Factorización completada`, 'success');
        } else if (algo === 'simon') {
            // ============ BÚSQUEDA EXHAUSTIVA DE PERIODO ============
            const patternLength = userInput.length;
            const totalTests = Math.pow(2, patternLength);
            
            addClassicalLog(`   Búsqueda exhaustiva del periodo oculto`, 'operation');
            addClassicalLog(`   └─ Probando todas las ${totalTests} posibles cadenas de ${patternLength} bits`, 'detail');
            
            for (let i = 0; i <= totalTests && !cancelRef.current; i++) {
                while (pausedRef.current && !cancelRef.current) await sleep(100);
                if (cancelRef.current) break;
                
                if (i % Math.max(1, Math.ceil(totalTests / 50)) === 0 || i === totalTests) {
                    setClassicalSteps(i);
                    setClassicalProgress((i / totalTests) * 100);
                    setClassicalData(generateVisualizationData('classical', i, totalTests));
                    
                    if (i % Math.max(1, Math.ceil(totalTests / 10)) === 0 && i > 0) {
                        const testPattern = i.toString(2).padStart(patternLength, '0');
                        addClassicalLog(`   -- Probando patrón ${testPattern}`, 'info');
                        addClassicalLog(`      ├─ Evaluando función f(x ⊕ ${testPattern})`, 'detail');
                        addClassicalLog(`      └─ Comparando con f(x)...`, 'detail');
                    }
                    
                    ops.iterations = i;
                    ops.comparisons = i * 2;
                    ops.assignments = i;
                    ops.total = i * 4;
                    setClassicalOperations(ops);
                    
                    const elapsedTime = (Date.now() - startTime - totalPausedTimeRef.current) / 1000;
                    setClassicalTime(elapsedTime.toFixed(3));
                    setClassicalPerformanceData(prev => [...prev, {
                        tiempo: parseFloat(elapsedTime.toFixed(3)),
                        progreso: parseFloat(((i / totalTests) * 100).toFixed(1))
                    }]);
                    
                    await sleep(baseDelay);
                }
            }
            
            addClassicalLog(``, 'info');
            addClassicalLog(`   Periodo encontrado: ${userInput}`, 'success');
        } else if (algo === 'deutsch') {
            // ============ EVALUACIÓN CLÁSICA MÚLTIPLE ============
            const totalEvaluations = Math.pow(2, qubits - 1) + 1;
            
            addClassicalLog(`   Evaluación clásica determinística`, 'operation');
            addClassicalLog(`   └─ Se requieren ${totalEvaluations} evaluaciones para determinar el tipo`, 'detail');
            
            for (let i = 0; i <= totalEvaluations && !cancelRef.current; i++) {
                while (pausedRef.current && !cancelRef.current) await sleep(100);
                if (cancelRef.current) break;
                
                setClassicalSteps(i);
                setClassicalProgress((i / totalEvaluations) * 100);
                setClassicalData(generateVisualizationData('classical', i, totalEvaluations));
                
                if (i % Math.max(1, Math.ceil(totalEvaluations / 10)) === 0 && i > 0) {
                    const input = i.toString(2).padStart(qubits, '0');
                    addClassicalLog(`   -- Evaluación ${i}/${totalEvaluations}`, 'info');
                    addClassicalLog(`      ├─ f(${input}) = ?`, 'detail');
                    addClassicalLog(`      └─ Guardando resultado...`, 'detail');
                }
                
                ops.iterations = i;
                ops.comparisons = i;
                ops.assignments = i;
                ops.total = i * 3;
                setClassicalOperations(ops);
                
                const elapsedTime = (Date.now() - startTime - totalPausedTimeRef.current) / 1000;
                setClassicalTime(elapsedTime.toFixed(3));
                setClassicalPerformanceData(prev => [...prev, {
                    tiempo: parseFloat(elapsedTime.toFixed(3)),
                    progreso: parseFloat(((i / totalEvaluations) * 100).toFixed(1))
                }]);
                
                await sleep(baseDelay);
            }
            
            addClassicalLog(``, 'info');
            addClassicalLog(`   Función determinada: ${userInput}`, 'success');
        } else if (algo === 'fourier') {
            // ============ FFT CLÁSICA ============
            const n = parseInt(userInput);
            const fftSteps = n * Math.log2(n);
            
            addClassicalLog(`   Transformada Rápida de Fourier (FFT)`, 'operation');
            addClassicalLog(`   └─ Algoritmo de Cooley-Tukey para ${n} puntos`, 'detail');
            
            for (let i = 0; i <= fftSteps && !cancelRef.current; i++) {
                while (pausedRef.current && !cancelRef.current) await sleep(100);
                if (cancelRef.current) break;
                
                if (i % Math.max(1, Math.ceil(fftSteps / 50)) === 0 || i === fftSteps) {
                setClassicalSteps(i);
                setClassicalProgress((i / fftSteps) * 100);
                setClassicalData(generateVisualizationData('classical', i, fftSteps));
                
                if (i % Math.max(1, Math.ceil(fftSteps / 10)) === 0 && i > 0) {
                    const level = Math.floor(Math.log2(i / n + 1));
                    addClassicalLog(`   -- Nivel ${level} de log₂(${n})`, 'info');
                    addClassicalLog(`      ├─ Calculando butterflies...`, 'detail');
                    addClassicalLog(`      └─ Combinando resultados parciales`, 'detail');
                }
                
                ops.iterations = i;
                ops.comparisons = i;
                ops.assignments = i * 2;
                ops.total = i * 4;
                setClassicalOperations(ops);
                
                const elapsedTime = (Date.now() - startTime - totalPausedTimeRef.current) / 1000;
                setClassicalTime(elapsedTime.toFixed(3));
                setClassicalPerformanceData(prev => [...prev, {
                    tiempo: parseFloat(elapsedTime.toFixed(3)),
                    progreso: parseFloat(((i / fftSteps) * 100).toFixed(1))
                }]);
                
                await sleep(baseDelay);
                }
            }
            
            addClassicalLog(``, 'info');
            addClassicalLog(`   FFT completada`, 'success');
        }
        
        // FINALIZACIÓN COMÚN
        if (!cancelRef.current) {
            const finalTime = (Date.now() - startTime - totalPausedTimeRef.current) / 1000;
            setClassicalSteps(ops.iterations);
            setClassicalProgress(100);
            setClassicalTime(finalTime.toFixed(3));
            setClassicalOperations(ops);
            
            addClassicalLog(`*  Tiempo total: ${finalTime.toFixed(3)}s`, 'success');
            addClassicalLog(`+  Total de operaciones: ${ops.total}`, 'success');
            addClassicalLog(`   ├─ Iteraciones: ${ops.iterations}`, 'detail');
            addClassicalLog(`   ├─ Comparaciones: ${ops.comparisons}`, 'detail');
            addClassicalLog(`   └─ Asignaciones: ${ops.assignments}`, 'detail');
        }
    };

    const validateInput = () => {
        if (!selectedAlgorithm || !userInput.trim()) {
            setInputError('Por favor ingresa un valor');
            return false;
        }

        const algo = algorithms[selectedAlgorithm];
        if (!algo.validate(userInput, problemSize)) {
            setInputError('Entrada inválida. Revisa el ejemplo.');
            return false;
        }

        setInputError('');
        return true;
    };

    const startSimulation = async () => {
        if (!validateInput()) return;
        
        // CLEAN
        cancelRef.current = false;
        pausedRef.current = false;
        pauseStartTimeRef.current = 0;
        totalPausedTimeRef.current = 0;
        
        setIsPaused(false);
        setIsSimulating(true);
        setSimulationComplete(false);
        setCurrentPhase('');
        
        // logs
        setQuantumLog([]);
        setClassicalLog([]);
        
        // métricas de ruido
        setQuantumHasNoise(false);
        setErrorRate(0);
        setGateErrors(0);
        setMeasurementError(0);
        
        // métricas de fidelidad
        setFidelity(null);
        setAccuracy(null);
        setSuccessProbability(null);
        
        setQuantumData([]);
        setClassicalData([]);
        setQuantumStateData([]);
        
        setQuantumPerformanceData([]);
        setClassicalPerformanceData([]);
        
        // contadores de pasos y progreso
        setQuantumSteps(0);
        setClassicalSteps(0);
        setQuantumProgress(0);
        setClassicalProgress(0);
        
        // tiempos
        setQuantumTime(0);
        setClassicalTime(0);
        
        // operaciones cuánticas
        setQuantumOperations({
            hadamard: 0,
            oracle: 0,
            diffusion: 0,
            cnot: 0,
            phase: 0,
            measurement: 0,
            total: 0
        });
        
        // Resetear operaciones clásicas
        setClassicalOperations({
            comparisons: 0,
            assignments: 0,
            iterations: 0,
            total: 0
        });
        
        // Resetear estados cuánticos
        setEntanglementLevel(0);
        setSuperpositionStates(0);
        
        await runQuantumSimulation(selectedAlgorithm);
        
        if (cancelRef.current) {
            resetSimulation();
            return;
        }
        
        await sleep(1000);
        
        await runClassicalSimulation(selectedAlgorithm);
        
        if (cancelRef.current) {
            resetSimulation();
            return;
        }
        
        setSimulationComplete(true);
        setCurrentPhase('completed');
        setIsSimulating(false);
    };

    const resetSimulation = () => {
        cancelRef.current = true;
        pausedRef.current = false;
        pauseStartTimeRef.current = 0;
        totalPausedTimeRef.current = 0;
        setIsSimulating(false);
        setIsPaused(false);
        setQuantumSteps(0);
        setClassicalSteps(0);
        setQuantumProgress(0);
        setClassicalProgress(0);
        setQuantumTime(0);
        setClassicalTime(0);
        setQuantumOperations({
            hadamard: 0,
            oracle: 0,
            diffusion: 0,
            cnot: 0,
            phase: 0,
            measurement: 0,
            total: 0
        });
        setClassicalOperations({
            comparisons: 0,
            assignments: 0,
            iterations: 0,
            total: 0
        });
        setQuantumHasNoise(false);
        setErrorRate(0);
        setGateErrors(0);
        setMeasurementError(0);
        setFidelity(null);
        setAccuracy(null);
        setSuccessProbability(null);
        setSimulationComplete(false);
        setCurrentPhase('');
        setQuantumData([]);
        setClassicalData([]);
        setQuantumStateData([]);
        setEntanglementLevel(0);
        setSuperpositionStates(0);
        setQuantumLog([]);
        setClassicalLog([]);
    };

    const togglePause = () => {
        const newPausedState = !isPaused;
        setIsPaused(newPausedState);
        pausedRef.current = newPausedState;
        
        if (newPausedState) {
            pauseStartTimeRef.current = Date.now();
            if (currentPhase === 'quantum') {
                addQuantumLog(`/ Simulación pausada`, 'warning');
            } else {
                addClassicalLog(`/ Simulación pausada`, 'warning');
            }
        } else {
            const pauseDuration = Date.now() - pauseStartTimeRef.current;
            totalPausedTimeRef.current += pauseDuration;
            if (currentPhase === 'quantum') {
                addQuantumLog(`- Simulación reanudada`, 'success');
            } else {
                addClassicalLog(`- Simulación reanudada`, 'success');
            }
        }
    };

    const selectAlgorithm = (key) => {
        setSelectedAlgorithm(key);
        setUserInput(algorithms[key].defaultInput(problemSize));
        setShowAlgorithmDropdown(false);
        setInputError('');
        if (!isSimulating) {
            resetSimulation();
        }
    };

    const downloadReport = () => {
        const report = {
        fecha: new Date().toLocaleString('es-ES'),
        algoritmo: algorithms[selectedAlgorithm].name,
        entrada: userInput,
        configuracion: {
            qubits: qubits,
            tamañoProblema: problemSize,
            modeloRuido: {
                habilitado: noiseEnabled,
                tasaErrorPorPuerta: `${customErrorRate}%`,
                tipoModelo: "Acumulativo - F = (1 - ε)^n"
            }
        },
        resultadoCuantico: {
            nombre: algorithms[selectedAlgorithm].quantumName,
            complejidad: algorithms[selectedAlgorithm].quantumComplexity,
            tiempo: `${quantumTime}s`,
            pasos: quantumSteps,
            operaciones: quantumOperations,
            estadosSuperposicion: superpositionStates,
            nivelEntrelazamiento: `${entanglementLevel.toFixed(1)}%`,
            ruido: {
                presente: quantumHasNoise,
                erroresPuerta: gateErrors,
                erroresMedicion: measurementError,
                tasaErrorEfectiva: `${errorRate.toFixed(2)}%`
            },
            log: quantumLog
        },
        resultadoClasico: {
            nombre: algorithms[selectedAlgorithm].classicalName,
            complejidad: algorithms[selectedAlgorithm].classicalComplexity,
            tiempo: `${classicalTime}s`,
            pasos: classicalSteps,
            operaciones: classicalOperations,
            log: classicalLog
        },
        comparacion: {
            ventajaCuantica: `${quantumAdvantage}x más rápido`,
            diferenciaTiempo: `${(parseFloat(classicalTime) - parseFloat(quantumTime)).toFixed(3)}s`,
            reduccionOperaciones: `${((1 - quantumOperations.total / classicalOperations.total) * 100).toFixed(1)}%`,
            eficienciaCuantica: quantumOperations.total > 0 ? (classicalOperations.total / quantumOperations.total).toFixed(2) + "x" : "N/A"
        }
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `simulacion_cuantica_${selectedAlgorithm}_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    useEffect(() => {
        setProblemSize(Math.pow(2, qubits));
        if (selectedAlgorithm && !isSimulating) {
            setUserInput(algorithms[selectedAlgorithm].defaultInput(Math.pow(2, qubits)));
        }
    }, [qubits]);

    // -------------------- NAVEGADOR --------------------
    return (
        <div className="min-h-screen bg-gray-900 text-white transition-colors duration-300 p-4">
            <div className="max-w-[1900px] mx-auto">
                    <div className="mb-6">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-blue-400 flex items-center gap-2">
                                <Atom /> QtonSimulator
                            </h1>
                        </div>
                    </div>

                <div className="flex gap-6">
                    <div className="flex-1 space-y-6">
                        {/* Selector de Algoritmo */}
                        <div className="bg-gray-800 rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Rocket /> Seleccionar Algoritmo</h2>
                        
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => !isSimulating && setShowAlgorithmDropdown(!showAlgorithmDropdown)}
                                    disabled={isSimulating}
                                    className={
                                        `w-full p-4 rounded-lg border-2 transition-all flex items-center justify-between 
                                        ${selectedAlgorithm
                                            ? 'border-blue-500 bg-blue-500 bg-opacity-10'
                                            : 'border-gray-700 hover:border-gray-600'
                                        } ${isSimulating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`
                                    }
                                >
                                    <div className="flex items-center gap-3">
                                        {selectedAlgorithm ? (
                                        <>
                                            <span className="text-2xl">{algorithms[selectedAlgorithm].icon}</span>
                                            <div className="text-left">
                                                <p className="font-semibold">{algorithms[selectedAlgorithm].name}</p>
                                                <p className="text-xs text-gray-400">{algorithms[selectedAlgorithm].description}</p>
                                            </div>
                                        </>
                                        ) : (
                                            <span className="text-gray-400">Selecciona un algoritmo...</span>
                                        )}
                                    </div>
                                    <span className="text-xl">{showAlgorithmDropdown ? '▲' : '▼'}</span>
                                </button>

                                {showAlgorithmDropdown && !isSimulating && (
                                    <div className="absolute z-10 w-full mt-2 bg-gray-800 rounded-lg shadow-2xl border border-gray-700 overflow-hidden">
                                        {Object.entries(algorithms).map(([key, algo]) => (
                                            <button
                                                key={key}
                                                onClick={() => selectAlgorithm(key)}
                                                className={
                                                    `w-full p-4 text-left transition-all flex items-center gap-3 hover:bg-gray-700 
                                                    ${selectedAlgorithm === key ? 'bg-blue-500 bg-opacity-20' : ''}`
                                                }
                                            >
                                                <span className="text-2xl flex-shrink-0">{algo.icon}</span>
                                                <div>
                                                    <p className="font-semibold">{algo.name}</p>
                                                    <p className="text-xs text-gray-400">{algo.description}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Configuración */}
                            {selectedAlgorithm && (
                                <div className="mt-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            {algorithms[selectedAlgorithm].inputLabel}
                                        </label>
                                        <input
                                            type="text"
                                            value={userInput}
                                            onChange={(e) => {
                                                setUserInput(e.target.value);
                                                setInputError('');
                                            }}
                                            placeholder={algorithms[selectedAlgorithm].inputPlaceholder}
                                            disabled={isSimulating}
                                            className={
                                                `w-full p-3 rounded-lg border-2 transition-all bg-gray-700 
                                                ${inputError ? 'border-red-500' : 'border-gray-600'} 
                                                ${isSimulating ? 'opacity-50 cursor-not-allowed' : ''}`
                                            }
                                        />
                                        {inputError && (
                                            <p className="text-red-500 text-sm mt-2 flex items-center gap-1"><X className="w-4 h-4"/> {inputError}</p>
                                        )}
                                        <div className="flex items-center gap-2 mt-2">
                                            <p className="text-xs text-gray-400 flex-1 flex items-center gap-1">
                                                <Sun className="w-4 h-4" /> {algorithms[selectedAlgorithm].inputExample}
                                            </p>
                                            <button
                                                onClick={() => setShowExamplesModal(true)}
                                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1"
                                            >
                                                <Book className="w-4 h-4" /> Ejemplos
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Número de Qubits: {qubits} (N = 2^{qubits} = {problemSize} elementos)
                                        </label>
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm">3</span>
                                            <input
                                                type="range"
                                                min="3"
                                                max="7"
                                                value={qubits}
                                                onChange={(e) => setQubits(parseInt(e.target.value))}
                                                className="flex-1"
                                                disabled={isSimulating}
                                            />
                                            <span className="text-sm">7</span>
                                            <span className="text-sm font-semibold min-w-16">{qubits} qubits</span>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-700 pt-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <label className="text-sm font-medium flex items-center gap-1"><Noise className="w-4 h-4" /> Ruido</label>
                                            <button
                                                onClick={() => setNoiseEnabled(!noiseEnabled)}
                                                disabled={isSimulating}
                                                className={
                                                    `relative inline-flex h-6 w-11 items-center rounded-full transition-colors 
                                                    ${noiseEnabled ? 'bg-blue-600' : 'bg-gray-600'} 
                                                    ${isSimulating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`
                                                }
                                            >
                                                <span
                                                    className={
                                                        `inline-block h-4 w-4 transform rounded-full bg-white transition-transform 
                                                        ${noiseEnabled ? 'translate-x-6' : 'translate-x-1'}`
                                                    }
                                                />
                                            </button>
                                        </div>

                                        {noiseEnabled && (
                                            <div>
                                                <label className="block text-sm font-medium mb-2">
                                                    Tasa de Error por Puerta: {customErrorRate}%
                                                </label>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-sm">0.1%</span>
                                                    <input
                                                        type="range"
                                                        min="0.1"
                                                        max="5"
                                                        step="0.1"
                                                        value={customErrorRate}
                                                        onChange={(e) => setCustomErrorRate(parseFloat(e.target.value))}
                                                        className="flex-1"
                                                        disabled={isSimulating}
                                                    />
                                                    <span className="text-sm">5%</span>
                                                </div>
                                                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                                                    <Info className="w-4 h-4" /> Rango típico: 0.1% (hardware ideal) a 5% (hardware ruidoso)
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                                    <Warning className="w-4 h-4" /> El error se acumula en cada puerta cuántica aplicada
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Controles */}
                        <div className="bg-gray-800 rounded-xl shadow-lg p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold">Controles</h2>
                                <div className="flex gap-2">
                                    <button
                                        onClick={startSimulation}
                                        disabled={!selectedAlgorithm || isSimulating}
                                        className={
                                            `px-6 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 
                                            ${!selectedAlgorithm || isSimulating
                                                ? 'bg-gray-600 cursor-not-allowed'
                                                : 'bg-green-600 hover:bg-green-700 shadow-lg'
                                            }`
                                        }
                                    >
                                        <Play /> Iniciar
                                    </button>
                                    
                                    {isSimulating && (
                                        <button
                                            onClick={togglePause}
                                            className="px-6 py-3 rounded-lg font-semibold bg-yellow-600 hover:bg-yellow-700 shadow-lg flex items-center justify-center gap-2"
                                        >
                                            {isPaused ?  <><Play /> Reanudar</> :  <><Pause /> Pausar</>}
                                        </button>
                                    )}
                                    
                                    <button
                                        onClick={resetSimulation}
                                        disabled={!isSimulating && !simulationComplete}
                                        className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 
                                            ${!isSimulating && !simulationComplete
                                                ? 'bg-gray-600 cursor-not-allowed'
                                                : 'bg-red-600 hover:bg-red-700 shadow-lg'
                                            }`
                                        }
                                    >
                                        <Refresh /> Resetear
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 flex gap-2"><Lightning className="w-4 h-4" /> Velocidad: {simulationSpeed}x</label>
                                <div className="flex items-center gap-4">
                                    <span className="text-sm">0.5x</span>
                                    <input
                                        type="range"
                                        min="0.5"
                                        max="5"
                                        step="0.5"
                                        value={simulationSpeed}
                                        onChange={(e) => !isSimulating && setSimulationSpeed(parseFloat(e.target.value))}
                                        className="flex-1"
                                        disabled={isSimulating}
                                    />
                                    <span className="text-sm">5x</span>
                                </div>
                            </div>
                        </div>

                        {/* Logs de Ejecución */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Log Cuántico */}
                            <div className="bg-gray-800 rounded-xl shadow-lg p-4 border-2 border-purple-500">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-xl"><Atom /></span>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-purple-300">Log Cuántico</h3>
                                        {selectedAlgorithm && (
                                            <p className="text-xs text-purple-400">{algorithms[selectedAlgorithm].quantumName}</p>
                                        )}
                                    </div>
                                </div>
                                <div 
                                    ref={quantumLogRef}
                                    className="h-96 overflow-y-auto bg-gray-900 rounded-lg p-3 font-mono text-xs space-y-1"
                                >
                                    {quantumLog.length === 0 ? (
                                        <div className="text-gray-500 text-center py-8 flex-1 flex items-center justify-center gap-2">
                                            <Clock className="w-4 h-4" /> Esperando inicio de simulación...
                                        </div>
                                    ) : (
                                        quantumLog.map((log, i) => (
                                            <div key={i} className={`
                                                ${log.type === 'success' ? 'text-green-400' : ''}
                                                ${log.type === 'error' ? 'text-red-400' : ''}
                                                ${log.type === 'warning' ? 'text-yellow-400' : ''}
                                                ${log.type === 'operation' ? 'text-blue-400 font-semibold' : ''}
                                                ${log.type === 'detail' ? 'text-gray-400' : ''}
                                                ${log.type === 'info' ? 'text-gray-300' : ''}
                                            `}>
                                                <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Log Clásico */}
                            <div className="bg-gray-800 rounded-xl shadow-lg p-4 border-2 border-cyan-500">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-xl"><Computer /></span>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-cyan-300">Log Clásico</h3>
                                        {selectedAlgorithm && (
                                            <p className="text-xs text-cyan-400">{algorithms[selectedAlgorithm].classicalName}</p>
                                        )}
                                    </div>
                                </div>
                                <div 
                                    ref={classicalLogRef}
                                    className="h-96 overflow-y-auto bg-gray-900 rounded-lg p-3 font-mono text-xs space-y-1"
                                >
                                    {classicalLog.length === 0 ? (
                                        <div className="text-gray-500 text-center py-8 flex items-center justify-center gap-2">
                                            <Clock className="w-4 h-4"  /> Esperando fase clásica...
                                        </div>
                                    ) : (
                                        classicalLog.map((log, i) => (
                                            <div key={i} className={`
                                                ${log.type === 'success' ? 'text-green-400' : ''}
                                                ${log.type === 'error' ? 'text-red-400' : ''}
                                                ${log.type === 'warning' ? 'text-yellow-400' : ''}
                                                ${log.type === 'operation' ? 'text-blue-400 font-semibold' : ''}
                                                ${log.type === 'detail' ? 'text-gray-400' : ''}
                                                ${log.type === 'info' ? 'text-gray-300' : ''}
                                            `}>
                                                <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Graficas */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-800 rounded-xl shadow-lg p-4 border-2 border-purple-500">
                                <h3 className="font-bold text-purple-300 mb-3 flex gap-2"><Atom /> Visualización Cuántica</h3>
                                <div className="h-48 flex items-end justify-around gap-1">
                                    {quantumData.length > 0 ? (
                                        quantumData.map((bar, i) => (
                                            <div
                                                key={i}
                                                className={
                                                    `flex-1 transition-all duration-300 rounded-t 
                                                    ${bar.highlighted ? 'bg-yellow-400' : 'bg-purple-400'}`
                                                }
                                                style={{ height: `${bar.height}%`, opacity: 0.7 + (bar.height / 200) }}
                                            />
                                        ))
                                    ) : (
                                        <div className="flex items-center justify-center w-full h-full text-purple-400">
                                            Sin datos
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-gray-800 rounded-xl shadow-lg p-4 border-2 border-cyan-500">
                                <h3 className="font-bold text-cyan-300 mb-3 flex gap-2"><Computer /> Visualización Clásica</h3>
                                <div className="h-48 flex items-end justify-around gap-1">
                                    {classicalData.length > 0 ? (
                                        classicalData.map((bar, i) => (
                                            <div
                                                key={i}
                                                className={
                                                    `flex-1 transition-all duration-300 rounded-t 
                                                    ${bar.highlighted ? 'bg-yellow-400' : bar.checked ? 'bg-cyan-600' : 'bg-cyan-400'}`
                                                }
                                                style={{ height: `${bar.height}%`, opacity: bar.checked ? 0.5 : 0.9 }}
                                            />
                                        ))
                                    ) : (
                                        <div className="flex items-center justify-center w-full h-full text-cyan-400">
                                            Sin datos
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Panel derecho */}
                    <div className="w-96 space-y-6">
                        {/* Operaciones Cuánticas */}
                        <div className="bg-gray-800 rounded-xl shadow-lg p-6 border-2 border-purple-500">
                            <h2 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2"><Atom /> Operaciones Cuánticas</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">Hadamard (H):</span>
                                    <span className="font-bold text-purple-300">{quantumOperations.hadamard}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">Oracle (Uf):</span>
                                    <span className="font-bold text-purple-300">{quantumOperations.oracle}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">Diffusion (D):</span>
                                    <span className="font-bold text-purple-300">{quantumOperations.diffusion}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">Measurement:</span>
                                    <span className="font-bold text-purple-300">{quantumOperations.measurement}</span>
                                </div>
                                <div className="border-t border-gray-700 pt-2 mt-2">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold">Total:</span>
                                        <span className="font-bold text-xl text-purple-400">{quantumOperations.total}</span>
                                    </div>
                                </div>
                                <div className="bg-purple-900 bg-opacity-30 rounded p-3 mt-3">
                                    <p className="text-xs text-gray-400 mb-1">Tiempo de ejecución</p>
                                    <p className="text-2xl font-bold text-purple-300">{quantumTime}s</p>
                                </div>
                            </div>
                        </div>

                        {/* Operaciones Clásicas */}
                        <div className="bg-gray-800 rounded-xl shadow-lg p-6 border-2 border-cyan-500">
                            <h2 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2"><Computer /> Operaciones Clásicas</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">Iteraciones:</span>
                                    <span className="font-bold text-cyan-300">{classicalOperations.iterations}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">Comparaciones:</span>
                                    <span className="font-bold text-cyan-300">{classicalOperations.comparisons}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">Asignaciones:</span>
                                    <span className="font-bold text-cyan-300">{classicalOperations.assignments}</span>
                                </div>
                                <div className="border-t border-gray-700 pt-2 mt-2">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold">Total:</span>
                                        <span className="font-bold text-xl text-cyan-400">{classicalOperations.total}</span>
                                    </div>
                                </div>
                                <div className="bg-cyan-900 bg-opacity-30 rounded p-3 mt-3">
                                    <p className="text-xs text-gray-400 mb-1">Tiempo de ejecución</p>
                                    <p className="text-2xl font-bold text-cyan-300">{classicalTime}s</p>
                                </div>
                            </div>
                        </div>

                        {/* Comparaciones métodos */}
                        {fidelity !== null && (
                            <>
                                <div className="bg-gradient-to-r from-purple-900 to-purple-800 rounded-xl shadow-lg p-6 border-2 border-purple-500">
                                    <h2 className="text-xl font-bold mb-4">Fidelidad del Estado Cuántico</h2>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-xs text-gray-400 mb-1">Fidelidad F = (1 - ε)^n</p>
                                            <p className="text-4xl font-bold text-purple-300">
                                                {fidelity.toFixed(2)}%
                                            </p>
                                            {fidelity < 100 ? (
                                                <div className="mt-2 text-xs space-y-1">
                                                    <p className="text-yellow-400 flex items-center gap-1"><Warning className="w-4 h-4" /> Estado degradado por ruido acumulativo</p>
                                                    <p className="text-gray-400">• Errores de puerta: {gateErrors}</p>
                                                    <p className="text-gray-400">• Errores de medición: {measurementError}</p>
                                                    <p className="text-gray-400">• Total operaciones: {quantumOperations.total}</p>
                                                    <p className="text-gray-400">• Error efectivo: {errorRate.toFixed(2)}%</p>
                                                    <p className="text-gray-400">• Degradación: {(100 - fidelity).toFixed(2)}%</p>
                                                </div>
                                            ) : (
                                                <p className="text-xs text-green-400 mt-2 flex items-center gap-1"><Badge className="w-4 h-4" /> Estado ideal sin errores (F = 100%)</p>
                                            )}
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-3">
                                            <div 
                                                className={
                                                    `h-3 rounded-full transition-all 
                                                    ${fidelity >= 95 ? 'bg-green-500' :
                                                        fidelity >= 80 ? 'bg-yellow-500' :
                                                        'bg-red-500'
                                                    }`
                                                }
                                                style={{ width: `${fidelity}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-xl shadow-lg p-6 border-2 border-blue-500">
                                    <h2 className="text-xl font-bold mb-4 flex items-center gap-1"><Badge className="w-4 h-4" /> Exactitud y Precisión</h2>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-xs text-gray-400 mb-1">Exactitud del resultado</p>
                                            <p className="text-3xl font-bold text-blue-300">
                                                {accuracy.toFixed(2)}%
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 mb-1">Probabilidad de éxito teórica</p>
                                            <p className="text-2xl font-bold text-blue-300">
                                                {successProbability.toFixed(2)}%
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-green-900 to-green-800 rounded-xl shadow-lg p-6 border-2 border-green-500">
                                    <h2 className="text-xl font-bold mb-4 flex items-center gap-1"><Lightning /> Eficiencia Computacional</h2>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-xs text-gray-400 mb-1">Reducción de operaciones</p>
                                            <p className="text-3xl font-bold text-green-300">
                                                {((1 - quantumOperations.total / classicalOperations.total) * 100).toFixed(1)}%
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 mb-1">Ahorro de tiempo</p>
                                            <p className="text-2xl font-bold text-green-300">
                                                {(parseFloat(classicalTime) - parseFloat(quantumTime)).toFixed(3)}s
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 mb-1">Complejidad</p>
                                            <p className="text-sm text-green-300">
                                                {algorithms[selectedAlgorithm].quantumComplexity} vs {algorithms[selectedAlgorithm].classicalComplexity}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Exportar */}
                        <div className="bg-gray-800 rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Save /> Exportar
                            </h2>
                            <button
                                onClick={downloadReport}
                                disabled={!simulationComplete}
                                className={
                                    `w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all
                                    ${ !simulationComplete
                                        ? 'bg-gray-600 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700 shadow-lg'
                                    }`
                                }
                            >
                                <Download /> Descargar Reporte Completo
                            </button>
                            {!simulationComplete && (
                                <p className="text-xs text-center mt-2 text-gray-500">
                                    Completa la simulación primero
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Modales de ejemplos */}
                {showExamplesModal && selectedAlgorithm && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">{algorithms[selectedAlgorithm].icon} {algorithms[selectedAlgorithm].name}</h3>
                                    <p className="text-blue-100">{algorithms[selectedAlgorithm].helpText}</p>
                                </div>
                                <button
                                    onClick={() => setShowExamplesModal(false)}
                                    className="text-white hover:text-red-500 hover:bg-white hover:bg-opacity-20 rounded-lg p-2"
                                >
                                    <X />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="p-4 rounded-lg bg-gray-700">
                            <h4 className="font-semibold mb-2 flex items-center gap-2"><Info className="w-4 h-4" /> Descripción</h4>
                            <p className="text-gray-300">{algorithms[selectedAlgorithm].helpDescription}</p>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-3 flex items-center gap-2"><Book /> Ejemplos:</h4>
                                <div className="space-y-3">
                                    {algorithms[selectedAlgorithm].examples.map((example, index) => (
                                        <div
                                            key={index}
                                            className="p-4 rounded-lg border-2 border-gray-700 hover:border-blue-500 transition-all cursor-pointer"
                                            onClick={() => {
                                                setUserInput(example.input);
                                                setShowExamplesModal(false);
                                                setInputError('');
                                            }}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="px-3 py-1 rounded font-mono text-sm font-bold bg-blue-900 text-blue-300">
                                                    {example.input}
                                                </div>
                                                <p className="text-sm text-gray-300 flex-1">{example.explanation}</p>
                                                <span className="text-xl">→</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="p-4 rounded-lg bg-purple-900 bg-opacity-30 border-l-4 border-purple-500">
                                <h4 className="font-semibold mb-2 text-purple-400 flex items-center gap-2"><Warning />Importancia</h4>
                                <p className="text-gray-300">{algorithms[selectedAlgorithm].whyItMatters}</p>
                            </div>

                            <button
                                onClick={() => setShowExamplesModal(false)}
                                className="w-full py-3 rounded-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            >
                                Entendido
                            </button>
                        </div>
                    </div>
                </div>
                )}
            </div>
        </div>
    );
};

export default QuantumSimulator;