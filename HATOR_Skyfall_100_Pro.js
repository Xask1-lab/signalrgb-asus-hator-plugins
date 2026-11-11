// SignalRGB plugin: HATOR Skyfall 100 Pro (USB 379A:1806)
// Author: Xask1. Protocol reverse-engineering and code written together with Claude (Anthropic AI).
//
// The keyboard firmware re-applies (and visibly flickers) on every per-key color
// table upload, so live per-key streaming is not usable on this model.
// This plugin therefore controls the keyboard's built-in hardware effects,
// which are rendered by the keyboard itself (smooth, no flicker).
//
// Protocol (reverse-engineered from the official HATOR software via USB capture):
//   64-byte HID feature reports on interface 2, no report ID (first byte 0x00 on Windows).
//   Hardware effect: 07 MM SS BB CM RR GG BB CHK
//     MM  - effect id (see EFFECTS below)
//     SS  - speed 0..4
//     BB  - brightness 0..4
//     CM  - 0x07 = single (own) color, 0x08 = multicolor (RGB)
//     RGB - effect color
//     CHK - 0xFF - (sum of previous bytes & 0xFF)

export function Name() { return "HATOR Skyfall 100 Pro"; }
export function VendorId() { return 0x379A; }
export function ProductId() { return 0x1806; }
export function Publisher() { return "Xask1"; }
export function Size() { return [1, 1]; }
export function DeviceType() { return "keyboard"; }
export function Validate(endpoint) { return endpoint.interface === 2; }
export function LedNames() { return []; }
export function LedPositions() { return []; }

// Effect name (as in the HATOR software) -> effect id in the keyboard firmware
const EFFECTS = {
	"Static": 0x01,
	"Breathing (moving)": 0x02,
	"Spectrum": 0x03,
	"Wave": 0x04,
	"Ripple": 0x05,
	"Starlight": 0x06,
	"Flow": 0x07,
	"Shadow": 0x08,
	"Mountain Range": 0x09,
	"Sine Wave": 0x0A,
	"Color Fountain": 0x0B,
	"Flowers": 0x0C,
	"Double Strike": 0x0E,
	"Spiral Wave": 0x0F,
	"Color Grid": 0x10,
	"Snowfall": 0x11,
	"Meteor": 0x12,
	"Footprints": 0x13,
};

/* global
hwEffect:readonly
hwColorMode:readonly
hwColor:readonly
hwSpeed:readonly
hwBrightness:readonly
*/
export function ControllableParameters() {
	return [
		{property:"hwEffect", group:"lighting", label:"Hardware Effect", description:"Built-in keyboard effect", type:"combobox", values:Object.keys(EFFECTS), default:"Color Grid"},
		{property:"hwColorMode", group:"lighting", label:"Effect Colors", description:"Single color or multicolor (RGB)", type:"combobox", values:["Own Color", "RGB"], default:"Own Color"},
		{property:"hwColor", group:"lighting", label:"Effect Color", description:"Color used in Own Color mode", min:"0", max:"360", type:"color", default:"#ff4800"},
		{property:"hwSpeed", group:"lighting", label:"Effect Speed", description:"0 = slow, 4 = fast", type:"combobox", values:["0", "1", "2", "3", "4"], default:"3"},
		{property:"hwBrightness", group:"lighting", label:"Effect Brightness", description:"0 = dim, 4 = bright", type:"combobox", values:["0", "1", "2", "3", "4"], default:"4"},
	];
}

let lastState = "";

export function Initialize() {
	lastState = "";
}

export function Render() {
	// Send only when a setting changed - the keyboard animates the effect by itself
	const state = [hwEffect, hwColorMode, hwColor, hwSpeed, hwBrightness].join("|");
	if (state === lastState) { return; }
	lastState = state;
	sendEffect();
}

export function Shutdown(SystemSuspending) {
	// Nothing to do: the keyboard keeps running its last hardware effect
}

function sendEffect() {
	const mode = EFFECTS[hwEffect] !== undefined ? EFFECTS[hwEffect] : 0x10;
	const speed = clamp(parseInt(hwSpeed), 0, 4, 3);
	const bright = clamp(parseInt(hwBrightness), 0, 4, 4);
	const colorMode = hwColorMode === "RGB" ? 0x08 : 0x07;
	const c = hexToRgb(hwColor);

	const head = [0x07, mode, speed, bright, colorMode, c[0], c[1], c[2]];
	const packet = new Array(64).fill(0);
	for (let i = 0; i < head.length; i++) { packet[i] = head[i]; }
	packet[8] = checksum(head);

	device.send_report([0x00].concat(packet), 65);
	device.pause(2);
}

function checksum(bytes) {
	let s = 0;
	for (let i = 0; i < bytes.length; i++) { s += bytes[i]; }
	return (0xFF - (s & 0xFF)) & 0xFF;
}

function clamp(v, lo, hi, def) {
	if (isNaN(v)) { return def; }
	return Math.max(lo, Math.min(hi, v));
}

function hexToRgb(hex) {
	const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return r ? [parseInt(r[1], 16), parseInt(r[2], 16), parseInt(r[3], 16)] : [0, 0, 0];
}
