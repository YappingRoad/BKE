import Color from "../math/Color";

export default class Electron {
    public static isAvailable(): boolean {
        return "electronAPI" in window;
    }

    public static sendNotification(title: string, body: string) {
        (window as any).electronAPI.showNotification(title, body);
    }
    public static setAccentColor(color:Color) {
        (window as any).electronAPI.setAccentColor(color.asCSSRGB());
    }

    public static toggleFullscreen() {
        (window as any).electronAPI.toggleFullscreen();
    }

    public static getMemoryUsed(): Promise<number> {
        return ((window as any).electronAPI.Memory_getMemoryUsed() as Promise<number>);
    }

    public static getCPUUsage(): Promise<number> {
        return ((window as any).electronAPI.Memory_getCPUUsage() as Promise<number>);
    }
}