'use strict';

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

    /*
        ============================================================
                                CHANGEABLE OPTIONS
        ============================================================
     */

    // NO CHANGABLE
    const ANIMATION_DIRECTION_UP = 1,
        ANIMATION_DIRECTION_DOWN = -1,
        DEFAULT_TRANSLATE_3D_MAX_VALUE = 5,
        SCROLL_DIRECTION_RIGHT = 1,
        SCROLL_DIRECTION_LEFT = -1,
        ANIMATION_DEFAULT_SCROLLED = 0,
        // NO CHANGABLE
        PICTURE_DIMENSION_VALUE = 0,
        SHADOW_DIMENSION_VALUE = -1,
        UNIT_TRANSLATE_3D_X = 'vw',
        UNIT_TRANSLATE_3D_Y = 'vh',
        UNIT_TRANSLATE_3D_Z = 'px',
        COUNT_OF_BLOCK_ADDITIONAL_TRACK = 1,
        NO_OPACITY = 0,
        FULL_OPACITY = 1,
        // MIGHT BE CHANGED IN ORDER TO FIND BEST EXPERIENCE
        // These settings might have impact on performance
        TIME_TO_WAIT_BEFORE_START_ANIMATION = 1000,
        SCROLL_FPS = 1500,
        DEFAULT_ANIMATION_TRANSLATE_3D_MOVING = 1,
        DEFAULT_ANIMATION_SCROLL_STEP = 200,
        // OPTION: opacity - BETTER not change
        DEFAULT_FIRST_BLOCK_OPACITY = '0.5',
        DEFAULT_SECOND_BLOCK_OPACITY = '0.9',
        FIRST_BLOCK_OPACITY = DEFAULT_FIRST_BLOCK_OPACITY,
        SECOND_BLOCK_OPACITY = DEFAULT_SECOND_BLOCK_OPACITY,
        CHANGE_OPACITY_SPEED = 0.15,
        CHANGE_OPACITY_SPEED_INCREASED = 0.25;

    /*
        ============================================================
                                NOT CHANGEABLE OPTIONS
        ============================================================
     */
    let TRANSLATE_3D_MAX_VALUE = DEFAULT_TRANSLATE_3D_MAX_VALUE,
        CALCULATION_SALT = 2,
        ANIMATION_SCROLL_STEP = DEFAULT_ANIMATION_SCROLL_STEP,
        ANIMATION_TRANSLATE_3D_MOVING = DEFAULT_ANIMATION_TRANSLATE_3D_MOVING;

    let cancelAnimationFrameCallback,
        cancelAnimationProceedRestoringInitialElementsSettingsFrameCallback,
        proceedAnimationFn;

    // DOM ELEMENTS
    const animationSectionDOM = document.getElementsByClassName('section')[0],
        animationBlocksDOM = document.getElementsByClassName('block'),
        animationPicturesDOM = document.getElementsByClassName('picture');

    /*
        Animation state variables
     */
    const defaultElementsPositions = {};
    let scrollDirection = SCROLL_DIRECTION_LEFT;

    document.addEventListener('DOMContentLoaded', run);
    window.addEventListener('resize', run);

    function run() {
        if (!!cancelAnimationFrameCallback) {
            window.cancelAnimationFrame(cancelAnimationFrameCallback);
        }

        if(!!cancelAnimationProceedRestoringInitialElementsSettingsFrameCallback) {
            window.cancelAnimationFrame(cancelAnimationProceedRestoringInitialElementsSettingsFrameCallback);
        }

        window.removeEventListener('scroll', userScrolling);

        proceedExecution();
    }

    function proceedExecution() {
        // Uncomment to dynamically set up scrolling area
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
        window.addEventListener('scroll', userScrolling);
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

        return _hash;
    }

    function getTranslate3dValues(cssTextStyleValue) {
        const cssText = cssTextStyleValue.split(',');

        if (!cssText[0] || !cssText[0].length) {
            return {x: 0, y: 0, z: 0}
        }

        const x = cssText[0].split('(')[1].slice(0, -2),
            y = cssText[1].slice(0, -2),
            z = cssText[2].slice(0, -3);

        return {x, y, z};
    }

    function setTranslate3d(elem, tx, ty, tz) {
        let x = tx + UNIT_TRANSLATE_3D_X,
            y = ty + UNIT_TRANSLATE_3D_Y,
            z = tz + UNIT_TRANSLATE_3D_Z;

        elem.style.transform = `translate3d(${x}, ${y}, ${z})`;
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
        setDefaultAnimationPicturesAndShadowsSettings();
        animationRunner();
    }

    function setDefaultAnimationPicturesAndShadowsSettings() {
        let blocks = document.getElementsByClassName('block'),
            foundedBlocks = blocks.length;

        for (let i = 0; i < foundedBlocks; i += 1) {
            let blockRowFirstDOM = blocks[i].getElementsByClassName('row-first'),
                foundedRowsFirst = blockRowFirstDOM.length,
                blockRowSecondDOM = blocks[i].getElementsByClassName('row-second'),
                foundedRowsSecond = blockRowSecondDOM.length,
                blockDOM = blocks[i];

            // (SET): DEFAULT translate3d synchronously
            setRow(blockRowFirstDOM[0], ANIMATION_DIRECTION_DOWN);
            setRow(blockRowSecondDOM[0], ANIMATION_DIRECTION_UP);

            if (foundedRowsFirst > 1 || blockRowSecondDOM > 1) {
                // (SET): DEFAULT translate3d asynchronously starting from the second block
                for (let j = 1; j < foundedRowsFirst || foundedRowsSecond; j += 1) {
                    runAsync(setRow, blockRowFirstDOM[j], ANIMATION_DIRECTION_DOWN);
                    runAsync(setRow, blockRowSecondDOM[j], ANIMATION_DIRECTION_UP);
                }
            }

            // (SET): DEFAULT blocks transition
            const blockDOMUniqueId = setUniqueId(blockDOM, Math.random(), Math.random(), Math.random());
            saveInitialAnimationSettings(blockDOMUniqueId, 0, 0, 0);
        }

        function setRow(rowElem, order = ANIMATION_DIRECTION_DOWN) {
            let picturesDOM = rowElem.getElementsByClassName('picture'),
                foundedPicturesLen = picturesDOM.length,
                shadowsDOM = rowElem.getElementsByClassName('shadow'),
                //foundedShadowsLen = shadows.length,
                isFloating = (order === ANIMATION_DIRECTION_DOWN) ? -1 : 1;

            // Use foundedPicturesLen here because count of picturesDOM is equal to
            // count of shadows
            for (let i = 0; i < foundedPicturesLen; i += 1) {
                const pictureDOM = picturesDOM[i],
                    shadowDOM = shadowsDOM[i],
                    shadow_x = Math.random() * TRANSLATE_3D_MAX_VALUE,
                    shadow_y = shadow_x + (Math.random() * CALCULATION_SALT),
                    picture_x = (shadow_x + (Math.random() * CALCULATION_SALT)) * isFloating,
                    picture_y = (shadow_x + (Math.random() * CALCULATION_SALT)) * isFloating;

                setTranslate3d(
                    pictureDOM,
                    picture_x,
                    picture_y,
                    PICTURE_DIMENSION_VALUE
                );
                const pictureUniqueId = setUniqueId(
                    pictureDOM, picture_x.toString(), picture_y.toString(), PICTURE_DIMENSION_VALUE.toString()
                );
                saveInitialAnimationSettings(pictureUniqueId, picture_x, picture_y, PICTURE_DIMENSION_VALUE);

                setTranslate3d(
                    shadowDOM,
                    shadow_x,
                    shadow_y,
                    SHADOW_DIMENSION_VALUE
                );
                const shadowUniqueId = setUniqueId(
                    shadowDOM, shadow_x.toString(), shadow_y.toString(), SHADOW_DIMENSION_VALUE.toString()
                );
                saveInitialAnimationSettings(shadowUniqueId, shadow_x, shadow_y, SHADOW_DIMENSION_VALUE);

                isFloating *= -1;
            }
        }
    }

    function saveInitialAnimationSettings(elementUniqueId, x, y, z) {
        defaultElementsPositions[elementUniqueId] = {x, y, z};
    }

    function restoreInitialAnimationSettings() {
        for (let elemId in defaultElementsPositions) {
            const elem = document.getElementById(elemId);
            setTranslate3d(
                elem,
                defaultElementsPositions[elemId].x,
                defaultElementsPositions[elemId].y,
                defaultElementsPositions[elemId].z,
            );
        }
    }

    function animationRunner() {
        // SIZES
        const innerClientWidth = window.innerWidth,
            blockWidth = animationBlocksDOM[0].offsetWidth,
            animationSectionWidth = animationSectionDOM.offsetWidth,
            animationToBeScrolled = animationSectionWidth - innerClientWidth;

        // ANIMATION CALCULATIONS
        const blocksToBeFittedInWindow = innerClientWidth / blockWidth,
            numberOfTrackedBlockSimultaneously = Math.round(blocksToBeFittedInWindow + COUNT_OF_BLOCK_ADDITIONAL_TRACK);

        let visibleBlocksIndexes = setInitialBlocksTrackList(numberOfTrackedBlockSimultaneously);
        setInitialBlocksOpacity(animationBlocksDOM, visibleBlocksIndexes);

        // SYSTEM ANIMATION
        //const elementPositions = {};

        // SYSTEM ANIMATION SETTINGS
        let animationStart = new Date(),
            animationPrevTime = animationStart,
            isFirstAnimationRun = true,
            sectionBordersTimeout;

        let animationScrolled = ANIMATION_DEFAULT_SCROLLED,
            animationSectionScrolledMaxTracking = 0,
            animationBlockScrolledTracking = -100;

        function setInitialBlocksTrackList(numberOfTrackedBlockSimultaneously) {
            let result = [];

            for (let i = 0, len = numberOfTrackedBlockSimultaneously; i < len; i += 1) {
                result.push(i);
            }

            return result;
        }

        function setInitialBlocksOpacity(blocks, visibleBlocksIndexes) {
            blocks[visibleBlocksIndexes[0]].style.opacity = FIRST_BLOCK_OPACITY;
            blocks[visibleBlocksIndexes[1]].style.opacity = SECOND_BLOCK_OPACITY;
        }

        function updateBlocksTrackList(blocks, currentTrackedBlocks, animationSectionScrolled, animationSectionScrollDirection) {
            let _currentTrackedBlocks = [...currentTrackedBlocks],
                _animationSectionScrolled = Math.abs(animationSectionScrolled),
                _sizeSectionScrolledTo = 0;

            if (animationSectionScrollDirection === ANIMATION_DIRECTION_DOWN) {
                animationSectionScrolledMaxTracking = (animationSectionScrolledMaxTracking > _animationSectionScrolled)
                    ? animationSectionScrolledMaxTracking
                    : _animationSectionScrolled;

                _sizeSectionScrolledTo = _animationSectionScrolled;
            }

            if (animationSectionScrollDirection === ANIMATION_DIRECTION_UP) {
                _sizeSectionScrolledTo = animationSectionScrolledMaxTracking - _animationSectionScrolled;
            }

            const blockScrolled = Math.floor(_sizeSectionScrolledTo / blockWidth) - 1;
            if (blockScrolled <= 0 || blockScrolled === animationBlockScrolledTracking) {
                return [..._currentTrackedBlocks];
            }
            animationBlockScrolledTracking = blockScrolled;

            const scrollNormalized = animationSectionScrollDirection * -1,
                firstTracked = _currentTrackedBlocks[0],
                lastTracked = _currentTrackedBlocks[_currentTrackedBlocks.length - 1];

            // Check IF first and last future elements exist
            if (!blocks[firstTracked + scrollNormalized] || !blocks[lastTracked + scrollNormalized]) {
                return [..._currentTrackedBlocks];
            }

            return _currentTrackedBlocks.map(index => index + scrollNormalized);
        }

        // TODO: Get rid of
        let opacityHelper_TrackedPrevBlocks = [];
        // TODO: Improve
        function updatedBlocksOpacity(blocks, currentTrackedBlocks, animationSectionScrollDirection) {
            // ELEMENT, which no longer seeing
            if(!!opacityHelper_TrackedPrevBlocks[0] && opacityHelper_TrackedPrevBlocks[0] !== currentTrackedBlocks[0]) {
                blocks[opacityHelper_TrackedPrevBlocks[0]].style.opacity = NO_OPACITY;
            }

            const firstVisibleBlock = currentTrackedBlocks[0],
                currentFirstBlockOpacity = +blocks[firstVisibleBlock].style.opacity,
                secondVisibleBlock = currentTrackedBlocks[1],
                currentSecondBlockOpacity = +blocks[secondVisibleBlock].style.opacity;

            let updatedFirstBlockOpacity = 0,
                updatedSecondBlockOpacity = 0;

            // TODO: Rewrite
            if (animationSectionScrollDirection === ANIMATION_DIRECTION_DOWN) {
                if(currentFirstBlockOpacity === FULL_OPACITY && currentSecondBlockOpacity === FULL_OPACITY) {
                    updatedFirstBlockOpacity = FIRST_BLOCK_OPACITY - CHANGE_OPACITY_SPEED_INCREASED;
                    updatedSecondBlockOpacity = SECOND_BLOCK_OPACITY - CHANGE_OPACITY_SPEED;
                } else {
                    updatedFirstBlockOpacity = currentFirstBlockOpacity - CHANGE_OPACITY_SPEED_INCREASED;
                    updatedSecondBlockOpacity = currentSecondBlockOpacity - CHANGE_OPACITY_SPEED;

                    if (updatedFirstBlockOpacity < NO_OPACITY) {
                        updatedFirstBlockOpacity = NO_OPACITY;
                    }

                    if(updatedSecondBlockOpacity < DEFAULT_FIRST_BLOCK_OPACITY) {
                        updatedSecondBlockOpacity = DEFAULT_FIRST_BLOCK_OPACITY;
                    }
                }
            }

            if (animationSectionScrollDirection === ANIMATION_DIRECTION_UP) {
                updatedFirstBlockOpacity = currentFirstBlockOpacity + CHANGE_OPACITY_SPEED;
                updatedSecondBlockOpacity = currentSecondBlockOpacity + CHANGE_OPACITY_SPEED_INCREASED;

                if (updatedFirstBlockOpacity > FIRST_BLOCK_OPACITY) {
                    updatedFirstBlockOpacity = FIRST_BLOCK_OPACITY;
                }

                if(updatedSecondBlockOpacity > FULL_OPACITY) {
                    updatedSecondBlockOpacity = FULL_OPACITY;
                }

                //debugger;

                const zeroVisibleBlock = firstVisibleBlock - 0;
                if(!!blocks[zeroVisibleBlock]) {
                    blocks[firstVisibleBlock].style.opacity = `${updatedFirstBlockOpacity}`;
                }

                updatedFirstBlockOpacity = updatedSecondBlockOpacity;
                updatedSecondBlockOpacity = FULL_OPACITY;
            }

            blocks[firstVisibleBlock].style.opacity = `${updatedFirstBlockOpacity}`;
            blocks[secondVisibleBlock].style.opacity = `${updatedSecondBlockOpacity}`;

            opacityHelper_TrackedPrevBlocks = currentTrackedBlocks;
        }

        proceedAnimationFn = function proceedAnimation() {
            const animationCurrentTime = new Date(),
                fps = animationCurrentTime - animationPrevTime,
                sectionAfterScroll = animationScrolled + (ANIMATION_SCROLL_STEP * scrollDirection);

            // In order do not proceed animation too often
            if (fps < SCROLL_FPS && !isFirstAnimationRun) {
                window.cancelAnimationFrame(cancelAnimationFrameCallback);
                cancelAnimationFrameCallback = requestAnimationFrame(proceedAnimation);
                return;
            } else {
                isFirstAnimationRun = false;
            }

            // Check, that section is moving in right frames
            if (sectionAfterScroll > 0 || Math.abs(sectionAfterScroll) > animationToBeScrolled) {
                scrollDirection = scrollDirection === SCROLL_DIRECTION_LEFT
                    ? SCROLL_DIRECTION_RIGHT
                    : SCROLL_DIRECTION_LEFT;

                clearTimeout(sectionBordersTimeout);
                sectionBordersTimeout = setTimeout(() => {
                    proceedRestoringInitialElementsSettings();
                    window.cancelAnimationFrame(cancelAnimationFrameCallback);
                    cancelAnimationFrameCallback = requestAnimationFrame(proceedAnimation);
                }, SCROLL_FPS);

                return;
            }

            /*
                ============================================================
                                    Proceed animation
                ============================================================
             */

            /*
                ============================================================
                                    Picture moving animation
                ============================================================
             */
            proceedAnimationMoving(animationBlocksDOM, visibleBlocksIndexes, scrollDirection);

            /*
                ============================================================
                                    Section moving animation
                ============================================================
             */
            animationSectionDOM.style.left = sectionAfterScroll + 'px';

            animationScrolled = sectionAfterScroll;

            visibleBlocksIndexes = updateBlocksTrackList(animationBlocksDOM, visibleBlocksIndexes, animationScrolled, scrollDirection);
            updatedBlocksOpacity(animationBlocksDOM, visibleBlocksIndexes, scrollDirection);

            // Check animation scroll direction
            if (
                Math.abs(animationScrolled) > animationToBeScrolled
                || animationScrolled === ANIMATION_DEFAULT_SCROLLED
            ) {
                //console.info('animation direction scroll finished. Change direction');
                scrollDirection = scrollDirection === SCROLL_DIRECTION_LEFT
                    ? SCROLL_DIRECTION_RIGHT
                    : SCROLL_DIRECTION_LEFT;

                proceedRestoringInitialElementsSettings();
            }

            /*
                Finish animation
             */
            animationPrevTime = new Date();
            window.cancelAnimationFrame(cancelAnimationFrameCallback);
            cancelAnimationFrameCallback = requestAnimationFrame(proceedAnimation);
        };

        function proceedAnimationMoving(blocksDOM, trackedBlocksIndexes, direction) {
            trackedBlocksIndexes.forEach((index) => {
                const blockPicturesDOM = blocksDOM[index].getElementsByClassName('picture'),
                    blockPicturesLen = blockPicturesDOM.length,
                    blockShadowsDOM = blocksDOM[index].getElementsByClassName('shadow'),
                    blockShadowsLen = blockShadowsDOM.length,
                    blockDOM = blocksDOM[index];

                // SET PICTURES
                for (let i = 0; i < blockPicturesLen; i += 1) {
                    const sign = i % 2 === 0 ? 1 : -1;
                    animateElementTranslate3d(blockPicturesDOM[i], direction, sign, ANIMATION_TRANSLATE_3D_MOVING);
                }

                // SET SHADOW
                for (let i = 0; i < blockShadowsLen; i += 1) {
                    const sign = i % 2 === 0 ? 1 : -1;
                    animateElementTranslate3d(blockShadowsDOM[i], direction, sign, ANIMATION_TRANSLATE_3D_MOVING);
                }

                // BLOCK OPACITY

                // Block moving
                animateElementTranslate3d(blockDOM, direction, 1, ANIMATION_TRANSLATE_3D_MOVING);
            });

            function animateElementTranslate3d(elemDOM, direction, sign, salt) {
                const _elemDOM = elemDOM,
                    {x: xPic, y: yPic, z: zPic} = getTranslate3dValues(_elemDOM.style.transform);

                let xPicNew = (+xPic + salt * direction * sign),
                    yPicNew = (+yPic + salt * direction * sign),
                    zPicNew = zPic;

                xPicNew = Math.abs(xPicNew) > 20 ? (+xPic) : xPicNew;
                yPicNew = Math.abs(yPicNew) > 20 ? (+yPic) : yPicNew;

                _elemDOM.style.transform = `translate3d(
                ${xPicNew}${UNIT_TRANSLATE_3D_X}, 
                ${yPicNew}${UNIT_TRANSLATE_3D_Y}, 
                ${zPicNew}${UNIT_TRANSLATE_3D_Z}
                )`;

            }
        }

        function proceedRestoringInitialElementsSettings() {
            // RESTORE default elements position
            console.log('proceedRestoringInitialElementsSettings');
            window.cancelAnimationFrame(cancelAnimationProceedRestoringInitialElementsSettingsFrameCallback);
            restoreInitialAnimationSettings();
        }

        // Start first automatic animation
        cancelAnimationFrameCallback = requestAnimationFrame(proceedAnimationFn);
    }

    /*
        ============================================================
                    USER SCROLLING
        ============================================================
    */
    let timeOutId,
        userPrevTop = (!!window.pageYOffset)
            ? window.pageYOffset
            : (document.documentElement || document.body.parentNode || document.body).scrollTop;

    function userScrolling() {
        const userCurrTop = (!!window.pageYOffset)
            ? window.pageYOffset
            : (document.documentElement || document.body.parentNode || document.body).scrollTop;

        // CLEAR PREV ANIMATION RUNNERS
        clearTimeout(timeOutId);
        window.cancelAnimationFrame(cancelAnimationFrameCallback);

        ANIMATION_SCROLL_STEP = 1000;
        ANIMATION_TRANSLATE_3D_MOVING = 5;
        if (userCurrTop < userPrevTop) {
            console.log('up'); // TODO: DEL
            scrollDirection = ANIMATION_DIRECTION_UP;
        } else {
            console.log('down'); // TODO: DEL
            scrollDirection = ANIMATION_DIRECTION_DOWN;
        }
        userPrevTop = userCurrTop;
        setUserScrollTransitions();
        cancelAnimationFrameCallback = requestAnimationFrame(proceedAnimationFn);

        timeOutId = setTimeout(() => {
            ANIMATION_TRANSLATE_3D_MOVING = DEFAULT_ANIMATION_TRANSLATE_3D_MOVING;
            ANIMATION_SCROLL_STEP = DEFAULT_ANIMATION_SCROLL_STEP;

            removeUserScrollTransitions();
            window.cancelAnimationFrame(cancelAnimationFrameCallback);
            cancelAnimationFrameCallback = requestAnimationFrame(proceedAnimationFn);
        }, SCROLL_FPS);
    }
    
    function setUserScrollTransitions() {
        animationSectionDOM.classList.add('section__user_scroll');

        const animationBlocksDOMLen = animationBlocksDOM.length;
        for(let i = 0; i < animationBlocksDOMLen; i += 1) {
            animationBlocksDOM[i].classList.add('block__user-scroll')
        }

        const animationPicturesDOMLen = animationPicturesDOM.length;
        for(let i = 0; i < animationPicturesDOMLen; i += 1) {
            animationPicturesDOM[i].classList.add('picture__user-scroll')
        }
    }
    
    function removeUserScrollTransitions() {
        animationSectionDOM.classList.remove('section__user_scroll');

        const animationBlocksDOMLen = animationBlocksDOM.length;
        for(let i = 0; i < animationBlocksDOMLen; i += 1) {
            animationBlocksDOM[i].classList.remove('block__user-scroll')
        }

        const animationPicturesDOMLen = animationPicturesDOM.length;
        for(let i = 0; i < animationPicturesDOMLen; i += 1) {
            animationPicturesDOM[i].classList.remove('picture__user-scroll')
        }
    }
})();
