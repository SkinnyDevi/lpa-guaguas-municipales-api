import BusPosition from "./busposition";

export default interface BusMarker {
	id: string;
	position: BusPosition;
	stopName: string;
	lineNumber: BusLineNumber;
	routeName: string;
	startTime: string;
	endTime: string;
	path: BusPosition[];
	segmentIndex: number;
	duration: number;
	iconColor: string;
	textColor: string;
	pathColor: string;
}