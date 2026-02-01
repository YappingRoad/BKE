export default class Android {
    public static isAvailable(): boolean {
        return "androidAPI" in window;
    }

}