export default class ArrayUtil {
    public static getKeys<K, V>(map: Map<K, V>): K[] {
        let keys: K[] = [];
        for (const key of map.keys()) {
            keys.push(key);
        }
        return keys;
    }

    public static getValues<K, V>(map: Map<K, V>): V[] {
        let values: V[] = [];
        for (const key of map.values()) {
            values.push(key);
        }
        return values;
    }
}