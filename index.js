/*
    polyfill. Please, delete, if already have in your project
 */
window.requestAnimationFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (/* function */ callback, /* DOMElement */ element) {
            window.setTimeout(callback, 1000 / 60);
        };
})();
/*
    ============================================================
 */

document.addEventListener('DOMContentLoaded', proceedExecution);

function proceedExecution() {
    let baseElem = document.getElementsByClassName('base')[0],
        animationWrapperElem = document.getElementsByClassName('animation__wrapper')[0],
        animationElem = document.getElementsByClassName('animation')[0],
        sectionElem = document.getElementsByClassName('section')[0];

    // UNCOMMENT NEXT FUNCTION IF ANIMATION SHOULD PLAY ONLY AT SCROLLING
    /*runAsync(
        changeStyles,
        baseElem,
        sectionElem,
        [
            {'style.height': 'offsetWidth'},
            {'style.height': 'px'}
        ]
    );*/

    animation();
}

/*
 Input
    @elem1 - DOMElement: Which styles need to be changed
    @elem2 - DOMElement: Which styles take's
    @styles - Array of objects
        // At first object:
            Key - what should be changed in the elem1
            Value - what should be taken from the elem2
        // At second object:
            Key - additional param to elem1
            Value - additional param value

 Example: Set to elem1 height of elem2 width
        {'style.height': 'offsetWidth'},
        {'style.height': 'px'}
 */
function changeStyles(elem1, elem2, styles) {
    let stylesToSet = styles[0],
        additionalParam = styles[1];

    for (let key in stylesToSet) {
        let baseElem1Styles = key,
            baseElem2Styles = stylesToSet[key],
            baseElem1AdditionalParam = additionalParam[key];

        let {elem: el1, prop: prop1} = getNestedElemProps(elem1, getElemProps(baseElem1Styles)),
            {elem: el2, prop: prop2} = getNestedElemProps(elem2, getElemProps(baseElem2Styles));

        el1[prop1] = el2[prop2] + baseElem1AdditionalParam;
    }

    /*
     Input:
        styles - string: Styles divided by dot ('.')
     */
    function getElemProps(styles) {
        return styles.split('.');
    }

    /*
     Input:
        elem - DOMElement: Element what should be taken
        props - Array: Styles
     */
    function getNestedElemProps(elem, props) {
        let prop = props[0];

        if (props.length === 1) {
            return {elem, prop};
        }

        return getNestedElemProps(elem[prop], props.slice(1));
    }
}

/*
 Input
    @fn - Function: Function, which should be run asynchronously
    @param - Params divided by comma: Any number of params
 */
function runAsync(fn, ...param) {
    setTimeout(() => fn(...param), 0);
}

/*

 */
function animation() {
    setDefaultAnimationTransform();
    animationRunner();
}

function setDefaultAnimationTransform() {
    const REVERSE_ORDER = {},
        DIRECT_ORDER = {},
        TRANSLATE_3D_MAX_X_VALUE = 10,
        TRANSLATE_3D_MAX_Y_VALUE = 5,
        CALCULATION_SALT = 3,
        PICTURE_DIMENSION_VALUE = 0,
        SHADOW_DIMENSION_VALUE = -1,
        UNIT_TRANSLATE_3D_X = 'vw',
        UNIT_TRANSLATE_3D_Y = 'vh',
        UNIT_TRANSLATE_3D_Z = 'px';

    let blocks = document.getElementsByClassName('block'),
        foundedBlocks = blocks.length;

    for (let i = 0; i < foundedBlocks; i += 1) {
        let blockRowFirst = blocks[i].getElementsByClassName('row-first'),
            foundedRowsFirst = blockRowFirst.length,
            blockRowSecond = blocks[i].getElementsByClassName('row-second'),
            foundedRowsSecond = blockRowSecond.length;

        // set default translate3d synchronously
        setRow(blockRowFirst[0], DIRECT_ORDER);
        setRow(blockRowSecond[0], REVERSE_ORDER);

        if (foundedRowsFirst > 1 || blockRowSecond > 1) {
            // set default translate3d asynchronously starting from the second block
            for (let j = 1; j < foundedRowsFirst || foundedRowsSecond; j += 1) {
                runAsync(setRow, blockRowFirst[j], DIRECT_ORDER);
                runAsync(setRow, blockRowSecond[j], REVERSE_ORDER);
            }
        }
    }

    function setRow(rowElem, order = DIRECT_ORDER) {
        let pictures = rowElem.getElementsByClassName('picture'),
            foundedPicturesLen = pictures.length,
            shadows = rowElem.getElementsByClassName('shadow'),
            //foundedShadowsLen = shadows.length,
            isFloating = (order === DIRECT_ORDER) ? -1 : 1;

        // Use foundedPicturesLen here because count of pictures is equal to
        // count of shadows
        for (let i = 0; i < foundedPicturesLen; i += 1) {
            const picture = pictures[i],
                shadow = shadows[i],
                shadow_x = Math.random() * TRANSLATE_3D_MAX_X_VALUE,
                shadow_y = shadow_x + (Math.random() * CALCULATION_SALT),
                picture_x = shadow_x + (Math.random() * CALCULATION_SALT) * isFloating,
                picture_y = shadow_x + (Math.random() * CALCULATION_SALT) * isFloating;

            setTranslate3d(
                picture,
                picture_x, //Math.random() * TRANSLATE_3D_MAX_X_VALUE * isFloating,
                picture_y, //Math.random() * TRANSLATE_3D_MAX_Y_VALUE * isFloating,
                PICTURE_DIMENSION_VALUE
            );

            setTranslate3d(
                shadow,
                shadow_x, //Math.random() * TRANSLATE_3D_MAX_X_VALUE,
                shadow_y, //Math.random() * TRANSLATE_3D_MAX_Y_VALUE,
                SHADOW_DIMENSION_VALUE
            );

            isFloating *= -1;
        }
    }

    function setTranslate3d(elem, tx, ty, tz) {
        let x = tx + UNIT_TRANSLATE_3D_X,
            y = ty + UNIT_TRANSLATE_3D_Y,
            z = tz + UNIT_TRANSLATE_3D_Z;

        elem.style.transform = `translate3d(${x}, ${y}, ${z})`;
    }
}

