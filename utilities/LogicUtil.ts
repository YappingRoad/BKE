export default class LogicUtil {

    // this is some fucked up shit 
    public static and(bools: boolean[]) {
        let value = true;

        for (const bool of bools) {
            value = (value && bool);
            if (!value) {
                return false;
            }
        }
        return value;
    }
}