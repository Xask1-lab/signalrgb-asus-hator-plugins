// SignalRGB plugin: HATOR Skyfall 100 Pro (USB 379A:1806)
// Протокол відновлено із запису обміну фірмової програми HATOR.
//   Feature-звіти 64 байти в інтерфейс 2 (без Report ID -> перший байт 0x00).
//   Вбудований ефект: 07 MM SS BB CM RR GG BB + КС
//       MM — номер ефекту, SS — швидкість 0..4, BB — яскравість 0..4,
//       CM — 0x07 власний колір / 0x08 RGB (різнокольоровий)
//   Поклавішний режим: 07 0D 04 04 00 00 C8 C8 + КС, таблиця 0x0C (7 частин, 126 x RGB)
//   КС = 0xFF - (сума попередніх байтів) & 0xFF.
//
// Режими плагіна:
//   "Hardware Effect" — вбудований ефект клавіатури: плавно, без моргання (рекомендовано)
//   "SignalRGB Canvas" — кольори з ефектів SignalRGB; клавіатура моргає при кожній зміні

export function Name() { return "HATOR Skyfall 100 Pro"; }
export function VendorId() { return 0x379A; }
export function ProductId() { return 0x1806; }
export function Publisher() { return "Custom (Claude)"; }
export function Size() { return [22, 6]; }
export function DefaultPosition() { return [10, 100]; }
export function DefaultScale() { return 8.0; }
export function DeviceType() { return "keyboard"; }
export function Validate(endpoint) { return endpoint.interface === 2; }

// Назва в меню -> номер ефекту в клавіатурі
const EFFECTS = {
	"Статичний": 0x01,
	"Рухоме дихання": 0x02,
	"Спектр": 0x03,
	"Хвиля": 0x04,
	"Брижі": 0x05,
	"Зоряне світло": 0x06,
	"Потік": 0x07,
	"Тінь": 0x08,
	"Гірська гряда": 0x09,
	"Синусоїда": 0x0A,
	"Фонтан кольорів": 0x0B,
	"Квіти": 0x0C,
	"Подвійний удар": 0x0E,
	"Хвиля-спіраль": 0x0F,
	"Кольорова сітка": 0x10,
	"Снігопад": 0x11,
	"Метеор": 0x12,
	"Відбитки кроків": 0x13,
};

/* global
pluginMode:readonly
hwEffect:readonly
hwColorMode:readonly
hwColor:readonly
hwSpeed:readonly
hwBrightness:readonly
shutdownColor:readonly
LightingMode:readonly
forcedColor:readonly
updateRate:readonly
*/
export function ControllableParameters() {
	return [
		{property:"pluginMode", group:"", label:"Mode", description:"Hardware Effect — ефект малює клавіатура (плавно). SignalRGB Canvas — ефекти SignalRGB (моргає)", type:"combobox", values:["Hardware Effect", "SignalRGB Canvas"], default:"Hardware Effect"},
		{property:"hwEffect", group:"", label:"Hardware Effect", description:"Вбудований ефект клавіатури", type:"combobox", values:Object.keys(EFFECTS), default:"Кольорова сітка"},
		{property:"hwColorMode", group:"", label:"Effect Colors", description:"Власний колір або різнокольоровий (RGB)", type:"combobox", values:["Own Color", "RGB"], default:"Own Color"},
		{property:"hwColor", group:"", label:"Effect Color", description:"Колір для режиму Own Color", min:"0", max:"360", type:"color", default:"#ff4800"},
		{property:"hwSpeed", group:"", label:"Effect Speed", description:"0 — повільно, 4 — швидко", type:"combobox", values:["0", "1", "2", "3", "4"], default:"3"},
		{property:"hwBrightness", group:"", label:"Effect Brightness", description:"0 — темно, 4 — яскраво", type:"combobox", values:["0", "1", "2", "3", "4"], default:"4"},
		{property:"shutdownColor", group:"lighting", label:"Shutdown Color", description:"Колір при вимкненні SignalRGB або ПК (режим Canvas)", min:"0", max:"360", type:"color", default:"#000000"},
		{property:"LightingMode", group:"lighting", label:"Lighting Mode", description:"Canvas — ефекти SignalRGB, Forced — один колір (режим Canvas)", type:"combobox", values:["Canvas", "Forced"], default:"Canvas"},
		{property:"forcedColor", group:"lighting", label:"Forced Color", description:"Колір для режиму Forced", min:"0", max:"360", type:"color", default:"#009bde"},
		{property:"updateRate", group:"", label:"Canvas Update Rate (FPS)", description:"Для режиму SignalRGB Canvas. Якщо моргає — зменшіть", type:"combobox", values:["2", "5", "10", "15", "20", "30"], default:"5"},
	];
}

