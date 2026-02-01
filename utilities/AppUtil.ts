export default class AppUtil {
    public static restart() {
        window.location.href += " ";
        window.sessionStorage.setItem("restarting", "yes")
    }
}