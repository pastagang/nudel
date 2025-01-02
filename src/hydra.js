import Hydra from "hydra-synth";

export class HydraSession {
	constructor({onError, canvas, onHighlight}) {
		this.initialized = false;
		this.onError = onError;
		this.canvas = canvas;
		this.onHighlight = onHighlight;
		this.init();
	}

	async init() {
		if (this.initialized) return;

		try {

			this.canvas.width = window.innerWidth;
			this.canvas.height = window.innerHeight;
			this._hydra = new Hydra({
				canvas: this.canvas,
				enableAudio:false,
			});
		} catch (error) {
			console.error(error);
			this.onError(`${error}`);
			return;
		}

		window.H = this._hydra;

		// Enable using strudel style mini-patterns for argument control on Hydra.
		// strudel needs to be loaded first, otherwise this will cause warnings, and rendering will not
		// include the mini-pattern.
		// Inspired by
		// - https://github.com/atfornes/Hydra-strudel-extension/blob/51a93496b1b05ea00c08d1dec10e046aa3769c93/hydra-strudel.js#L72
		// - https://github.com/tidalcycles/strudel/blob/26cc7e2920e32ec01bf22e1dae8ced716462a158/packages/hydra/hydra.mjs#L50
		window.P = (pattern) => {
			return () => {
				// parse using the strudel mini parser
				const reified = window.strudel.mini.minify(pattern);

				const now = window.strudel.core.getTime();

				// query the current value
				const arc = reified.queryArc(now, now);
				return arc[0].value;
			};
		};

		// initialized a streaming canvas with the strudel draw context canvas
		// this allows us to use the strudel output
		window.useStrudelCanvas = (s) => {
			return
			const canvas = window.strudel.draw.getDrawContext().canvas;
			canvas.style.display = "none";
			s.init({src: canvas});
		};

		const clamp = (num, min, max) =>
			Math.min(Math.max(num, min), max);

		// Enables Hydra to use Strudel frequency data
		// with `.scrollX(() => fft(1,0)` it will influence the x-axis, according to the fft data
		// first number is the index of the bucket, second is the number of buckets to aggregate the number too
		window.fft = (
			index,//: number,
			buckets,//: number = 8,
			options,//?: { min?: number; max?: number; scale?: number; analyzerId?: string; },
		) => {
			const analyzerId = options?.analyzerId ?? "flok-master";
			const min = options?.min ?? -150;
			const scale = options?.scale ?? 1;
			const max = options?.max ?? 0;

			// Strudel is not initialized yet, so we just return a default value
			if (window.strudel == undefined) return 0.5;

			// If display settings are not enabled, we just return a default value
			if (!(this._displaySettings.enableFft ?? true)) return 0.5;

			// Enable auto-analyze
			window.strudel.enableAutoAnalyze = true;

			// If the analyzerId is not defined, we just return a default value
			if (window.strudel.webaudio.analysers[analyzerId] == undefined) {
				return 0.5;
			}

			const freq = window.strudel.webaudio.getAnalyzerData(
				"frequency",
				analyzerId,
			)// as Array<number>;
			const bucketSize = freq.length / buckets;

			// inspired from https://github.com/tidalcycles/strudel/blob/a7728e3d81fb7a0a2dff9f2f4bd9e313ddf138cd/packages/webaudio/scope.mjs#L53
			const normalized = freq.map((it/*: number*/) => {
				const norm = clamp((it - min) / (max - min), 0, 1);
				return norm * scale;
			});

			return (
				normalized
					.slice(bucketSize * index, bucketSize * (index + 1))
					.reduce((a, b) => a + b, 0) / bucketSize
			);
		};

		this.initialized = true;
		console.log("Hydra initialized");
	}


	async eval(msg, conversational = false) {
		if (!this.initialized) await this.init();
		const { body: code, docId } = msg;

		try {
			await eval?.(`(async () => {\n${code}\n})()`);
		} catch (error) {
			console.error(error);
			this.onError(`${error}`);
		}
	}
}
