import Color from "../math/Color";
import Platform from "../platform/Platform";

export default class Electron {
    public static isAvailable(): boolean {
        return Platform.getCurrent().getPlatformDetails().includes("electron");
        // return false;
    }

    public static sendNotification(title: string, body: string) {
        (globalThis as any).window.electronAPI.showNotification(title, body);
    }
    public static setAccentColor(color: Color) {
        (globalThis as any).window.electronAPI.setAccentColor(color.asCSSRGB());
    }

    public static toggleFullscreen() {
        (globalThis as any).window.electronAPI.toggleFullscreen();
    }

    public static getMemoryUsed(): Promise<number> {
        // return new Promise<number>((resolve, reject) => {
        //     resolve(0)
        // })
        return ((globalThis as any).window.electronAPI.Memory_getMemoryUsed() as Promise<number>);
    }

    public static getCPUUsage(): Promise<number> {
        // return new Promise<number>((resolve, reject) => {
        //     resolve(0)
        // })
        return ((globalThis as any).window.electronAPI.Memory_getCPUUsage() as Promise<number>);
    }
}