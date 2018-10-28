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

const virtualElements = {},
    REVERSE_ORDER = {},
    DIRECT_ORDER = {},
    TRANSLATE_3D_MAX_X_VALUE = 10,
    TRANSLATE_3D_MAX_Y_VALUE = 5,
    CALCULATION_SALT = 3,
    PICTURE_DIMENSION_VALUE = 0,
    SHADOW_DIMENSION_VALUE = -1,
    UNIT_TRANSLATE_3D_X = 'vw',
    UNIT_TRANSLATE_3D_Y = 'vh',
    UNIT_TRANSLATE_3D_Z = 'px';

function setDefaultAnimationTransform() {


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
    const SCROLL_FPS = 24,
        ANIMATION_TRANSLATE_3D_MOVING = 0.05,
        ANIMATION_SCROLL_STEP = 2;

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
        animationToBeScrolled = animationSectionWidth - innerClientWidth;

    // ANIMATION CALCULATIONS
    const blocksToBeFittedInWindow = innerClientWidth / blockWidth,
        numberOfTrackedBlockSimultaneously = Math.round(blocksToBeFittedInWindow + 2);

    let visibleBlocksIndexes = setStartTrackBlocks(numberOfTrackedBlockSimultaneously);

    // SYSTEM ANIMATION
    const SCROLL_DIRECTION_RIGHT = 1,
        SCROLL_DIRECTION_LEFT = -1,
        ANIMATION_DEFAULT_SCROLLED = 0;

    let animationScrolled = ANIMATION_DEFAULT_SCROLLED,
        scrollDirection = SCROLL_DIRECTION_LEFT;

    function setStartTrackBlocks(numberOfTrackedBlockSimultaneously) {
        let result = [];

        for (let i = 0, len = numberOfTrackedBlockSimultaneously; i < len; i += 1) {
            result.push(i);
        }

        return result;
    }

    function updateTrackBlocks(blocks, currentTracked) {
        let currentTrackedBlocks = [...currentTracked];

        const firstTrackBlock = currentTrackedBlocks.splice(0, 1)[0],
            lastTrackBlock = currentTrackedBlocks.splice(-1, 1)[0];

        const firstBlockX = blocks[firstTrackBlock].getBoundingClientRect().x,
            lastBlockX = blocks[lastTrackBlock].getBoundingClientRect().x;

        if ((Math.abs(firstBlockX) - blockWidth / 4) > blockWidth) {
            const nextBlockIndex = lastTrackBlock + 1;

            if (!blocks[nextBlockIndex]) { // NO changes - no more block left
                return [firstTrackBlock, ...currentTrackedBlocks, lastTrackBlock];
            }

            return [...currentTrackedBlocks, lastTrackBlock, nextBlockIndex];
        }

        // TODO: NEED TO CHANGE
        if (Math.abs(lastBlockX) > (blockWidth * numberOfTrackedBlockSimultaneously - blockWidth / 2)) {
            const prevBlockIndex = firstTrackBlock - 1;

            if (!blocks[prevBlockIndex]) { // NO changes - no more block left
                return [firstTrackBlock, ...currentTrackedBlocks, lastTrackBlock];
            }

            return [prevBlockIndex, firstTrackBlock, ...currentTrackedBlocks];
        }

        return currentTracked;
    }

    function proceedAnimation(timestamp) {
        const animationCurrentTime = new Date(),
            fps = animationCurrentTime - animationPrevTime;

        // In order do not proceed animation too often
        if (fps < SCROLL_FPS) {
            requestAnimationFrame(proceedAnimation);
            return;
        }

        /*
            Proceed animation
         */
        // ANIMATE section moving
        const sectionAfterScroll = animationScrolled + (ANIMATION_SCROLL_STEP * scrollDirection);
        animationSection.style.left = sectionAfterScroll + 'px';

        animationScrolled = sectionAfterScroll;

        animatePicturesMoving(blocks, visibleBlocksIndexes, scrollDirection);

        // ANIMATION SCROLL DIRECTION
        if (
            Math.abs(animationScrolled) > animationToBeScrolled
            || animationScrolled === ANIMATION_DEFAULT_SCROLLED
        ) {
            console.info('animation direction scroll finished. Change direction');
            scrollDirection = scrollDirection === SCROLL_DIRECTION_LEFT
                ? SCROLL_DIRECTION_RIGHT
                : SCROLL_DIRECTION_LEFT;
        }

        visibleBlocksIndexes = updateTrackBlocks(blocks, visibleBlocksIndexes);

        /*
            Finish animation
         */
        animationPrevTime = new Date();
        requestAnimationFrame(proceedAnimation);
    }

    // Start first animation
    requestAnimationFrame(proceedAnimation);

    function animatePicturesMoving(blocks, trackedBlocksIndexes, direction) {
        trackedBlocksIndexes.forEach((index) => {
            const blockPictures = blocks[index].getElementsByClassName('picture'),
                blockPicturesLen = blockPictures.length,
                blockShadows = blocks[index].getElementsByClassName('shadow'),
                blockShadowsLen = blockShadows.length;

            // SET PICTURES
            for (let i = 0; i < blockPicturesLen; i += 1) {
                const {x: xPic, y: yPic, z: zPic} = getTranslate3dValues(blockPictures[i].style.transform);

                const xPicNew = (+xPic + ANIMATION_TRANSLATE_3D_MOVING * direction) + UNIT_TRANSLATE_3D_X,
                    yPicNew = (+yPic + ANIMATION_TRANSLATE_3D_MOVING * direction) + UNIT_TRANSLATE_3D_Y,
                    zPicNew = zPic + UNIT_TRANSLATE_3D_Z;

                blockPictures[i].style.transform = `translate3d(${xPicNew}, ${yPicNew}, ${zPicNew})`;
            }

            // SET SHADOW
            for (let i = 0; i < blockShadowsLen; i += 1) {
                const {x: xPic, y: yPic, z: zPic} = getTranslate3dValues(blockShadows[i].style.transform);

                const xPicNew = (+xPic + Math.random() * ANIMATION_TRANSLATE_3D_MOVING * direction) + UNIT_TRANSLATE_3D_X,
                    yPicNew = (+yPic + Math.random() * ANIMATION_TRANSLATE_3D_MOVING * direction) + UNIT_TRANSLATE_3D_Y,
                    zPicNew = zPic + UNIT_TRANSLATE_3D_Z;

                blockShadows[i].style.transform = `translate3d(${xPicNew}, ${yPicNew}, ${zPicNew})`;
            }
        });
    }
}

function getTranslate3dValues(cssTextStyleValue) {
    const cssText = cssTextStyleValue.split(','),
        x = cssText[0].split('(')[1].slice(0, -2),
        y = cssText[1].slice(0, -2),
        z = cssText[2].slice(0, -3);

    debugger;

    return {x, y, z};
}
