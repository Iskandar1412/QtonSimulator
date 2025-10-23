import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Icons from './Icons';

// =============================================
// === MOTOR CUÁNTICO - Estados y Compuertas ===
// =============================================
class QuantumState {
	constructor(numQubits, noiseRate = 0) {
		this.numQubits = numQubits;
		this.numStates = Math.pow(2, numQubits);
		this.noiseRate = noiseRate / 100;
		this.amplitudes = new Array(this.numStates).fill(0);
		this.amplitudes[0] = 1; // Estado inicial
		this.gateErrors = 0;
	}

	// La función va a aplicar compuertas hadamardd a todos los cúbitss creando una superposición uniforme
	applyHadamardAll() {
		const newAmplitudes = new Array(this.numStates).fill(0);
		const amplitude = 1 / Math.sqrt(this.numStates);

		for (let i = 0; i < this.numStates; i++) {
			newAmplitudes[i] = amplitude;

			// Simular error de puerta
			if (Math.random() < this.noiseRate) {
				newAmplitudes[i] *= 0.95 + Math.random() * 0.1;
				this.gateErrors++;
			}
		}

		this.amplitudes = newAmplitudes;
		return this.gateErrors;
	}

	// Aplicar Oráculo - Marcar el estado objetivo invirtiendo su fase
	applyOracle(targetState) {
		this.amplitudes[targetState] *= -1;

		if (Math.random() < this.noiseRate) {
			const wrongState = Math.floor(Math.random() * this.numStates);
			this.amplitudes[wrongState] *= -1;
			this.gateErrors++;
		}
	}

	// Aplicar Diffusion (Inversión sobre la media)
	applyDiffusion() {
		const mean = this.amplitudes.reduce((sum, amp) => sum + amp, 0) / this.numStates;

		for (let i = 0; i < this.numStates; i++) {
			this.amplitudes[i] = 2 * mean - this.amplitudes[i];

			if (Math.random() < this.noiseRate) {
				this.amplitudes[i] += (Math.random() - 0.5) * 0.1;
				this.gateErrors++;
			}
		}
	}

	// Medir el estado (colapsar a un valor basado en probabilidades)
	measure() {
		const probabilities = this.amplitudes.map((amp) => amp * amp);
		const totalProb = probabilities.reduce((sum, p) => sum + p, 0);

		const normalizedProbs = probabilities.map((p) => p / totalProb);

		let random = Math.random();
		let cumulative = 0;

		for (let i = 0; i < this.numStates; i++) {
			cumulative += normalizedProbs[i];
			if (random <= cumulative) {
				return i;
			}
		}

		return 0;
	}

	// Obtener probabilidades de cada estado
	getProbabilities() {
		return this.amplitudes.map((amp, i) => ({
			state: i,
			amplitude: amp,
			probability: amp * amp
		}));
	}

	// Calcular fidelidad (qué tan cerca está del estado ideal)
	getFidelity() {
		const idealProb = 1 / this.numStates;
		const actualProbs = this.amplitudes.map((amp) => amp * amp);
		const sumSquaredDiff = actualProbs.reduce((sum, p) => sum + Math.pow(p - idealProb, 2), 0);
		return Math.max(0, 100 - sumSquaredDiff * 100);
	}

	// Calcular fidelidad específica para Grover (después de iteraciones)
	getGroverFidelity(targetState) {
		const targetProb = this.amplitudes[targetState] * this.amplitudes[targetState];

		const idealTargetProb = 1.0;
		const fidelity = 100 - Math.abs(idealTargetProb - targetProb) * 100;

		const errorPenalty = (this.gateErrors / this.numStates) * 100;

		return Math.max(0, fidelity - errorPenalty);
	}

