(function () {
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
                                CODE
        ============================================================
     */

    document.addEventListener('DOMContentLoaded', proceedExecution);

    /*
        ============================================================
                                CHANGEABLE OPTIONS
        ============================================================
     */
    const ANIMATION_DIRECTION_UP = 1,
        ANIMATION_DIRECTION_DOWN = -1,
        DEFAULT_TRANSLATE_3D_MAX_VALUE = 5,
        // NO CHANGABLE
        PICTURE_DIMENSION_VALUE = 0,
        SHADOW_DIMENSION_VALUE = -1,
        UNIT_TRANSLATE_3D_X = 'vw',
        UNIT_TRANSLATE_3D_Y = 'vh',
        UNIT_TRANSLATE_3D_Z = 'px',
        COUNT_OF_BLOCK_ADDITIONAL_TRACK = 1,
        // MIGHT BE CHANGED IN ORDER TO FIND BEST EXPERIENCE
        // These settings might have impact on performance
        SCROLL_FPS = 1000,
        ANIMATION_TRANSLATE_3D_MOVING = 1,
        DEFAULT_ANIMATION_SCROLL_STEP = 200,
        DEFAULT_BLOCK_OPACITY = '0.5',
        FIRST_BLOCK_OPACITY = DEFAULT_BLOCK_OPACITY,
        CHANGE_OPACITY_SPEED = 0.1;

    /*
        ============================================================
                                NOT CHANGEABLE OPTIONS
        ============================================================
     */
    let TRANSLATE_3D_MAX_VALUE = DEFAULT_TRANSLATE_3D_MAX_VALUE,
        CALCULATION_SALT = 3,
        ANIMATION_SCROLL_STEP = DEFAULT_ANIMATION_SCROLL_STEP;

    function proceedExecution() {
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
    }

    function setUniqueId(elem, ...hash) {
        const _hash = hash.join('|');
        elem.id = _hash;
    }

    function getTranslate3dValues(cssTextStyleValue) {
        const cssText = cssTextStyleValue.split(','),
            x = cssText[0].split('(')[1].slice(0, -2),
            y = cssText[1].slice(0, -2),
            z = cssText[2].slice(0, -3);

        return {x, y, z};
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

    /*
     Input
        @fn - Function: Function, which should be run asynchronously
        @param - Params divided by comma: Any number of params
     */
    function runAsync(fn, ...param) {
        setTimeout(() => fn(...param), 0);
    }

    function animation() {
        setDefaultAnimationSettings();
        animationRunner();
    }

    function setDefaultAnimationSettings() {
        let blocks = document.getElementsByClassName('block'),
            foundedBlocks = blocks.length;

        for (let i = 0; i < foundedBlocks; i += 1) {
            let blockRowFirst = blocks[i].getElementsByClassName('row-first'),
                foundedRowsFirst = blockRowFirst.length,
                blockRowSecond = blocks[i].getElementsByClassName('row-second'),
                foundedRowsSecond = blockRowSecond.length;

            // set default translate3d synchronously
            setRow(blockRowFirst[0], ANIMATION_DIRECTION_DOWN);
            setRow(blockRowSecond[0], ANIMATION_DIRECTION_UP);

            if (foundedRowsFirst > 1 || blockRowSecond > 1) {
                // set default translate3d asynchronously starting from the second block
                for (let j = 1; j < foundedRowsFirst || foundedRowsSecond; j += 1) {
                    runAsync(setRow, blockRowFirst[j], ANIMATION_DIRECTION_DOWN);
                    runAsync(setRow, blockRowSecond[j], ANIMATION_DIRECTION_UP);
                }
            }
        }

        function setRow(rowElem, order = ANIMATION_DIRECTION_DOWN) {
            let pictures = rowElem.getElementsByClassName('picture'),
                foundedPicturesLen = pictures.length,
                shadows = rowElem.getElementsByClassName('shadow'),
                //foundedShadowsLen = shadows.length,
                isFloating = (order === ANIMATION_DIRECTION_DOWN) ? -1 : 1;

            // Use foundedPicturesLen here because count of pictures is equal to
            // count of shadows
            for (let i = 0; i < foundedPicturesLen; i += 1) {
                const picture = pictures[i],
                    shadow = shadows[i],
                    shadow_x = Math.random() * TRANSLATE_3D_MAX_VALUE,
                    shadow_y = shadow_x + (Math.random() * CALCULATION_SALT),
                    picture_x = (shadow_x + (Math.random() * CALCULATION_SALT)) * isFloating,
                    picture_y = (shadow_x + (Math.random() * CALCULATION_SALT)) * isFloating;

                setTranslate3d(
                    picture,
                    picture_x, //Math.random() * TRANSLATE_3D_MAX_VALUE * isFloating,
                    picture_y, //Math.random() * TRANSLATE_3D_MAX_Y_VALUE * isFloating,
                    PICTURE_DIMENSION_VALUE
                );
                setUniqueId(picture, picture_x.toString(), picture_y.toString(), PICTURE_DIMENSION_VALUE.toString());

                setTranslate3d(
                    shadow,
                    shadow_x, //Math.random() * TRANSLATE_3D_MAX_VALUE,
                    shadow_y, //Math.random() * TRANSLATE_3D_MAX_Y_VALUE,
                    SHADOW_DIMENSION_VALUE
                );
                setUniqueId(shadow, shadow_x.toString(), shadow_y.toString(), SHADOW_DIMENSION_VALUE.toString());

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
        // DOM ELEMENTS
        const animationSection = document.getElementsByClassName('section')[0],
            blocks = document.getElementsByClassName('block');

        // SIZES
        const innerClientWidth = window.innerWidth,
            blockWidth = blocks[0].offsetWidth,
            animationSectionWidth = animationSection.offsetWidth,
            animationToBeScrolled = animationSectionWidth - innerClientWidth;

        // ANIMATION CALCULATIONS
        const blocksToBeFittedInWindow = innerClientWidth / blockWidth,
            numberOfTrackedBlockSimultaneously = Math.round(blocksToBeFittedInWindow + COUNT_OF_BLOCK_ADDITIONAL_TRACK);

        let visibleBlocksIndexes = setStartTrackBlocks(numberOfTrackedBlockSimultaneously);
        setStartBlockOpacity(blocks, visibleBlocksIndexes);

        // SYSTEM ANIMATION
        const SCROLL_DIRECTION_RIGHT = 1,
            SCROLL_DIRECTION_LEFT = -1,
            ANIMATION_DEFAULT_SCROLLED = 0,
            elementPositions = {};

        // SYSTEM ANIMATION SETTINGS
        let animationStart = new Date(),
            animationPrevTime = animationStart,
            isFirstAnimationRun = true;

        let animationScrolled = ANIMATION_DEFAULT_SCROLLED,
            scrollDirection = SCROLL_DIRECTION_LEFT;

        let animationLoopHandler;

        function setStartTrackBlocks(numberOfTrackedBlockSimultaneously) {
            let result = [];

            for (let i = 0, len = numberOfTrackedBlockSimultaneously; i < len; i += 1) {
                result.push(i);
            }

            return result;
        }

        function setStartBlockOpacity(blocks, visibleBlocksIndexes) {
            blocks[visibleBlocksIndexes[0]].style.opacity = FIRST_BLOCK_OPACITY;
        }

        function updateTrackBlocks(blocks, currentTracked, animationScrolled, animationDirection) {
            let scrolledInDownDirection = 0;

            return (function (blocks, currentTracked, animationScrolled, animationDirection) {
                let currentTrackedBlocks = [...currentTracked];

                if (animationDirection === ANIMATION_DIRECTION_DOWN) {
                    const blockScrolled = Math.floor(Math.abs(animationScrolled / blockWidth)) - 1;
                    //console.log(blockScrolled);
                    if (blockScrolled <= 0) {
                        return [...currentTrackedBlocks];
                    }

                    const scrollNormalized = animationDirection * -1,
                        firstTracked = currentTrackedBlocks[0],
                        lastTracked = currentTrackedBlocks[currentTrackedBlocks.length - 1];

                    // check if first and last future elements exist
                    if (!blocks[firstTracked + scrollNormalized] || !blocks[lastTracked + scrollNormalized]) {
                        return [...currentTrackedBlocks];
                    }
                    return currentTrackedBlocks.map(index => index + blockScrolled * scrollNormalized);
                }

                if (animationDirection === ANIMATION_DIRECTION_UP) {
                    const blockScrolled = Math.floor(
                        Math.abs((animationScrolled - blockWidth * blocks.length) / blockWidth)
                    ) - 1;
                    console.log(
                        //(Math.abs(animationScrolled) - blockWidth * blocks.length) / blockWidth,
                        animationScrolled,
                        //blockScrolled
                    );
                }

                return [...currentTrackedBlocks];
            })(blocks, currentTracked, animationScrolled, animationDirection);
        }

        function updatedBlockOpacity(blocks, visibleBlocks, animationDirection) {
            const firstVisibleBlock = visibleBlocks[0];

            if (animationDirection === ANIMATION_DIRECTION_DOWN) {
                let currentOpacityFirstBlock = +blocks[firstVisibleBlock].style.opacity;
                //console.log(currentOpacityFirstBlock);
                let updatedOpacityFirstBlock = currentOpacityFirstBlock - CHANGE_OPACITY_SPEED;

                if (updatedOpacityFirstBlock < 0) {
                    updatedOpacityFirstBlock = 0;

                    // set next block to 0.5 opacity
                    const nextVisibleBlock = visibleBlocks[1];
                    blocks[nextVisibleBlock].style.opacity = `${DEFAULT_BLOCK_OPACITY}`;
                }

                blocks[firstVisibleBlock].style.opacity = `${updatedOpacityFirstBlock}`;
            }

            if (animationDirection === ANIMATION_DIRECTION_UP) {
                let currentOpacityFirstBlock = +blocks[firstVisibleBlock].style.opacity;
                let updatedOpacityFirstBlock = currentOpacityFirstBlock + CHANGE_OPACITY_SPEED;

                if (updatedOpacityFirstBlock > FIRST_BLOCK_OPACITY) {
                    updatedOpacityFirstBlock = FIRST_BLOCK_OPACITY;
                }

                blocks[firstVisibleBlock].style.opacity = `${updatedOpacityFirstBlock}`;
            }
        }

        function proceedAnimation() {
            const animationCurrentTime = new Date(),
                fps = animationCurrentTime - animationPrevTime;
            // In order do not proceed animation too often
            if (fps < SCROLL_FPS && !isFirstAnimationRun) {
                animationLoopHandler = requestAnimationFrame(proceedAnimation);
                return;
            } else {
                isFirstAnimationRun = false;
            }

            /*
                Proceed animation
             */
            // ANIMATE section moving
            const sectionAfterScroll = animationScrolled + (ANIMATION_SCROLL_STEP * scrollDirection);
            animationSection.style.left = sectionAfterScroll + 'px';

            animationScrolled = sectionAfterScroll;

            animatePicturesMoving(blocks, visibleBlocksIndexes, scrollDirection);

            visibleBlocksIndexes = updateTrackBlocks(blocks, visibleBlocksIndexes, animationScrolled, scrollDirection);
            console.log('visibleBlocksIndexes', visibleBlocksIndexes);
            updatedBlockOpacity(blocks, visibleBlocksIndexes, scrollDirection);

            // ANIMATION SCROLL DIRECTION
            if (
                Math.abs(animationScrolled) > animationToBeScrolled
                || animationScrolled === ANIMATION_DEFAULT_SCROLLED
            ) {
                //console.info('animation direction scroll finished. Change direction');
                scrollDirection = scrollDirection === SCROLL_DIRECTION_LEFT
                    ? SCROLL_DIRECTION_RIGHT
                    : SCROLL_DIRECTION_LEFT;
            }
            /*
                Finish animation
             */
            animationPrevTime = new Date();
            animationLoopHandler = requestAnimationFrame(proceedAnimation);
        }

        function animatePicturesMoving(blocks, trackedBlocksIndexes, direction) {
            trackedBlocksIndexes.forEach((index) => {
                const blockPictures = blocks[index].getElementsByClassName('picture'),
                    blockPicturesLen = blockPictures.length,
                    blockShadows = blocks[index].getElementsByClassName('shadow'),
                    blockShadowsLen = blockShadows.length;

                // SET PICTURES
                for (let i = 0; i < blockPicturesLen; i += 1) {
                    const sign = i % 2 === 0 ? 1 : -1;
                    animateElementTranslate3d(blockPictures[i], direction, sign);
                }

                // SET SHADOW
                for (let i = 0; i < blockShadowsLen; i += 1) {
                    const sign = i % 2 === 0 ? 1 : -1;
                    animateElementTranslate3d(blockShadows[i], direction, sign);
                }

                // BLOCK OPACITY
            });

            function animateElementTranslate3d(elem, direction, sign) {
                const _elem = elem,
                    elemId = _elem.id;

                if (direction === ANIMATION_DIRECTION_UP) {
                    const {x: xPic, y: yPic, z: zPic} = getTranslate3dValues(_elem.style.transform);
                    let {x: xPicNew, y: yPicNew, z: zPicNew} = getElemCoordinatesFromHistory(elemId);

                    if (xPicNew === undefined || yPicNew === undefined || zPicNew === undefined) {
                        xPicNew = (+xPic + ANIMATION_TRANSLATE_3D_MOVING * direction * sign);
                        yPicNew = (+yPic + ANIMATION_TRANSLATE_3D_MOVING * direction * sign);
                        zPicNew = zPic;
                    }

                    _elem.style.transform = `translate3d(
                ${xPicNew}${UNIT_TRANSLATE_3D_X}, 
                ${yPicNew}${UNIT_TRANSLATE_3D_Y}, 
                ${zPicNew}${UNIT_TRANSLATE_3D_Z}
                )`;

                    return;
                }

                const {x: xPic, y: yPic, z: zPic} = getTranslate3dValues(_elem.style.transform);
                const xPicNew = (+xPic + ANIMATION_TRANSLATE_3D_MOVING * direction * sign),
                    yPicNew = (+yPic + ANIMATION_TRANSLATE_3D_MOVING * direction * sign),
                    zPicNew = zPic;

                _elem.style.transform = `translate3d(
            ${xPicNew}${UNIT_TRANSLATE_3D_X}, 
            ${yPicNew}${UNIT_TRANSLATE_3D_Y}, 
            ${zPicNew}${UNIT_TRANSLATE_3D_Z}
            )`;

                trackElemCoordinatesHistory(elemId, xPicNew, yPicNew, zPicNew);
            }

            function trackElemCoordinatesHistory(elemId, x, y, z) {
                if (!elementPositions[elemId]) {
                    elementPositions[elemId] = [];
                }

                elementPositions[elemId].push({x, y, z});
            }

            function getElemCoordinatesFromHistory(elemId) {
                const lastPos = (!!elementPositions[elemId])
                    ? elementPositions[elemId].pop()
                    : undefined;

                if (!lastPos) {
                    return {x: undefined, y: undefined, z: undefined};
                }

                return {x: lastPos.x, y: lastPos.y, z: lastPos.z};
            }
        }

        // Start first automatic animation
        animationLoopHandler = requestAnimationFrame(proceedAnimation);

        /*
            USER INTERACTING WITH WEB PAGE
         */
        function userScrollHandlerAction() {
            let timeOutId,
                userPrevTop = (window.pageYOffset !== undefined)
                    ? window.pageYOffset
                    : (document.documentElement || document.body.parentNode || document.body).scrollTop;

            function userScrolling() {
                const userCurrTop = (window.pageYOffset !== undefined)
                    ? window.pageYOffset
                    : (document.documentElement || document.body.parentNode || document.body).scrollTop;

                // CLEAR PREV ANIMATION RUNNERS
                clearTimeout(timeOutId);
                window.cancelAnimationFrame(animationLoopHandler);

                TRANSLATE_3D_MAX_VALUE = 15;
                ANIMATION_SCROLL_STEP = 400;
                if (userCurrTop < userPrevTop) {
                    console.log('up'); // TODO: DEL
                    scrollDirection = ANIMATION_DIRECTION_UP;
                    proceedAnimation();
                } else {
                    console.log('down'); // TODO: DEL
                    scrollDirection = ANIMATION_DIRECTION_DOWN;
                    proceedAnimation();
                }
                userPrevTop = userCurrTop;

                timeOutId = setTimeout(() => {
                    TRANSLATE_3D_MAX_VALUE = DEFAULT_TRANSLATE_3D_MAX_VALUE;
                    ANIMATION_SCROLL_STEP = DEFAULT_ANIMATION_SCROLL_STEP;
                    animationLoopHandler = requestAnimationFrame(proceedAnimation);
                }, 1500);
            }

            window.addEventListener('scroll', userScrolling);
        }

        //userScrollHandlerAction();
    }
})();

//Changed?
