import Callback from "../Callback";
import Vector2 from "./Vector2";

export default class DeltaTracker {
    value: Vector2 | null = null;
    onChange: Callback<Vector2> = new Callback()
    diffOf(value: Vector2): Vector2 {
        if (this.value == null) {
            this.value = value;
            return Vector2.zero();
        }
        const differenceX = (value.x - this.value.x);
        const differenceY = (value.y - this.value.y);

        if (differenceX !== 0 || differenceY !== 0) {
            this.onChange.dispatch(value);
        }
        this.value = value;
        return {x: differenceX, y: differenceY};
    }


    clearValue() {
        this.value = null;
    }
}