	// Calidad del estado (qué tan concentrada está la probabilidad en el objetivo)
	getStateQuality(targetState) {
		const probabilities = this.amplitudes.map((amp) => amp * amp);
		const targetProb = probabilities[targetState];

		const totalProb = probabilities.reduce((sum, p) => sum + p, 0);
		const normalizedProbs = probabilities.map((p) => p / totalProb);
		const normalizedTargetProb = normalizedProbs[targetState];

		// Calcular entropía (qué tan distribuida está la probabilidad)
		let entropy = 0;
		for (let prob of normalizedProbs) {
			if (prob > 0.0001) { // Entropía no debe ser nunca 0
				entropy -= prob * Math.log2(prob);
			}
		}

		// Normalizar: 0 entropía = 100% calidad, máxima entropía = 0% calidad
		const maxEntropy = Math.log2(this.numStates);
		const quality = 100 * (1 - entropy / maxEntropy);

		const maxProb = Math.max(...normalizedProbs);
		const targetIsMax = normalizedTargetProb === maxProb;

		return {
			quality: Math.min(100, quality).toFixed(2),
			targetProbability: Math.min(100, normalizedTargetProb * 100).toFixed(2),
			isTargetMax: targetIsMax
		};
	}
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
const QuantumSimulator = () => {
	const [selectedAlgorithm, setSelectedAlgorithm] = useState('');
	const [userInput, setUserInput] = useState('');
	const [qubits, setQubits] = useState(5);
	const [problemSize, setProblemSize] = useState(32);
	const [simulationSpeed, setSimulationSpeed] = useState(1);
	const [isSimulating, setIsSimulating] = useState(false);
	const [isPaused, setIsPaused] = useState(false);
	const [database, setDatabase] = useState([]);
	const [quantumResult, setQuantumResult] = useState(null);
	const [classicalResult, setClassicalResult] = useState(null);
	const [quantumLogs, setQuantumLogs] = useState([]);
	const [classicalLogs, setClassicalLogs] = useState([]);
	const [quantumProgress, setQuantumProgress] = useState(0);
	const [classicalProgress, setClassicalProgress] = useState(0);
	const [inputError, setInputError] = useState('');
	const [noiseEnabled, setNoiseEnabled] = useState(true);
	const [customErrorRate, setCustomErrorRate] = useState(1);
	const [quantumStateData, setQuantumStateData] = useState([]);
	const [showQuantumState, setShowQuantumState] = useState(false);
	const { Atom, Search, Numbers, Lightning, Wave, Refresh, Save, Rocket, Info, Noise, Chart, Warning, Check, X, Computer, Trophy, TrendingUp, Download, Clipboard, Bulb, Cog, ArrowRight, Sun, Moon, ChevronUp, ChevronDown, Play, Pause, Book, Clock, Badge } = Icons;


	const cancelRef = useRef(false);
	const pausedRef = useRef(false);

	const algorithms = {
		grover: {
			name: 'Grover (Búsqueda)',
			quantumName: 'Búsqueda Cuántica de Grover',
			classicalName: 'Búsqueda Lineal Clásica',
			description: 'Busca un elemento específico en una base de datos no ordenada',
			inputLabel: 'Posición a buscar (0 a N-1)',
			inputPlaceholder: 'Ej: 15',
			quantumComplexity: 'O(√N)',
			classicalComplexity: 'O(N)',
			needsInput: true,
			validate: (val, size) => {
				const num = parseInt(val);
				return !isNaN(num) && num >= 0 && num < size;
			},
			defaultInput: (size) => Math.floor(Math.random() * size).toString()
		},
		shor: {
			name: 'Shor (Factorización)',
			quantumName: 'Factorización Cuántica de Shor',
			classicalName: 'Factorización por Prueba y Error',
			description: 'Encuentra los factores primos de un número compuesto',
			inputLabel: 'Número a factorizar',
			inputPlaceholder: 'Ej: 143',
			quantumComplexity: 'O((log N)³)',
			classicalComplexity: 'O(√N)',
			needsInput: true,
			validate: (val) => {
				const num = parseInt(val);
				return !isNaN(num) && num > 15 && num % 2 !== 0 && num < 1000;
			},
			defaultInput: () => [21, 35, 77, 143, 221, 323][Math.floor(Math.random() * 6)].toString()
		}
	};

	// DB con datos aleatorios
	const generateDatabase = (size) => {
		const data = [];
		for (let i = 0; i < size; i++) {
			data.push({
				index: i,
				value: Math.floor(Math.random() * 1000)
			});
		}
		return data;
	};

	useEffect(() => {
		const newSize = Math.pow(2, qubits);
		setProblemSize(newSize);
		const newDb = generateDatabase(newSize);
		setDatabase(newDb);
		if (selectedAlgorithm && !isSimulating) {
			if (algorithms[selectedAlgorithm].needsInput) {
				setUserInput(algorithms[selectedAlgorithm].defaultInput(newSize));
			}
		}
	}, [qubits]);

	// Generación db para grover
	useEffect(() => {
		if (selectedAlgorithm) {
			if (selectedAlgorithm === 'grover') {
				const newDb = generateDatabase(problemSize);
				setDatabase(newDb);
			} else {
				setDatabase([]);
			}
			if (algorithms[selectedAlgorithm].needsInput) {
				setUserInput(algorithms[selectedAlgorithm].defaultInput(problemSize));
			}
		}
	}, [selectedAlgorithm]);

	const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

	const addQuantumLog = (message, type = 'info') => {
		setQuantumLogs((prev) => [
			...prev,
			{
				timestamp: new Date().toLocaleTimeString('es-ES', { hour12: false }),
				message,
				type
			}
		]);
	};

	const addClassicalLog = (message, type = 'info') => {
		setClassicalLogs((prev) => [
			...prev,
			{
				timestamp: new Date().toLocaleTimeString('es-ES', { hour12: false }),
				message,
				type
			}
		]);
	};

	// =============================================
	// ============== GROVER CUÁNTICO ==============
	// =============================================
	const runGroverQuantum = async (target) => {
		const startTime = performance.now();
		const iterations = Math.ceil((Math.PI / 4) * Math.sqrt(problemSize));
		let operations = {
			hadamard: 0,
			oracle: 0,
			diffusion: 0,
			measurement: 0,
			total: 0
		};

		addQuantumLog(` Iniciando Algoritmo de Grover`, 'operation');
		addQuantumLog(` Objetivo: Buscar posición ${target} en ${problemSize} elementos`);
		addQuantumLog(` ${qubits} qubits → ${problemSize} estados cuánticos posibles`);
		await sleep(300 / simulationSpeed); // 500

		// -------------- Crear estado cuántico
		addQuantumLog(`   PASO 1: Inicializando ${qubits} qubits en estado |0⟩`, 'operation');
		const quantumState = new QuantumState(qubits, noiseEnabled ? customErrorRate : 0);
		await sleep(200 / simulationSpeed); // 500

		// -------------- Aplicar Hadamard a todos los qubits
		addQuantumLog(`   PASO 2: Aplicando ${qubits} compuertas Hadamard`, 'operation');
		addQuantumLog(`   └─ Creando SUPERPOSICIÓN UNIFORME de ${problemSize} estados`);
		const hadamardErrors = quantumState.applyHadamardAll();
		operations.hadamard = qubits;
		operations.total += qubits;

		if (noiseEnabled && hadamardErrors > 0) {
			addQuantumLog(`   └─ ! ${hadamardErrors} error(es) en puertas Hadamard`, 'warning');
		} else if (!noiseEnabled) {
			addQuantumLog(`   └─ ✓ Ejecución perfecta (condiciones ideales)`);
		}

		// Estado cuántico después de Hadamard
		const afterHadamard = quantumState.getProbabilities();
		setQuantumStateData(afterHadamard);
		setShowQuantumState(true);
		addQuantumLog(`   └─ Todos los estados tienen amplitud ≈ ${(1 / Math.sqrt(problemSize)).toFixed(4)}`);
		await sleep(400 / simulationSpeed); // 1000

		// -------------- Iteraciones de Grover
		addQuantumLog(`   PASO 3: Ejecutando ${iterations} iteraciones de Grover`, 'operation');

		for (let iter = 0; iter < iterations && !cancelRef.current; iter++) {
			while (pausedRef.current && !cancelRef.current) {
				await sleep(50); // 100
			}

			addQuantumLog(`   - ===== Iteración ${iter + 1}/${iterations} =====`, 'operation');

			// Oráculo: Marcar el estado objetivo
			addQuantumLog(`      └─ °  Aplicando Oracle a estado |${target}⟩`);
			addQuantumLog(`         └─ Operación: |${target}⟩ → -|${target}⟩ (inversión de fase)`);
			quantumState.applyOracle(target);
			operations.oracle++;
			operations.total++;

			// Cambio de amplitud
			const probAfterOracle = quantumState.getProbabilities()[target].probability;
			addQuantumLog(`         └─ Probabilidad de |${target}⟩: ${(probAfterOracle * 100).toFixed(2)}%`);
			await sleep(150 / simulationSpeed); // 600

			// Difusión: Amplificar amplitud del objetivo
			addQuantumLog(`      └─ °  Aplicando Diffusion Operator`);
			addQuantumLog(`         └─ Paso 1: Hadamard a todos los qubits (${qubits} compuertas H)`);
			addQuantumLog(`         └─ Paso 2: Inversión condicional (compuerta Z)`);
			addQuantumLog(`         └─ Paso 3: Hadamard nuevamente (${qubits} compuertas H)`);
			addQuantumLog(`         └─ Resultado: Amplificación de amplitud del estado marcado`);
			quantumState.applyDiffusion();
			operations.diffusion += qubits * 2;
			operations.total += qubits * 2;

			// Visualización del estado cuántico
			const currentProbs = quantumState.getProbabilities();
			setQuantumStateData(currentProbs);

			const probAfterDiff = currentProbs[target].probability;
			addQuantumLog(`         └─ Probabilidad de |${target}⟩: ${(probAfterDiff * 100).toFixed(2)}%`);

			setQuantumProgress(((iter + 1) / iterations) * 100);
			await sleep(200 / simulationSpeed); // 900
		}

		// -------------- Medición
		addQuantumLog(`   PASO 4: MIDIENDO estado cuántico...`, 'operation');
		addQuantumLog(`   └─ Colapsando superposición → estado clásico`);
		const measured = quantumState.measure();
		operations.measurement = 1;
		operations.total++;

		const time = (performance.now() - startTime) / 1000;
		const success = measured === target;
		const fidelity = quantumState.getGroverFidelity(target);
		const stateQuality = quantumState.getStateQuality(target);

		if (success) {
			addQuantumLog(`✓  ÉXITO: Elemento encontrado en posición ${measured}`, 'success');
			addQuantumLog(`   └─ Valor: ${database[measured].value}`);
			addQuantumLog(`   └─ Probabilidad del objetivo: ${stateQuality.targetProbability}%`);
			addQuantumLog(`   └─ Calidad del estado cuántico: ${stateQuality.quality}%`);
			if (noiseEnabled && quantumState.gateErrors > 0) {
				addQuantumLog(`   └─ Éxito a pesar de ${quantumState.gateErrors} errores de puerta`);
			} else if (!noiseEnabled) {
				addQuantumLog(`   └─ Ejecución perfecta sin errores`);
			}
		} else {
			addQuantumLog(`✕  ERROR: Medición incorrecta → posición ${measured} (esperado: ${target})`, 'error');
			addQuantumLog(`   └─ Probabilidad del objetivo: ${stateQuality.targetProbability}%`);
			addQuantumLog(`   └─ Calidad del estado: ${stateQuality.quality}%`);
			if (noiseEnabled && quantumState.gateErrors > 0) {
				addQuantumLog(`   └─ Causado por ruido cuántico (${quantumState.gateErrors} errores de puerta)`);
			} else {
				// En caso que haya fallo sin ruido, es más a nivel estadístico
				addQuantumLog(`   └─ Error numérico de punto flotante`);
			}
		}

		return {
			found: measured,
			success,
			time: time.toFixed(3),
			iterations,
			operations,
			gateErrors: quantumState.gateErrors,
			fidelity: fidelity.toFixed(2),
			stateQuality: stateQuality,
			stateData: quantumState.getProbabilities()
		};
	};

	// =============================================
	// ========== BÚSQUEDA LINEAL CLÁSICA ==========
	// =============================================
	const runLinearSearchClassical = async (target) => {
		const startTime = performance.now();
		let operations = { comparisons: 0, assignments: 0, total: 0 };

		addClassicalLog(`  Iniciando Búsqueda Lineal Clásica`);
		addClassicalLog(`  Objetivo: Buscar posición ${target}`);
		addClassicalLog(`  Revisando ${problemSize} elementos uno por uno`);
		await sleep(200 / simulationSpeed);

		let found = -1;

		const baseDelayPerLog = 150; // 100
		const baseDelayPerComparison = 35; // 20
		const detailInterval = Math.max(1, Math.ceil(problemSize / 30));

		for (let i = 0; i < database.length && !cancelRef.current; i++) {
			while (pausedRef.current && !cancelRef.current) {
				await sleep(100);
			}

			operations.comparisons++;
			operations.total++;

			if (i % detailInterval === 0 || i === target || i === database.length - 1) {
				addClassicalLog(`   i=${i}: Comparando arr[${i}] (${database[i].value}) == ${target}? → ${i === target ? 'SÍ ✓' : 'NO ✗'}`);
				setClassicalProgress((i / problemSize) * 100);
				await sleep(baseDelayPerLog / simulationSpeed);
			} else {
				await sleep(baseDelayPerComparison / simulationSpeed);
			}

			if (i === target) {
				found = i;
				operations.assignments++;
				operations.total++;
				addClassicalLog(`✓  ENCONTRADO en posición ${i} después de ${i + 1} comparaciones`, 'success');
				addClassicalLog(`   └─ Valor: ${database[i].value}`);
				addClassicalLog(`   └─ Total de operaciones: ${operations.total}`);
				break;
			}
		}

		const time = (performance.now() - startTime) / 1000;

		if (found === -1) {
			addClassicalLog(`✗ Elemento no encontrado después de revisar todos los ${problemSize} elementos`, 'error');
		}

		return {
			found,
			success: found === target,
			time: time.toFixed(3),
			iterations: found !== -1 ? found + 1 : problemSize,
			operations
		};
	};

	// =============================================
	// =============== SHOR CUÁNTICO ===============
	// =============================================
	const runShorQuantum = async (N) => {
		const startTime = performance.now();
		let operations = { qft: 0, modular: 0, measurement: 0, total: 0 };
		let gateErrors = 0;

		addQuantumLog(`-   Iniciando Algoritmo de Shor`, 'operation');
		addQuantumLog(`    Factorizando N = ${N}`);
		addQuantumLog(`    Usando ${qubits} qubits para el cálculo cuántico`);
		await sleep(100 / simulationSpeed); // 500

		// ----------- Paso 1
		addQuantumLog(`    PASO 1: Seleccionar base 'a' coprimo con N`, 'operation');
		let a = 2 + Math.floor(Math.random() * (N - 3));
		while (gcd(a, N) !== 1 && a < N) {
			a++;
		}
		addQuantumLog(`   └─ Probando a = ${a}`);
		addQuantumLog(`   └─ Verificando: gcd(${a}, ${N}) = ${gcd(a, N)}`);
		addQuantumLog(`   └─ ✓ Seleccionado a = ${a} (coprimo con ${N})`);
		await sleep(200 / simulationSpeed); // 600

		// ----------- Paso 2
		addQuantumLog(`   PASO 2: Crear superposición cuántica`, 'operation');
		addQuantumLog(`   └─ Inicializando ${qubits} qubits en |0⟩`);
		addQuantumLog(`   └─ Aplicando ${qubits} compuertas Hadamard`);
		addQuantumLog(`   └─ Resultado: Superposición uniforme de ${Math.pow(2, qubits)} estados`);
		operations.qft = qubits;
		operations.total += qubits;

		if (noiseEnabled) {
			for (let i = 0; i < qubits; i++) {
				if (Math.random() * 100 < customErrorRate) {
					gateErrors++;
				}
			}
			if (gateErrors > 0) {
				addQuantumLog(`      └─ (!) ${gateErrors} error(es) en Hadamard`, 'warning');
			}
		} else {
			addQuantumLog(`      └─ ✓ Ejecución perfecta (condiciones ideales)`);
		}
		setQuantumProgress(25);
		await sleep(300 / simulationSpeed); // 900

		// ----------- Paso 3
		addQuantumLog(`   PASO 3: Exponenciación Modular Cuántica`, 'operation');
		addQuantumLog(`   └─ Calculando f(x) = a^x mod N = ${a}^x mod ${N}`);
		addQuantumLog(`   └─ Usando ${qubits * 2} operaciones cuánticas (compuertas controladas)`);
		addQuantumLog(`   └─ Cada operación realiza: |x⟩|0⟩ → |x⟩|a^x mod N⟩`);
		operations.modular = qubits * 2;
		operations.total += operations.modular;

		if (noiseEnabled && Math.random() * 100 < customErrorRate) {
			gateErrors++;
			addQuantumLog(`      └─ (!) Error en exponenciación modular`, 'warning');
		} else if (!noiseEnabled) {
			addQuantumLog(`      └─ ✓ Ejecución perfecta`);
		}
		setQuantumProgress(50);
		await sleep(1000 / simulationSpeed);

		// ----------- Paso 4
		addQuantumLog(`   PASO 4: Transformada Cuántica de Fourier (QFT)`, 'operation');
		addQuantumLog(`   └─ Aplicando QFT para encontrar periodicidad`);
		addQuantumLog(`   └─ Complejidad: O(n²) = ${qubits}² = ${qubits * qubits} operaciones`);

		// Simular aplicación de compuertas de QFT
		for (let i = 0; i < qubits; i++) {
			addQuantumLog(`      └─ Procesando qubit ${i + 1}/${qubits}: Rotaciones de fase`);
			await sleep(100 / simulationSpeed); // 400
		}

		operations.qft += qubits * qubits;
		operations.total += qubits * qubits;

		let qftErrors = 0;
		if (noiseEnabled) {
			for (let i = 0; i < qubits * qubits; i++) {
				if (Math.random() * 100 < customErrorRate) {
					qftErrors++;
				}
			}
			gateErrors += qftErrors;
			if (qftErrors > 0) {
				addQuantumLog(`      └─ (!) ${qftErrors} error(es) en QFT`, 'warning');
			}
		} else {
			addQuantumLog(`      └─ ✓ QFT ejecutado perfectamente`);
		}
		setQuantumProgress(75);
		await sleep(800 / simulationSpeed);

		// ----------- Paso 5
		addQuantumLog(`   PASO 5: Medición y Cálculo del Periodo`, 'operation');
		addQuantumLog(`   └─ Midiendo estado cuántico...`);
		const period = findPeriod(a, N);
		addQuantumLog(`   └─ Periodo encontrado: r = ${period}`);
		addQuantumLog(`   └─ Verificación: ${a}^${period} mod ${N} = ${modPow(a, period, N)}`);
		operations.measurement = 1;
		operations.total++;
		setQuantumProgress(90);
		await sleep(150 / simulationSpeed); // 700

		// ----------- Paso 6
		addQuantumLog(`   PASO 6: Cálculo Clásico de Factores`, 'operation');
		let factors = null;

		addQuantumLog(`   └─ Verificando si r = ${period} es par...`);
		if (period % 2 === 0) {
			addQuantumLog(`   └─ ✓ r es par, continuando...`);
			const x = modPow(a, period / 2, N);
			addQuantumLog(`   └─ Calculando x = ${a}^(${period}/2) mod ${N} = ${x}`);

			const factor1 = gcd(x - 1, N);
			const factor2 = gcd(x + 1, N);
			addQuantumLog(`   └─ Calculando gcd(${x - 1}, ${N}) = ${factor1}`);
			addQuantumLog(`   └─ Calculando gcd(${x + 1}, ${N}) = ${factor2}`);

			if (factor1 > 1 && factor1 < N) {
				factors = [factor1, N / factor1];
				addQuantumLog(`✓  FACTORES ENCONTRADOS: ${N} = ${factors[0]} × ${factors[1]}`, 'success');
				addQuantumLog(`   └─ Total de operaciones cuánticas: ${operations.total}`);
			} else {
				addQuantumLog(`   └─ ✗ Factores triviales, intento fallido`, 'warning');
			}
		} else {
			addQuantumLog(`   └─ ✗ r es impar, no se pueden calcular factores`, 'warning');
		}

		if (!factors) {
			addQuantumLog(`(!) Intento fallido - periodo impar o factores triviales`, 'warning');
			addQuantumLog(`   └─ En un caso real, se reintentaría con otro valor de 'a'`);
			factors = [1, N];
		}

		const time = (performance.now() - startTime) / 1000;
		setQuantumProgress(100);

		return {
			factors,
			success: factors[0] > 1,
			time: time.toFixed(3),
			period,
			operations,
			gateErrors,
			fidelity: ((1 - customErrorRate / 100) ** operations.total * 100).toFixed(2)
		};
	};

	// ============================================
	// FACTORIZACIÓN CLÁSICA
	// ============================================
	const runTrialDivisionClassical = async (N) => {
		const startTime = performance.now();
		let operations = { divisions: 0, modulos: 0, total: 0 };

		addClassicalLog(`    Iniciando Factorización por Prueba y Error`);
		addClassicalLog(`    Factorizando N = ${N}`);
		addClassicalLog(`    Probando divisores desde 2 hasta √${N} = ${Math.floor(Math.sqrt(N))}`);
		addClassicalLog(`    Algoritmo: for (i=2; i<=√N; i++) { if (N % i == 0) return [i, N/i]; }`);
		await sleep(500 / simulationSpeed);

		let factors = null;
		const limit = Math.floor(Math.sqrt(N));
		const logInterval = Math.max(1, Math.ceil(limit / 30));

		for (let i = 2; i <= limit && !cancelRef.current; i++) {
			while (pausedRef.current && !cancelRef.current) {
				await sleep(300); // 100
			}

			operations.divisions++;
			operations.modulos++;
			operations.total += 2;

			if (i % logInterval === 0 || i === 2 || N % i === 0) {
				const remainder = N % i;
				addClassicalLog(`-  i=${i}: ¿${N} % ${i} == 0? → ${N} % ${i} = ${remainder} ${remainder === 0 ? '✓ SÍ' : '✗ NO'}`);
				setClassicalProgress((i / limit) * 100);
				await sleep(600 / simulationSpeed); // 250
			}

			if (N % i === 0) {
				factors = [i, N / i];
				addClassicalLog(`✓ FACTORES ENCONTRADOS: ${N} = ${factors[0]} × ${factors[1]}`, 'success');
				addClassicalLog(`   └─ Después de probar ${i - 1} divisores`);
				addClassicalLog(`   └─ Total de operaciones: ${operations.total}`);
				break;
			}
		}

		const time = (performance.now() - startTime) / 1000;

		if (!factors) {
			addClassicalLog(`  ${N} es primo (sin factores después de probar ${limit - 1} divisores)`, 'info');
			factors = [1, N];
		}

		return {
			factors,
			success: factors[0] > 1,
			time: time.toFixed(3),
			iterations: operations.divisions,
			operations
		};
	};

	// Funciones auxiliares
	const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
	const modPow = (base, exp, mod) => {
		let result = 1;
		base = base % mod;
		while (exp > 0) {
			if (exp % 2 === 1) result = (result * base) % mod;
			exp = Math.floor(exp / 2);
			base = (base * base) % mod;
		}
		return result;
	};
	const findPeriod = (a, N) => {
		let r = 1;
		let value = a % N;
		while (value !== 1 && r < N) {
			value = (value * a) % N;
			r++;
		}
		return r;
	};

	// =============================================
	// =========== CONTROL DE SIMULACIÓN ===========
	// =============================================
	const startSimulation = async () => {
		const algo = algorithms[selectedAlgorithm];

		if (algo.needsInput) {
			if (!userInput.trim()) {
				setInputError('Por favor ingresa un valor');
				return;
			}
			if (!algo.validate(userInput, problemSize)) {
				setInputError('Entrada inválida');
				return;
			}
		}

		setInputError('');
		cancelRef.current = false;
		pausedRef.current = false;
		setIsSimulating(true);
		setQuantumResult(null);
		setClassicalResult(null);
		setQuantumLogs([]);
		setClassicalLogs([]);
		setQuantumProgress(0);
		setClassicalProgress(0);
		setQuantumStateData([]);
		setShowQuantumState(false);

		if (selectedAlgorithm === 'grover') {
			const newDatabase = generateDatabase(problemSize);
			setDatabase(newDatabase);
		}

		const input = algo.needsInput ? parseInt(userInput) : null;

		let qResult;
		if (selectedAlgorithm === 'grover') {
			qResult = await runGroverQuantum(input);
		} else if (selectedAlgorithm === 'shor') {
			qResult = await runShorQuantum(input);
		}
		setQuantumResult(qResult);

		if (cancelRef.current) {
			resetSimulation();
			return;
		}

		await sleep(1000);

		let cResult;
		if (selectedAlgorithm === 'grover') {
			cResult = await runLinearSearchClassical(input);
		} else if (selectedAlgorithm === 'shor') {
			cResult = await runTrialDivisionClassical(input);
		}
		setClassicalResult(cResult);

		setIsSimulating(false);
	};

	const resetSimulation = () => {
		cancelRef.current = true;
		pausedRef.current = false;
		setIsSimulating(false);
		setIsPaused(false);
		setQuantumResult(null);
		setClassicalResult(null);
		setQuantumLogs([]);
		setClassicalLogs([]);
		setQuantumProgress(0);
		setClassicalProgress(0);
	};

	const togglePause = () => {
		const newState = !isPaused;
		setIsPaused(newState);
		pausedRef.current = newState;
	};

	const getAdvantage = () => {
		if (!quantumResult || !classicalResult) return null;
		const advantage = (parseFloat(classicalResult.time) / parseFloat(quantumResult.time)).toFixed(2);
		return advantage;
	};

	const getTimeDifference = () => {
		if (!quantumResult || !classicalResult) return null;
		const diff = (parseFloat(classicalResult.time) - parseFloat(quantumResult.time)).toFixed(3);
		return diff;
	};

	return (
		<div className="min-h-screen bg-gray-900 text-white p-4">
			<div className="max-w-[1900px] mx-auto">
				{/* Header */}
				<div className="mb-6">
					<h1 className="text-3xl font-bold text-blue-400 flex items-center gap-2"><Atom /> QtonSimulator</h1>
				</div>

				{/* Layout principal con 3 columnas */}
				<div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
					{/* COLUMNA IZQUIERDA - Configuración (3 columnas) */}
					<div className="xl:col-span-3 space-y-6">
						{/* Panel de control */}
						<div className="bg-gray-800 rounded-xl shadow-lg p-6">
							<h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Chart /> Configuración</h2>

							<div className="space-y-4">
								<div>
									<label className="block text-sm font-medium mb-2">Algoritmo</label>
									<select
										value={selectedAlgorithm}
										onChange={(e) => {
											setSelectedAlgorithm(e.target.value);
											resetSimulation();
										}}
										disabled={isSimulating}
										className="w-full p-3 rounded-lg border-2 bg-gray-700 border-gray-600 text-white"
									>
										<option value="">Seleccionar...</option>
										{Object.entries(algorithms).map(([key, algo]) => (
											<option key={key} value={key}>
												{algo.name}
											</option>
										))}
									</select>
								</div>

								{selectedAlgorithm && algorithms[selectedAlgorithm].needsInput && (
									<div>
										<label className="block text-sm font-medium mb-2">{algorithms[selectedAlgorithm].inputLabel}</label>
										<input
											type="text"
											value={userInput}
											onChange={(e) => {
												setUserInput(e.target.value);
												setInputError('');
											}}
											placeholder={algorithms[selectedAlgorithm].inputPlaceholder}
											disabled={isSimulating}
											className={`w-full p-3 rounded-lg border-2 ${inputError ? 'border-red-500 bg-gray-700' : 'bg-gray-700 border-gray-600'} text-white`}
										/>
										{inputError && <p className="text-red-500 text-sm mt-1">{inputError}</p>}
									</div>
								)}

								<div>
									<label className="block text-sm font-medium mb-2">
										Qubits: {qubits} (N = {problemSize} elementos)
									</label>
									<div className="flex items-center gap-2">
										<span className="text-xs">3</span>
										<input type="range" min="3" max="7" value={qubits} onChange={(e) => setQubits(parseInt(e.target.value))} disabled={isSimulating} className="flex-1" />
										<span className="text-xs">7</span>
									</div>
								</div>

								<div>
									<div className="flex items-center justify-between mb-2">
										<label className="text-sm font-medium">Ruido Cuántico</label>
										<button
											onClick={() => setNoiseEnabled(!noiseEnabled)}
											disabled={isSimulating}
											className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${noiseEnabled ? 'bg-blue-600' : 'bg-gray-600'}`}
										>
											<span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${noiseEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
										</button>
									</div>

									{noiseEnabled && (
										<div>
											<label className="block text-sm font-medium mb-2">Tasa de Error: {customErrorRate.toFixed(1)}%</label>
											<input
												type="range"
												min="0"
												max="5"
												step="0.5"
												value={customErrorRate}
												onChange={(e) => setCustomErrorRate(parseFloat(e.target.value))}
												disabled={isSimulating}
												className="w-full"
											/>
											<p className="text-xs text-gray-400 mt-1">0% = Ideal · 1-2% = Hardware real · 3-5% = Muy ruidoso</p>
										</div>
									)}
								</div>

								<div>
									<label className="block text-sm font-medium mb-2">Velocidad: {simulationSpeed}x</label>
									<input
										type="range"
										min="0.5"
										max="5"
										step="0.5"
										value={simulationSpeed}
										onChange={(e) => setSimulationSpeed(parseFloat(e.target.value))}
										disabled={isSimulating}
										className="w-full"
									/>
								</div>

								<div className="flex gap-2">
									<button
										onClick={startSimulation}
										disabled={!selectedAlgorithm || isSimulating}
										className={`py-3 px-6 rounded-lg font-semibold ${
											!selectedAlgorithm || isSimulating
												? 'bg-gray-500 cursor-not-allowed'
												: 'bg-green-600 hover:bg-green-700 text-white'
										} flex items-center gap-2`}
									>
										<Play /> Iniciar
									</button>

									{/* {isSimulating && (
										<button onClick={togglePause} className="px-4 py-3 rounded-lg font-semibold bg-yellow-600 hover:bg-yellow-700 text-white">
											{isPaused ? <><Play /></> : <><Pause /></>}
										</button>
									)} */}

									<button
										onClick={resetSimulation}
										disabled={!isSimulating && !quantumResult}
										className={`px-4 py-3 rounded-lg font-semibold ${!isSimulating && !quantumResult ? 'bg-gray-500 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white'}`}
									>
										<Refresh />
									</button>
								</div>
							</div>
						</div>

						{/* Base de datos generada - SOLO PARA GROVER */}
						{selectedAlgorithm === 'grover' && database.length > 0 && (
							<div className="bg-gray-800 rounded-xl shadow-lg p-6">
								<h3 className="text-lg font-bold mb-3 flex items-center gap-2"><Numbers /> Base de Datos Generada</h3>
								<div className="max-h-96 overflow-y-auto p-3 rounded-lg bg-gray-700 text-xs font-mono">
									{database.map((item, i) => (
										<div key={i} className="flex justify-between py-1 hover:bg-gray-600">
											<span className="text-purple-400">[{item.index}]</span>
											<span className="text-cyan-400">{item.value}</span>
										</div>
									))}
								</div>
								<p className="text-xs text-gray-400 mt-2">Total: {database.length} elementos</p>
							</div>
						)}
					</div>

					{/* COLUMNA CENTRAL - Logs y Visualización (6 columnas) */}
					<div className="xl:col-span-6 space-y-6">
						{/* Logs lado a lado */}
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							{/* Log Cuántico */}
							<div className="bg-gray-800 rounded-xl shadow-lg p-6 border-2 border-purple-500">
								<h3 className="text-lg font-bold mb-3 text-purple-400">⚛️ {selectedAlgorithm ? algorithms[selectedAlgorithm].quantumName : 'Log Cuántico'}</h3>
								<div className="h-[500px] overflow-y-auto space-y-2 text-xs font-mono">
									{quantumLogs.length === 0 ? (
										<p className="text-gray-400">Esperando ejecución...</p>
									) : (
										quantumLogs.map((log, i) => (
											<div
												key={i}
												className={`p-2 rounded ${
													log.type === 'success'
														? 'bg-green-900 text-green-300'
														: log.type === 'error'
															? 'bg-red-900 text-red-300'
															: log.type === 'warning'
																? 'bg-yellow-900 text-yellow-300'
																: log.type === 'operation'
																	? 'bg-blue-900 text-blue-300 font-bold'
																	: 'text-gray-300'
												}`}
											>
												<span className="text-gray-500">[{log.timestamp}]</span> {log.message}
											</div>
										))
									)}
								</div>
								{quantumProgress > 0 && (
									<div className="mt-3">
										<div className="w-full bg-gray-700 rounded-full h-2">
											<div className="bg-purple-500 h-2 rounded-full transition-all" style={{ width: `${quantumProgress}%` }} />
										</div>
									</div>
								)}
							</div>

							{/* Log Clásico */}
							<div className="bg-gray-800 rounded-xl shadow-lg p-6 border-2 border-cyan-500">
								<h3 className="text-lg font-bold mb-3 text-cyan-400">🖥️ {selectedAlgorithm ? algorithms[selectedAlgorithm].classicalName : 'Log Clásico'}</h3>
								<div className="h-[500px] overflow-y-auto space-y-2 text-xs font-mono">
									{classicalLogs.length === 0 ? (
										<p className="text-gray-400">Esperando ejecución...</p>
									) : (
										classicalLogs.map((log, i) => (
											<div
												key={i}
												className={`p-2 rounded ${
													log.type === 'success'
														? 'bg-green-900 text-green-300'
														: log.type === 'error'
															? 'bg-red-900 text-red-300'
															: log.type === 'warning'
																? 'bg-yellow-900 text-yellow-300'
																: log.type === 'operation'
																	? 'bg-blue-900 text-blue-300 font-bold'
																	: 'text-gray-300'
												}`}
											>
												<span className="text-gray-500">[{log.timestamp}]</span> {log.message}
											</div>
										))
									)}
								</div>
								{classicalProgress > 0 && (
									<div className="mt-3">
										<div className="w-full bg-gray-700 rounded-full h-2">
											<div className="bg-cyan-500 h-2 rounded-full transition-all" style={{ width: `${classicalProgress}%` }} />
										</div>
									</div>
								)}
							</div>
						</div>

						{/* Visualización del estado cuántico */}
						{showQuantumState && quantumStateData.length > 0 && (
							<div className="bg-gray-800 rounded-xl shadow-lg p-6 border-2 border-purple-500">
								<div className="mb-4">
									<h3 className="text-lg font-bold text-purple-400 flex items-center gap-2"><Badge /> Estado Cuántico - Probabilidades de Medición</h3>
									<p className="text-xs text-gray-400 mt-1 flex items-center gap-2">
										<Warning /> Esta gráfica muestra la probabilidad de medir cada estado después de las iteraciones de Grover. La barra más alta indica el estado más probable de ser medido (el objetivo).
									</p>
									<p className="text-xs text-gray-400 mt-1 flex items-center gap-2">
										<Check /> En un algoritmo perfecto, la barra del estado objetivo debería ser la más alta (~100% de probabilidad).
										{noiseEnabled && ' El ruido cuántico puede redistribuir estas probabilidades.'}
									</p>
								</div>
								<ResponsiveContainer width="100%" height={250}>
									<BarChart data={quantumStateData}>
										<CartesianGrid strokeDasharray="3 3" stroke="#374151" />
										<XAxis
											dataKey="state"
											stroke="#9ca3af"
											label={{
												value: 'Estado |i⟩',
												position: 'insideBottom',
												offset: -5,
												fill: '#9ca3af'
											}}
										/>
										<YAxis
											stroke="#9ca3af"
											label={{
												value: 'Probabilidad',
												angle: -90,
												position: 'insideLeft',
												fill: '#9ca3af'
											}}
											domain={[0, 1]}
										/>
										<Tooltip
											contentStyle={{
												backgroundColor: '#1f2937',
												border: '2px solid #a855f7',
												borderRadius: '8px'
											}}
											formatter={(value) => [(value * 100).toFixed(2) + '%', 'Probabilidad']}
										/>
										<Bar dataKey="probability" fill="#a855f7" />
									</BarChart>
								</ResponsiveContainer>
							</div>
						)}
					</div>

					{/* COLUMNA DERECHA - Resultados (3 columnas) */}
					<div className="xl:col-span-3 space-y-6">
						{/* Resultado Cuántico */}
						<div className="bg-gray-800 rounded-xl shadow-lg p-6 border-2 border-purple-500">
							<h3 className="text-lg font-bold mb-4 text-purple-400 flex items-center gap-2"><Atom /> Resultado Cuántico</h3>
							{quantumResult ? (
								<div className="space-y-3 text-sm">
									<div className="flex justify-between items-center">
										<span className="text-gray-400">Tiempo:</span>
										<span className="font-bold text-xl">{quantumResult.time}s</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-gray-400">Operaciones:</span>
										<span className="font-bold">{quantumResult.operations.total}</span>
									</div>
									{quantumResult.iterations && (
										<div className="flex justify-between items-center">
											<span className="text-gray-400">Iteraciones:</span>
											<span className="font-bold">{quantumResult.iterations}</span>
										</div>
									)}
									{quantumResult.fidelity && (
										<div className="flex justify-between items-center">
											<span className="text-gray-400">Fidelidad:</span>
											<span className="font-bold">{quantumResult.fidelity}%</span>
										</div>
									)}
									{quantumResult.stateQuality && (
										<div className="border-t border-gray-700 pt-3 space-y-2">
											<div className="flex justify-between items-center">
												<span className="text-gray-400">Calidad del Estado:</span>
												<span className="font-bold text-cyan-400">{quantumResult.stateQuality.quality}%</span>
											</div>
											<div className="flex justify-between items-center">
												<span className="text-gray-400 text-xs">Prob. Objetivo:</span>
												<span className="font-bold text-xs">{quantumResult.stateQuality.targetProbability}%</span>
											</div>
											{quantumResult.stateQuality.isTargetMax && <div className="text-xs text-green-400">✓ El objetivo es el estado más probable</div>}
										</div>
									)}
									{quantumResult.gateErrors > 0 && (
										<div className="flex justify-between items-center">
											<span className="text-yellow-500 flex items-center gap-2"><Warning /> Errores:</span>
											<span className="font-bold text-yellow-500">{quantumResult.gateErrors}</span>
										</div>
									)}
									<div className="pt-3 border-t border-gray-700">
										<div className="flex items-center gap-2">
											{quantumResult.success ? (
												<>
													<span className="text-2xl flex items-center gap-2"><Check /></span>
													<span className="text-green-400 font-semibold">Éxito</span>
												</>
											) : (
												<>
													<span className="text-2xl flex items-center gap-2"><X /></span>
													<span className="text-red-400 font-semibold">Error</span>
												</>
											)}
										</div>
									</div>
								</div>
							) : (
								<p className="text-gray-400 text-center py-8">Ejecuta la simulación para ver resultados</p>
							)}
						</div>

						{/* Resultado Clásico */}
						<div className="bg-gray-800 rounded-xl shadow-lg p-6 border-2 border-cyan-500">
							<h3 className="text-lg font-bold mb-4 text-cyan-400 flex items-center gap-2"><Computer /> Resultado Clásico</h3>
							{classicalResult ? (
								<div className="space-y-3 text-sm">
									<div className="flex justify-between items-center">
										<span className="text-gray-400">Tiempo:</span>
										<span className="font-bold text-xl">{classicalResult.time}s</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-gray-400">Operaciones:</span>
										<span className="font-bold">{classicalResult.operations.total}</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-gray-400">Iteraciones:</span>
										<span className="font-bold">{classicalResult.iterations}</span>
									</div>
									<div className="pt-3 border-t border-gray-700">
										<div className="flex items-center gap-2">
											{classicalResult.success ? (
												<>
													<span className="text-2xl flex items-center gap-2"><Check/></span>
													<span className="text-green-400 font-semibold">Éxito</span>
												</>
											) : (
												<>
													<span className="text-2xl flex items-center gap-2"><X /></span>
													<span className="text-red-400 font-semibold">Error</span>
												</>
											)}
										</div>
									</div>
								</div>
							) : (
								<p className="text-gray-400 text-center py-8">Ejecuta la simulación para ver resultados</p>
							)}
						</div>

						{/* Comparación */}
						{quantumResult && classicalResult && (
							<div className="bg-gray-800 rounded-xl shadow-lg p-6 border-2 border-green-500">
								<h3 className="text-lg font-bold mb-4 text-green-400 flex items-center gap-2"><Lightning /> Comparación</h3>
								<div className="text-center space-y-4">
									<div>
										<p className="text-6xl font-bold text-green-400">{getAdvantage()}x</p>
										<p className="text-sm text-gray-400 mt-2">Ventaja cuántica</p>
									</div>
									<div className="pt-4 border-t border-gray-700 space-y-2 text-sm">
										<div className="flex justify-between items-center">
											<span className="text-gray-400">Diferencia de tiempo:</span>
											<span className="font-bold text-green-400">{getTimeDifference()}s</span>
										</div>
										<div className="flex justify-between items-center">
											<span className="text-gray-400">Reducción de operaciones:</span>
											<span className="font-bold text-green-400">{((1 - quantumResult.operations.total / classicalResult.operations.total) * 100).toFixed(1)}%</span>
										</div>
									</div>
								</div>
							</div>
						)}

						{/* Complejidad */}
						{selectedAlgorithm && (
							<div className="bg-gray-800 rounded-xl shadow-lg p-6">
								<h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Bulb /> Complejidad Algorítmica</h3>
								<div className="space-y-3">
									<div>
										<p className="text-sm text-purple-400 mb-1">Cuántico:</p>
										<p className="text-xl font-mono font-bold">{algorithms[selectedAlgorithm].quantumComplexity}</p>
									</div>
									<div>
										<p className="text-sm text-cyan-400 mb-1">Clásico:</p>
										<p className="text-xl font-mono font-bold">{algorithms[selectedAlgorithm].classicalComplexity}</p>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default QuantumSimulator;