// [номер у таблиці клавіатури, назва, x, y]  (x/y — фізичне розташування на сітці 22x6)
const KEYS = [
	[0, "Esc", 0, 0], [6, "F1", 2, 0], [12, "F2", 3, 0], [18, "F3", 4, 0], [24, "F4", 5, 0],
	[30, "F5", 7, 0], [36, "F6", 8, 0], [42, "F7", 9, 0], [48, "F8", 10, 0],
	[54, "F9", 11, 0], [60, "F10", 12, 0], [66, "F11", 13, 0], [72, "F12", 14, 0],
	[78, "Print Screen", 15, 0], [84, "Scroll Lock", 16, 0], [90, "Pause", 17, 0],

	[1, "`", 0, 1], [7, "1", 1, 1], [13, "2", 2, 1], [19, "3", 3, 1], [25, "4", 4, 1], [31, "5", 5, 1],
	[37, "6", 6, 1], [43, "7", 7, 1], [49, "8", 8, 1], [55, "9", 9, 1], [61, "0", 10, 1],
	[67, "-", 11, 1], [73, "=", 12, 1], [79, "Backspace", 13, 1],
	[85, "Insert", 15, 1], [87, "Home", 16, 1], [91, "Page Up", 17, 1],
	[97, "Num Lock", 18, 1], [103, "Num /", 19, 1], [109, "Num *", 20, 1], [111, "Num -", 21, 1],

	[2, "Tab", 0, 2], [8, "Q", 1, 2], [14, "W", 2, 2], [20, "E", 3, 2], [26, "R", 4, 2], [32, "T", 5, 2],
	[38, "Y", 6, 2], [44, "U", 7, 2], [50, "I", 8, 2], [56, "O", 9, 2], [62, "P", 10, 2],
	[68, "[", 11, 2], [74, "]", 12, 2], [80, "\\", 13, 2],
	[86, "Del", 15, 2], [88, "End", 16, 2], [92, "Page Down", 17, 2],
	[98, "Num 7", 18, 2], [104, "Num 8", 19, 2], [110, "Num 9", 20, 2], [112, "Num +", 21, 2],

	[3, "Caps Lock", 0, 3], [9, "A", 1, 3], [15, "S", 2, 3], [21, "D", 3, 3], [27, "F", 4, 3], [33, "G", 5, 3],
	[39, "H", 6, 3], [45, "J", 7, 3], [51, "K", 8, 3], [57, "L", 9, 3], [63, ";", 10, 3],
	[69, "'", 11, 3], [81, "Enter", 13, 3],
	[93, "Num 4", 18, 3], [99, "Num 5", 19, 3], [105, "Num 6", 20, 3],

	[4, "Left Shift", 0, 4], [16, "Z", 1, 4], [22, "X", 2, 4], [28, "C", 3, 4], [34, "V", 4, 4], [40, "B", 5, 4],
	[46, "N", 6, 4], [52, "M", 7, 4], [58, ",", 8, 4], [64, ".", 9, 4], [70, "/", 10, 4],
	[76, "Right Shift", 12, 4], [82, "Up Arrow", 16, 4],
	[94, "Num 1", 18, 4], [100, "Num 2", 19, 4], [106, "Num 3", 20, 4], [107, "Num Enter", 21, 4],

	[5, "Left Ctrl", 0, 5], [11, "Left Win", 1, 5], [17, "Left Alt", 2, 5], [41, "Space", 6, 5],
	[53, "Right Alt", 9, 5], [59, "Fn1", 10, 5], [65, "Fn2", 11, 5], [71, "Right Ctrl", 12, 5],
	[77, "Left Arrow", 15, 5], [83, "Down Arrow", 16, 5], [89, "Right Arrow", 17, 5],
	[95, "Num 0", 18, 5], [101, "Num .", 20, 5],
];

