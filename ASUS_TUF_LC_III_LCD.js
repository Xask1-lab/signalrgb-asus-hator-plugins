// SignalRGB plugin: ASUS TUF Gaming LC III 360 ARGB LCD pump screen (USB 0B05:1C7B)
// Author: Xask1. Protocol reverse-engineering and code written together with Claude (Anthropic AI).
// SignalRGB renders the frame (LCD module); the plugin only sends it to the pump.
// Note: the pump is usually mounted so that the image appears upside down -
// rotate the LCD by 180 degrees in SignalRGB's LCD settings if needed.
//
// Protocol (reverse-engineered from a USB capture of ASUS InfoHub):
//   interface 1, HID output report without report ID, 1024 bytes (on Windows: [0x00] + 1024)
//   packet data: [0x08, N, 0x00, F] + 1020 bytes of JPEG
//     first packet of a frame: N = number of packets in the frame, F = 0x80
//     following packets:       N = packet index (1, 2, ...), F = 0x00
//   frame: JPEG 320x320

import LCD from "@SignalRGB/lcd";

export function Name() { return "ASUS TUF Gaming LC III LCD"; }
export function VendorId() { return 0x0B05; }
export function ProductId() { return 0x1C7B; }
export function Publisher() { return "Xask1"; }
export function Size() { return [1, 1]; }
export function DeviceType() { return "lcd"; }
// Ask SignalRGB to close InfoHub so both programs don't fight over the screen
export function ConflictingProcesses() { return ["ASUS InfoHub.exe"]; }
export function Validate(endpoint) { return endpoint.interface === 1; }
export function LedNames() { return []; }
export function LedPositions() { return []; }

/* global
lcdFps:readonly
*/
export function ControllableParameters() {
	return [
		{property:"lcdFps", group:"", label:"Frame Rate (FPS)", description:"How many frames per second are sent to the pump screen", type:"combobox", values:["5", "10", "15", "20", "25", "30", "45", "60"], default:"25"},
	];
}

const SIZE = 320;          // screen resolution
const PAYLOAD = 1020;      // JPEG bytes per packet
let lastTime = 0;

export function Initialize() {
	LCD.initialize({ width: SIZE, height: SIZE });
}

export function Render() {
	// frame rate limit
	const fps = parseInt(lcdFps) || 25;
	const now = Date.now();
	if (now - lastTime < 1000 / fps) { return; }
	lastTime = now;

	sendFrame(LCD.getFrame({ format: "JPEG" }));
}

export function Shutdown(SystemSuspending) {
	// Nothing to send: the pump shows its built-in splash screen after shutdown
}

// Splits the JPEG into 1020-byte packets and sends them to the pump
function sendFrame(jpeg) {
	if (!jpeg || jpeg.length === 0) { return; }
	const total = Math.ceil(jpeg.length / PAYLOAD);
	if (total > 255) { return; }    // frame too large for the protocol - skip it

	for (let i = 0; i < total; i++) {
		const chunk = jpeg.slice(i * PAYLOAD, (i + 1) * PAYLOAD);
		const head = (i === 0) ? [0x08, total, 0x00, 0x80] : [0x08, i, 0x00, 0x00];
		const packet = [0x00].concat(head, chunk);
		while (packet.length < 1025) { packet.push(0); }   // pad to the full report size
		device.write(packet, 1025);
	}
}
