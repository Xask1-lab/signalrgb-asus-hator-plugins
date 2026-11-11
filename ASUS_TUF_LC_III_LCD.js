// SignalRGB plugin: екран помпи ASUS TUF Gaming LC III 360 ARGB LCD (USB 0B05:1C7B)
// Тестова версія 1: SignalRGB малює кадр (модуль LCD), плагін лише відправляє його на помпу.
//
// Протокол (відновлено із запису USB-обміну ASUS InfoHub):
//   інтерфейс 1, вихідний звіт без номера, 1024 байти (для Windows: [0x00] + 1024)
//   дані пакета: [0x08, N, 0x00, F] + 1020 байт JPEG
//     перший пакет кадру: N = кількість пакетів у кадрі, F = 0x80
//     наступні пакети:     N = номер пакета (1, 2, ...), F = 0x00
//   кадр: JPEG 320x320 (InfoHub перевертає його на 180 градусів)

import LCD from "@SignalRGB/lcd";

export function Name() { return "ASUS TUF Gaming LC III LCD"; }
export function VendorId() { return 0x0B05; }
export function ProductId() { return 0x1C7B; }
export function Publisher() { return "Custom (Claude)"; }
export function Size() { return [1, 1]; }
export function DeviceType() { return "lcd"; }
// SignalRGB сам попросить закрити InfoHub, щоб програми не сперечались за екран
export function ConflictingProcesses() { return ["ASUS InfoHub.exe"]; }
export function Validate(endpoint) { return endpoint.interface === 1; }
export function LedNames() { return []; }
export function LedPositions() { return []; }

/* global
lcdFps:readonly
*/
export function ControllableParameters() {
	return [
		{property:"lcdFps", group:"", label:"Кадрів/с (FPS)", description:"Скільки кадрів на секунду відправляти на екран помпи", type:"combobox", values:["5", "10", "15", "20", "25", "30", "45", "60"], default:"25"},
	];
}

const SIZE = 320;          // роздільність екрана
const PAYLOAD = 1020;      // байт JPEG в одному пакеті
let lastTime = 0;

export function Initialize() {
	LCD.initialize({ width: SIZE, height: SIZE });
}

export function Render() {
	// обмеження частоти кадрів
	const fps = parseInt(lcdFps) || 25;
	const now = Date.now();
	if (now - lastTime < 1000 / fps) { return; }
	lastTime = now;

	sendFrame(LCD.getFrame({ format: "JPEG" }));
}

export function Shutdown(SystemSuspending) {
	// нічого не шлемо: помпа покаже свою заводську заставку після вимкнення
}

// Розбиває JPEG на пакети по 1020 байт і відправляє на помпу
function sendFrame(jpeg) {
	if (!jpeg || jpeg.length === 0) { return; }
	const total = Math.ceil(jpeg.length / PAYLOAD);
	if (total > 255) { return; }    // кадр завеликий для протоколу — пропускаємо

	for (let i = 0; i < total; i++) {
		const chunk = jpeg.slice(i * PAYLOAD, (i + 1) * PAYLOAD);
		const head = (i === 0) ? [0x08, total, 0x00, 0x80] : [0x08, i, 0x00, 0x00];
		const packet = [0x00].concat(head, chunk);
		while (packet.length < 1025) { packet.push(0); }   // доповнюємо до повного звіту
		device.write(packet, 1025);
	}
}
