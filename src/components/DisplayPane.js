
import { render } from "lit-html";


class DisplayPane {
    /**
     * Constructor for the DisplayPane class.
     * @param id
     * @param width
     */
    constructor({ id="pane", width=0.5 }) {
        this.render = this.render.bind(this);
        this.id = id;
        this.container = document.getElementsByClassName("pane-contain")[0];
        
        // Create a unique HTML entity for this Pane; first, determine whether a
        // Pane with this already exists; if so, do nothing, otherwise create a
        // new object.
        var pane = document.getElementById(this.id);
        
        if (!pane) {
            // Create a new div the proper way and attach it to the parent
            // element.
            pane = document.createElement("div");
            pane.id = this.id;
            pane.className = "pane";
            this.container.appendChild(pane);
        }
        
        // Set the Pane's HTML entity as a property of the DisplayPane.
        this.pane = pane;
        
        // Set the Pane's width.
        this.width = width;
        
        // Set the inner content to be nothing, for now.
        this.inner = null;
    }
    
    set content(content) {
        this.inner = content;
    }
    
    render() {
        render(this.inner, this.pane);
    }
}

export default DisplayPane;
