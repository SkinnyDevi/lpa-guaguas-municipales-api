import BusLocationService from "./buslocation.service";

// Example usage
const busService = new BusLocationService();

// Global subscription
// busService.onUpdate((buses) => {
// 	console.log('All buses updated:', buses);
// });

// Subscribe to a single bus (e.g., line 1)
// busService.onBusUpdate("7", (bus) => {
// 	console.log(`Bus 7 updated:`, bus);
// });

// Subscribe to multiple buses (e.g., lines 1, L1, 10)
busService.onBusesUpdate(["7", "L1", "L2"], (bus) => {
	console.log(`Subscribed bus updated:`, bus);
});

// Enable some service debug messages
// busService.useDebug(true);

busService.startPolling(30000);