export default class BrowserUtil {
    public static isSafari(): boolean {
        return !BrowserUtil.isChrome() && !BrowserUtil.isFirefox() && 'WebkitAppearance' in document.documentElement.style;
    }


    public static isiOSPWA(): boolean {
        return ("standalone" in window.navigator && window.navigator.standalone == true && 'WebkitAppearance' in document.documentElement.style);
    }

    public static isChrome(): boolean {
        return "chrome" in window;
    }

    public static isFirefox(): boolean {
        return "netscape" in window
    }
}