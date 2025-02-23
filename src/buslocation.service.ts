import BusMarker from "./busmarker";
import BusPosition from "./busposition";

const API_URL = "https://lpgc.es/guaguas/";

// Service class to handle bus location API interactions
export default class BusLocationService {
	private baseUrl: string = API_URL;
	private buses: Map<string, BusMarker> = new Map();
	private intervalId: NodeJS.Timeout | null = null;
	private globalUpdateCallback: ((buses: BusMarker[]) => void) | null = null;
	private busUpdateCallbacks: Map<string, ((bus: BusMarker) => void)[]> = new Map(); // Map of lineNumber to array of callbacks
	private enableDebug = false;

	constructor() { }

	public useDebug(enabled: boolean) {
		this.enableDebug = enabled;
	}

	public startPolling(intervalMs: number = 30000): void {
		this.fetchBusData()
			.then(() => console.log('Initial fetch completed'))
			.catch((err) => console.error('Initial fetch failed:', err));
		this.intervalId = setInterval(() => this.fetchBusData(), intervalMs);
	}

	public stopPolling(): void {
		if (this.intervalId) {
			clearInterval(this.intervalId);
			this.intervalId = null;
			console.log('Polling stopped');
		}
	}

	// Subscribe to all bus updates
	public onUpdate(callback: (buses: BusMarker[]) => void): void {
		this.globalUpdateCallback = callback;
	}

	// Subscribe to updates for a specific bus by lineNumber
	public onBusUpdate(lineNumber: BusLineNumber, callback: (bus: BusMarker) => void): void {
		const lineNumStr = lineNumber.toString(); // Normalize to string
		if (!this.busUpdateCallbacks.has(lineNumStr)) {
			this.busUpdateCallbacks.set(lineNumStr, []);
		}
		this.busUpdateCallbacks.get(lineNumStr)!.push(callback);
		console.log(`Subscribed to updates for bus ${lineNumStr}`);
	}

	// Subscribe to updates for multiple buses by lineNumbers
	public onBusesUpdate(lineNumbers: BusLineNumber[], callback: (bus: BusMarker) => void): void {
		lineNumbers.forEach((lineNumber) => {
			this.onBusUpdate(lineNumber, callback);
		});
		console.log(`Subscribed to updates for buses: ${lineNumbers.join(', ')}`);
	}

	private async fetchBusData(timestamp?: string): Promise<void> {
		try {
			const url = `${this.baseUrl}?x=${timestamp || Date.now()}`;
			const response = await fetch(url, { method: 'GET' });
			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}
			const rawData: any[] = await response.json();
			this.processBusData(rawData);
		} catch (error) {
			console.error('Failed to fetch bus data:', error);
			throw error;
		}
	}

	private processBusData(rawData: any[]): void {
		const updatedBuses: BusMarker[] = [];

		rawData.forEach((busArray) => {
			const busMarker = this.convertArrayToBusMarker(busArray);
			if (!this.buses.has(busMarker.id)) {
				this.buses.set(busMarker.id, busMarker);
				if (this.enableDebug) console.log(`Bus ${busMarker.lineNumber} started at ${busMarker.stopName}`);
			} else {
				const existingBus = this.buses.get(busMarker.id)!;
				Object.assign(existingBus, busMarker);
				if (this.enableDebug) console.log(`Bus ${busMarker.lineNumber} updated at ${busMarker.stopName}`);
			}
			const updatedBus = this.buses.get(busMarker.id)!;
			updatedBuses.push(updatedBus);

			// Trigger specific bus subscriptions
			const callbacks = this.busUpdateCallbacks.get(busMarker.lineNumber.toString());
			if (callbacks) {
				callbacks.forEach((callback) => callback(updatedBus));
			}
		});

		// Trigger global subscription
		if (this.globalUpdateCallback) {
			this.globalUpdateCallback(updatedBuses);
		}
	}

	private convertArrayToBusMarker(busArray: any[]): BusMarker {
		try {
			const pathArray = busArray[15] as string[];
			const path: BusPosition[] = [];
			for (let i = 0; i < pathArray.length; i += 2) {
				const latPart = pathArray[i];
				const lngPart = pathArray[i + 1];
				if (latPart && lngPart) {
					path.push({
						lat: parseFloat(`28.${latPart}`),
						lng: parseFloat(`-15.4${lngPart}`),
					});
				}
			}

			return {
				id: busArray[2] as string,
				position: {
					lat: parseFloat(`28.${busArray[0]}`),
					lng: parseFloat(`-15.4${busArray[1]}`),
				},
				stopName: busArray[4] as string,
				lineNumber: busArray[3] as BusLineNumber,
				routeName: busArray[5] as string,
				startTime: busArray[6] as string,
				endTime: busArray[7] as string,
				path: path.length > 0 ? path : [{ lat: 28.0, lng: -15.4 }],
				segmentIndex: busArray[14] as number,
				duration: busArray[12] as number,
				iconColor: busArray[9] as string,
				textColor: busArray[10] as string,
				pathColor: `#${busArray[11]}` as string,
			};
		} catch (error) {
			console.error('Error converting bus array to BusMarker:', error, busArray);
			return {
				id: busArray[2] || 'unknown',
				position: { lat: 28.0, lng: -15.4 },
				stopName: 'Unknown Stop',
				lineNumber: busArray[3] || 'unknown',
				routeName: 'Unknown Route',
				startTime: '00:00',
				endTime: '00:00',
				path: [{ lat: 28.0, lng: -15.4 }],
				segmentIndex: 0,
				duration: 0,
				iconColor: 'grey',
				textColor: 'black',
				pathColor: '#000000',
			};
		}
	}

	public getBuses(): BusMarker[] {
		return Array.from(this.buses.values());
	}
}