const TABLE_SIZE = 126;

export function LedNames() { return KEYS.map(k => k[1]); }
export function LedPositions() { return KEYS.map(k => [k[2], k[3]]); }

let lastHw = "";
let lastCanvas = "";
let lastTime = 0;
let canvasReady = false;

export function Initialize() {
	lastHw = "";
	lastCanvas = "";
	canvasReady = false;
}

export function Render() {
	if (pluginMode === "SignalRGB Canvas") {
		renderCanvas();
	} else {
		renderHardware();
	}
}

export function Shutdown(SystemSuspending) {
	if (pluginMode === "SignalRGB Canvas") {
		lastCanvas = "";
		sendColors(SystemSuspending ? "#000000" : shutdownColor);
	}
	// У режимі Hardware Effect клавіатура просто продовжує свій ефект
}

// ---------- Вбудовані ефекти ----------

function renderHardware() {
	const state = [hwEffect, hwColorMode, hwColor, hwSpeed, hwBrightness].join("|");
	if (state === lastHw) { return; }      // шлемо лише коли щось змінилося
	lastHw = state;
	canvasReady = false;
	lastCanvas = "";

	const mode = EFFECTS[hwEffect] !== undefined ? EFFECTS[hwEffect] : 0x07;
	const speed = clamp(parseInt(hwSpeed), 0, 4, 2);
	const bright = clamp(parseInt(hwBrightness), 0, 4, 4);
	const colorMode = hwColorMode === "RGB" ? 0x08 : 0x07;
	const c = hexToRgb(hwColor);

	const head = [0x07, mode, speed, bright, colorMode, c[0], c[1], c[2]];
	const p = new Array(64).fill(0);
	for (let i = 0; i < head.length; i++) { p[i] = head[i]; }
	p[8] = checksum(head);
	sendFeature(p);
}

// ---------- Ефекти SignalRGB (поклавішно) ----------

function renderCanvas() {
	if (!canvasReady) {
		sendModeCustom();
		sendTable(0x13, new Array(TABLE_SIZE * 3).fill(0));
		canvasReady = true;
		lastHw = "";
	}
	const fps = parseInt(updateRate) || 5;
	const now = Date.now();
	if (now - lastTime < 1000 / fps) { return; }
	lastTime = now;
	sendColors();
}

function sendModeCustom() {
	const head = [0x07, 0x0D, 0x04, 0x04, 0x00, 0x00, 0xC8, 0xC8];
	const p = new Array(64).fill(0);
	for (let i = 0; i < head.length; i++) { p[i] = head[i]; }
	p[8] = checksum(head);     // = 0x53
	sendFeature(p);
}

function sendTable(cmd, data) {
	for (let part = 0; part < 7; part++) {
		const chunk = data.slice(part * 56, part * 56 + 56);
		const head = [cmd, 0x00, 0xFF, part, chunk.length, part === 6 ? 1 : 0, 0x00];
		const p = new Array(64).fill(0);
		for (let i = 0; i < 7; i++) { p[i] = head[i]; }
		p[7] = checksum(head);
		for (let i = 0; i < chunk.length; i++) { p[8 + i] = chunk[i]; }
		sendFeature(p);
	}
}

function sendColors(overrideColor) {
	const data = new Array(TABLE_SIZE * 3).fill(0);
	for (let k = 0; k < KEYS.length; k++) {
		const [idx, , x, y] = KEYS[k];
		let col;
		if (overrideColor) {
			col = hexToRgb(overrideColor);
		} else if (LightingMode === "Forced") {
			col = hexToRgb(forcedColor);
		} else {
			col = device.color(x, y);
		}
		data[idx * 3] = col[0];
		data[idx * 3 + 1] = col[1];
		data[idx * 3 + 2] = col[2];
	}
	const key = data.join(",");
	if (key === lastCanvas) { return; }
	lastCanvas = key;
	sendTable(0x0C, data);
}

// ---------- Допоміжне ----------

function sendFeature(packet64) {
	device.send_report([0x00].concat(packet64), 65);
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