function animationRunner() {
    /*
        ANIMATION OPTIONS
     */
    // These settings might have impact on performace
    const SCROLL_FPS = 24;

    // SYSTEM ANIMATION SETTINGS
    let animationStart = new Date(),
        animationPrevTime = animationStart;

    // DOM ELEMENTS
    const animationSection = document.getElementsByClassName('section')[0],
        blocks = document.getElementsByClassName('block'),
        pictures = document.getElementsByClassName('picture'),
        shadows = document.getElementsByClassName('shadow');

    // SIZES
    const innerClientWidth = window.innerWidth,
        blockWidth = blocks[0].offsetWidth,
        animationSectionWidth = animationSection.offsetWidth,
        animationToBeScrolled = animationSectionWidth - innerClientWidth,
        animationScrollStep = 2;

    // ANIMATION CALCULATIONS
    const blocksToBeFittedInWindow = innerClientWidth / blockWidth,
        numberOfTrackedBlockSimultaneously = Math.round(blocksToBeFittedInWindow + 1);

    let visibleBlocksIndexes = [];

    // SYSTEM ANIMATION
    const SCROLL_DIRECTION_RIGHT = 1,
        SCROLL_DIRECTION_LEFT = -1,
        ANIMATION_DEFAULT_SCROLLED = 0;

    let animationScrolled = ANIMATION_DEFAULT_SCROLLED,
        scrollDirection = SCROLL_DIRECTION_LEFT;

    function setStartSettings() {
        for(let i = 0, len = numberOfTrackedBlockSimultaneously; i < len; i += 1) {
            visibleBlocksIndexes.push(i);
        }
    }

    function updateVisibleBlocksIndexes() {

    }

    function proceedAnimation(timestamp) {
        const animationCurrentTime = new Date(),
            fps = animationCurrentTime - animationPrevTime;

        if (fps < SCROLL_FPS) {
            requestAnimationFrame(proceedAnimation);
            return;
        }

        /*
            Proceed animation
         */
        // ANIMATE section moving
        const sectionAfterScroll = animationScrolled + (animationScrollStep * scrollDirection);
        animationSection.style.left = sectionAfterScroll + 'px';

        animationScrolled = sectionAfterScroll;

        // ANIMATION SCROLL DIRECTION
        if (
            Math.abs(animationScrolled) > animationToBeScrolled
            || animationScrolled === ANIMATION_DEFAULT_SCROLLED
        ) {
            console.log('animation direction scroll finished');
            scrollDirection = scrollDirection === SCROLL_DIRECTION_LEFT
                ? SCROLL_DIRECTION_RIGHT
                : SCROLL_DIRECTION_LEFT;
        }

        console.log(visibleBlocksIndexes);

        /*
            Finish animation
         */
        animationPrevTime = new Date();
        requestAnimationFrame(proceedAnimation);
    }

    setStartSettings();
    requestAnimationFrame(proceedAnimation);
}
