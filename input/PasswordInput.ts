import Callback from "../Callback";
import Destroyable from "../interfaces/Destroyable";
import MathUtil from "../utilities/MathUtil";
import TextInput from "./TextInput";

export default class PasswordInput extends TextInput {
    constructor() {
        super();
        this.inputElem.type = "password";
    }
}
