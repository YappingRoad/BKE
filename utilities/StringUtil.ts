export default class StringUtil {
    public static repeat(str:String, times:number):string {
        let buf = "";
        for (let i = 0; i < times; i++) {
            buf = `${buf}${str}`;
        }
        return buf;
    }
}