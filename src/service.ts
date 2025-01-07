class ControlAddInService {
	// biome-ignore lint/suspicious/noExplicitAny:
	#eventCallbacks = new Map<string, Set<(...args: any[]) => void>>();
	// biome-ignore lint/suspicious/noExplicitAny:
	on(event: string, callback: (...args: any[]) => void) {
		const callbacks = this.#eventCallbacks.get(event) ?? new Set();
		callbacks.add(callback);
		this.#eventCallbacks.set(event, callbacks);
		if (!Object.hasOwn(globalThis, event)) {
			Object.assign(globalThis, {
				// biome-ignore lint/suspicious/noExplicitAny:
				[event]: (...args: any[]) => {
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
	// biome-ignore lint/suspicious/noExplicitAny:
	invoke(procedure: string, ...args: any[]) {
		Microsoft.Dynamics.NAV.InvokeExtensibilityMethod(procedure, args, false);
	}
}

export const controlAddInService = new ControlAddInService();
