# SignalRGB plugins: ASUS TUF Gaming LC III LCD & HATOR Skyfall 100 Pro

🇺🇦 [Українська](#українська) · 🇬🇧 [English](#english)

> Неофіційні плагіни. Не пов'язані з ASUS, HATOR чи WhirlwindFX (SignalRGB). Використовуйте на власний ризик.
> Unofficial plugins. Not affiliated with ASUS, HATOR or WhirlwindFX (SignalRGB). Use at your own risk.

---

## Українська

### Що тут є

| Файл | Пристрій | Що вміє |
|---|---|---|
| `ASUS_TUF_LC_III_LCD.js` | Екран помпи **ASUS TUF Gaming LC III 360 ARGB LCD** (USB `0B05:1C7B`) | Виводить на екран помпи все, що малює модуль LCD у SignalRGB: циферблати, датчики, GIF, трансляцію екрана. Замінює ASUS InfoHub. |
| `HATOR_Skyfall_100_Pro.js` | Клавіатура **HATOR Skyfall 100 Pro** (USB `379A:1806`) | 18 вбудованих ефектів клавіатури з вибором кольору, швидкості та яскравості + режим ефектів SignalRGB (поклавішно). |

### Встановлення
1. Скопіюйте потрібний `.js` файл у `Документи\WhirlwindFX\Plugins`.
2. Повністю перезапустіть SignalRGB (значок у треї → Exit, потім запустіть знову).
3. Пристрій з'явиться у розділі **Devices**.

### Важливо
- **Помпа:** перед роботою закрийте ASUS InfoHub (плагін повідомляє SignalRGB про конфлікт). Частота кадрів налаштовується в параметрах пристрою (5–60). Для чіткої картинки в блоці *Effect Canvas* зменште **Blur**.
- **Клавіатура:** у режимі **Hardware Effect** анімацію малює сама клавіатура — плавно. У режимі **SignalRGB Canvas** клавіатура «моргає» при кожному оновленні кольорів (так працює її прошивка), тому живі ефекти на кшталт трансляції екрана на ній виглядають погано. За замовчуванням — ефект «Кольорова сітка» помаранчевим, схожий на багаття.
- Протестовано на одному комплекті обладнання (Windows 11, SignalRGB 2.5.x).

### Як це зроблено
Протоколи відновлено записом USB-обміну фірмових програм (Wireshark + USBPcap):
- **Помпа:** звіт HID 1024 байти `[0x08, N, 0x00, F] + 1020 байт JPEG`, кадр 320×320; перший пакет: N = кількість пакетів, F = 0x80; далі N = номер пакета, F = 0x00.
- **Клавіатура:** feature-звіти 64 байти в інтерфейс 2; ефект `07 MM SS BB CM RR GG BB КС`; поклавішна таблиця — команда `0x0C`, 126 позицій × RGB у 7 пакетах; КС = `0xFF − (сума байтів) & 0xFF`.

---

## English

### What's inside

| File | Device | Features |
|---|---|---|
| `ASUS_TUF_LC_III_LCD.js` | **ASUS TUF Gaming LC III 360 ARGB LCD** pump screen (USB `0B05:1C7B`) | Streams SignalRGB's LCD module output (faces, sensors, GIFs, screen mirroring) to the pump display. Replaces ASUS InfoHub. |
| `HATOR_Skyfall_100_Pro.js` | **HATOR Skyfall 100 Pro** keyboard (USB `379A:1806`) | 18 built-in hardware effects with color/speed/brightness, plus per-key SignalRGB canvas mode. |

### Install
1. Copy the `.js` file into `Documents\WhirlwindFX\Plugins`.
2. Fully restart SignalRGB (tray icon → Exit, then start again).
3. The device appears under **Devices**.

### Notes
- **Pump:** close ASUS InfoHub first. FPS is adjustable (5–60). Lower **Blur** on the *Effect Canvas* block for a sharp image.
- **Keyboard:** **Hardware Effect** mode is smooth (rendered by the keyboard). **SignalRGB Canvas** mode flickers on every color update due to the keyboard firmware, so live effects like screen ambience look poor.
- Tested on a single setup (Windows 11, SignalRGB 2.5.x).

### Protocol notes
- **Pump:** 1024-byte HID output report `[0x08, N, 0x00, F] + 1020 bytes of JPEG`, 320×320 frame; first packet N = packet count, F = 0x80; following packets N = index, F = 0x00.
- **Keyboard:** 64-byte feature reports on interface 2; effect `07 MM SS BB CM RR GG BB CHK`; per-key table command `0x0C`, 126 slots × RGB in 7 packets; CHK = `0xFF − (sum of bytes) & 0xFF`.

## License
MIT
