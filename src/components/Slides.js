
import { render, html, TemplateResult } from "lit-html";
import Button from "./Button";

// We have to redefine the modulo operation.
Number.prototype.mod = function(k) {
    return ((this%k)+k)%k;
};

/**
 * @class Slide
 */
export class Slide {
    /**
     * @desc Constructs a Slide object, which will be rendered by a SlideShow
     * object.
     * @param content
     * @param title
     */
    constructor(content, title="") {
        this.content = content;
        this.title = title;
    }
    
    render() {
        return html`
            <h2 class="slide--title">${this.title}</h2>
            <div class="slide--body">${this.content}</div>
        `;
    }
}

/**
 * @desc A click-scrollable deck of Slides with renderable HTML content.
 */
export class SlideShow {
    /**
     * @desc Constructor for the SlideShow class.
     * @param {HTMLElement} container HTML element which will contain the
     * SlideShow.
     * @param {Object[]} slides Slide objects.
     * @param {String} leftSymbol The symbol on the left button; is a leftwards
     * arrow HTML character by default.
     * @param {String} rightSymbol The symbol on the right button; is a rightwards
     * arrow by default.
     */
    constructor(
        container, slides=[], leftSymbol="←",
        rightSymbol="→"
    ) {
        // Add defaults.
        this.container = container;
        this.slides = slides;
        this.leftSymbol = leftSymbol;
        this.rightSymbol = rightSymbol;
    
        // Create a new template inside the container which allows space for the
        // control buttons and the content. By default, the SlideShow takes up
        // 80% of the container's width and 100% of its height; these styles are
        // specified in analysis.css.
        let innerTemplate = document.createElement("div");
        innerTemplate.className = "slideshow--inner";
        this.container.append(innerTemplate);
        this.viewer = innerTemplate;
    
        // Set the starting point and the current Slide.
        this.index = 0;
        this.current = this.slides[this.index];
    
        // Create Buttons which move us to the Left and to the Right.
        this._instantiateButtons();
    }
    
    /**
     * @desc Instantiates the left and right movement buttons.
     * @private
     */
    _instantiateButtons() {
        // Create two new container elements which will hold the buttons.
        let _leftButtonContainer = document.createElement("div"),
            _rightButtonContainer = document.createElement("div");
        
        // Set proper class names, IDs, prepend and append them to the SlideShow
        // container, and attach them to the SlideShow class.
        _leftButtonContainer.id = "left--button--container";
        _rightButtonContainer.id = "right--button--container";
        
        this._leftButtonContainer = _leftButtonContainer;
        this._rightButtonContainer = _rightButtonContainer;
        
        this.container.prepend(this._leftButtonContainer);
        this.container.append(this._rightButtonContainer);
        
        // Create Button objects.
        this.leftButton = new Button(
            this.left.bind(this),
            {
                label: this.leftSymbol,
                hoverText: "Previous chart.",
                optionalID: "leftButton",
                className: "button--slideshow"
            }
        );
        
        this.rightButton = new Button(
            this.right.bind(this),
            {
                label: this.rightSymbol,
                hoverText: "Next chart.",
                optionalID: "rightButton",
                className: "button--slideshow"
            }
        );
        
        // Attach the buttons.
        render(this.leftButton, this._leftButtonContainer);
        render(this.rightButton, this._rightButtonContainer);
    }
    
    /**
     * @desc Move to the previous Slide in the deck.
     * @param {Event} e onClick event emitted by the Button object.
     */
    left(e) {
        this.index = (this.index-1).mod(this.slides.length);
        this.current = this.slides[this.index];
        this.render();
    }
    
    /**
     * @desc Move to the next Slide in the deck.
     * @param {Event} e onClick event emitted by the Button object.
     */
    right(e) {
        this.index = (this.index+1).mod(this.slides.length);
        this.current = this.slides[this.index];
        this.render();
    }
    
    /**
     * @desc Adds a Slide object to the carousel of Slides.
     * @param {Slide} slide Slide.
     */
    addSlide(slide) {
        this.slides.push(slide);
    }
    
    /**
     * @desc Renders the current slide to the inner template HTML entity.
     */
    render() {
        render(this.current.render(), this.viewer);
    }
}

