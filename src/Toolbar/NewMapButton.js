import { main } from "../index";
import Tool from "./Tool";

export default class NewMapButton extends Tool {
    constructor() {
        super("new", "New Map", "New");
        this.activate = main;
    }
}
