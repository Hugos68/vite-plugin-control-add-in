class ControlAddInService {
	#eventCallbacks = new Map<string, Set<(...args: unknown[]) => void>>();
	on(event: string, callback: (...args: unknown[]) => void) {
		const callbacks = this.#eventCallbacks.get(event) ?? new Set();
		callbacks.add(callback);
		this.#eventCallbacks.set(event, callbacks);
		if (!Object.hasOwn(globalThis, event)) {
			Object.assign(globalThis, {
				[event]: (...args: unknown[]) => {
					const eventCallbacks = this.#eventCallbacks.get(event);
					if (eventCallbacks) {
						for (const cb of eventCallbacks) {
							cb(...args);
						}
					}
				},
			});
		}
		return () => {
			const eventCallbacks = this.#eventCallbacks.get(event);
			if (eventCallbacks) {
				eventCallbacks.delete(callback);
				if (eventCallbacks.size === 0) {
					this.#eventCallbacks.delete(event);
					if (Object.hasOwn(globalThis, event)) {
						// @ts-expect-error
						delete globalThis[event];
					}
				}
			}
		};
	}
	invoke(procedure: string, ...args: unknown[]) {
		Microsoft.Dynamics.NAV.InvokeExtensibilityMethod(procedure, args, false);
	}
}

export const controlAddInService = new ControlAddInService();
