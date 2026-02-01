import PhysicsReactable from "../interfaces/PhysicsReactable";
import Destroyable from "../interfaces/Destroyable";
import Drawable from "../interfaces/Drawable";
import PreloadRequestable from "../interfaces/PreloadRequestable";
import Updatable from "../interfaces/Updatable";

export type GameObject = Drawable | Updatable | PreloadRequestable | Destroyable | PhysicsReactable
