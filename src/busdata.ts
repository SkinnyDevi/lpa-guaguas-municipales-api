export default interface BusData {
	id: string;              // 'SDF0010146'
	position: { lat: number; lng: number }; // { lat: 28.122895, lng: -15.427527 }
	stopName: string;        // 'León y Castillo (Colegio Salesiano)'
	lineNumber: BusLineNumber;      // '1'
	routeName: string;       // 'Teatro'
	startTime: string;       // '23:00'
	endTime: string;         // '23:34'
	path: { lat: number; lng: number }[]; // Array of lat/lng objects
	segmentIndex: number;    // 9
	duration: number;        // 2
	iconColor: string;       // 'roja'
	textColor: string;       // 'blanca'
	pathColor: string;       // '#E2001A'
}
