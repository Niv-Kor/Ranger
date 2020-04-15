<template>
    <div class='magnifier-container'>
        <v-img
            class='preview'
            :id='targetImgId'
            :style='previewImageStyle'
            v-touch:moving='onTouch'
            v-touch:start='onTouch'
            v-touch:end='() => { createHit(touchPos) }'
        >
            <div v-show='magnify && $props.hits !== 0 && !$props.readOnly'>
                <v-img
                    class='magnifying-glass'
                    :style='magnifyingGlassStyle'
                />
                <span class='coordinates x' :style='xCoordinatesStyle'>
                    {{ parseInt(distanceFromCenter(touchPos).xDistance) }}
                </span>
                <span class='coordinates y' :style='yCoordinatesStyle'>
                    {{ parseInt(distanceFromCenter(touchPos).yDistance) }}
                </span>
                <span class='back line' :style='backHorLineStyle'></span>
                <span class='back line' :style='backVerLineStyle'></span>
                <span class='front line' :style='frontHorLineStyle'></span>
                <span class='front line' :style='frontVerLineStyle'></span>
                <span class='crosshair' :style='crosshairStyle'></span>
            </div>
        </v-img>
        <span
            v-if='$props.markCenter'
            class='center-mark'
            :style='centerMarkStyle'
        />
        <ul>
            <li v-for='i in displayCirclesAmount' :key='i'>
                <span
                    v-if='displayCirclesAmount > 0'
                    class='value-circle'
                    :style='createValueCircleStyle(displayCirclesAmount - (i - 1))'
                />
                <span
                    v-if='displayCirclesAmount > 0'
                    class='value-label'
                    :style='createValueLabelStyle(displayCirclesAmount - (i - 1))'
                >
                    {{ 10 - ((displayCirclesAmount - (i - 1)) - 1) }}
                </span>
            </li>
        </ul>
        <ul>
            <li v-for='i in points.length' :key='i'>
                <v-img
                    :class='findHitClass(points[i - 1])'
                    :src='hitIcon'
                    :style='createHitStyle(points[i - 1])'
                    v-longclick='() => { if (!$props.readOnly) deleteHit(points[i - 1]); }'
                    v-touch:start=' () => { if (!$props.readOnly) touchedHit = points[i - 1]; }'
                    v-touch:end=' () => { if (!$props.readOnly) touchedHit = null; }'
                />
            </li>
        </ul>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex';

    const HIT_ICON_SIZE = 24;
    const ZOOM_RATIO = 1.5;
    const MAGNIFIER_SIZE_PERCENT = .4;
    const COORDINATES_FONT_SIZE = 12;
    const VALUE_LABEL_FONT_SIZE = 14;

    export default {
        props: {
            /**
             * The URL of the source image.
             */
            src: {
                type: String,
                required: true,
                default: undefined
            },
            /**
             * Maximum number of available hits.
             */
            hits: {
                type: Number,
                required: false,
                default: undefined
            },
            /**
             * Maximum size of the image.
             */
            size: {
                type: Number,
                required: false,
                default: undefined
            },
            /**
             * The most valuable point in the target.
             * 
             * @example Object {
             *                    x: <Number>{hit's x coordinate},
             *                    y: <Number>{hit's y coordinate}
             *                 },
             */
            bullseye: {
                type: Object,
                required: false,
                default: undefined
            },
            /**
             * Pre-defined hits in the target.
             * 
             * @example Array [
             *                   Object {
             *                             x: <Number>{hit's x coordinate},
             *                             y: <Number>{hit's y coordinate}
             *                          },
             *                   ...
             *                ]
             */
            predefineHits: {
                type: Array,
                required: false,
                default: undefined
            },
            /**
             * Use the center point as a pre-defined hit.
             */
            prefefineCenter: {
                type: Boolean,
                required: false,
                default: false
            },
            /**
             * Mark the center of the target.
             */
            markCenter: {
                type: Boolean,
                required: false,
                default: false
            },
            /**
             * Display circles starting from the target's bullseye point,
             * that represent its distribution of values over the whole target.
             * 
             * @example Object {
             *                    circles: <Number>{amount of circles to show},
             *                    diameter: <Number>{the diameter of the center circle as
             *                                       percentage of width (min=1, max=100)}
             *                 },
             */
            displayValueCircles: {
                type: Object,
                required: false,
                default: undefined
            },
            readOnly: {
                type: Boolean,
                required: false,
                default: false
            }
        },
        data() {
            return {
                targetImgId: 'targetImgId',
                zoomImgId: 'zoomImgId',
                srcImage: null,
                zoomUrl: null,
                touchedHit: null,
                magnify: false,
                imageLoaded: false,
                points: [],
                touchPos: { x: 0, y: 0 },
                thumbPos: { x: 0, y: 0 },
                zoomImagePos: { x: 0, y: 0 },
            }
        },
        created() {
            this.onCreated()

            //update preview image size every time the window is resizing
            window.addEventListener('resize', () => {
                this.imageData = this.calcPreviewImageData();
            });
        },
        computed: {
            ...mapGetters({
                colors: 'getColors'
            }),
            hitIcon() {
                let iconContext = require.context('../../assets', false, /\.png$/);
                return iconContext('./hit.png');
            },
            magnifierSize() {
                let averageImageSize = (this.imageData.width + this.imageData.height) / 2;
                return averageImageSize * MAGNIFIER_SIZE_PERCENT;
            },
            magnifierBorderSize() {
                let minImageSize = 100, maxImageSize = 400;
                let averageImageSize = (this.imageData.width + this.imageData.height) / 2;
                let sizePercent = (averageImageSize - minImageSize) / (maxImageSize - minImageSize) * 100;
                let minBorderSize = 1, maxBorderSize = 8;
                let borderSize = sizePercent * (maxBorderSize - minBorderSize) / 100 + minBorderSize;
                return borderSize;
            },
            previewImageStyle() {
                let maxSize;
                let breakpoint = this.$vuetify.breakpoint.name;

                switch (breakpoint) {
                    case 'xs': maxSize = 200; break;
                    case 'sm': maxSize = 400; break;
                    case 'md': maxSize = 550; break;
                    case 'lg': maxSize = 650; break;
                    case 'xl': maxSize = 800; break;
                }

                let srcUrl = 'url(' + this.$props.src + ')';
                let chosenSize = this.$props.size;
                let bgSize = chosenSize ? chosenSize + 'px' : 'contain';
                let containerSize = (chosenSize && chosenSize < maxSize) ? chosenSize : maxSize;

                return {
                    backgroundImage: srcUrl,
                    backgroundSize: bgSize,
                    width: containerSize + 'px',
                    height: containerSize + 'px'
                };
            },
            magnifyingGlassStyle() {
                let transformValue = this.magnifierSize / (-2);
                let translate = 'translate(' + transformValue + 'px, ' + transformValue + 'px)';
                
                return {
                    backgroundImage: 'url(' + this.src + ')',
                    backgroundPosition: this.zoomImagePos.x + '% ' + this.zoomImagePos.y + '% ',
                    backgroundSize: this.zoomImageSize.width + 'px ' + this.zoomImageSize.height + 'px',
                    borderWidth: this.magnifierBorderSize + 'px',
                    left: this.touchPos.x + 'px',
                    top: this.touchPos.y + 'px',
                    width: this.magnifierSize + 'px',
                    height: this.magnifierSize + 'px',
                    transform: translate
                };
            },
            backHorLineStyle() {
                let width = this.magnifierSize - this.magnifierBorderSize * 2;
                let left = this.magnifierBorderSize + this.touchPos.x - this.magnifierSize / 2;

                return {
                    width: width + 'px',
                    left: left + 'px',
                    top: this.touchPos.y + 'px'
                };
            },
            backVerLineStyle() {
                let height = this.magnifierSize - this.magnifierBorderSize * 2;
                let top = this.magnifierBorderSize + this.touchPos.y - this.magnifierSize / 2;
                
                return {
                    height: height + 'px',
                    left: this.touchPos.x + 'px',
                    top: top + 'px'
                };
            },
            frontHorLineStyle() {
                let frontLine = { width: 0, left: 0, top: 0 };
                Object.assign(frontLine, this.backHorLineStyle);
                frontLine.top = (this.touchPos.y - 2) + 'px';
                return frontLine;
            },
            frontVerLineStyle() {
                let frontLine = { height: 0, left: 0, top: 0 };
                Object.assign(frontLine, this.backVerLineStyle);
                frontLine.left = (this.touchPos.x - 2) + 'px';
                return frontLine;
            },
            crosshairStyle() {
                let pointWidth = 3;
                let left = this.touchPos.x - pointWidth;
                let top = this.touchPos.y - pointWidth;

                return {
                    left: left + 'px',
                    top: top + 'px'
                };
            },
            xCoordinatesStyle() {
                let offsetLeft = this.magnifierBorderSize * 1.8;
                let left = offsetLeft + this.touchPos.x - this.magnifierSize / 2;
                let top = this.touchPos.y - COORDINATES_FONT_SIZE * 1.5;

                return {
                    left: left + 'px',
                    top: top + 'px'
                };
            },
            yCoordinatesStyle() {
                let left = this.touchPos.x + COORDINATES_FONT_SIZE * .3;
                let top = this.touchPos.y - this.magnifierSize / 2 + this.magnifierBorderSize;

                return {
                    left: left + 'px',
                    top: top + 'px'
                };
            },
            centerMarkStyle() {
                let pointWidth = 3;
                let x = this.imageData.offsetLeft + this.center.x - pointWidth;
                let y = this.imageData.offsetTop + this.center.y - pointWidth;

                return {
                    left: x + 'px',
                    top: y + 'px'
                };
            },
            hitsFull() {
                let hits = this.$props.hits;
                return hits && this.points.length >= hits;
            },
            center() {
                let center = this.$props.bullseye;

                if (!center) {
                    let x = this.imageData.width / 2;
                    let y = this.imageData.height / 2;
                    center = { x, y };
                }
                
                return center;
            },
            displayCirclesAmount() {
                if (!this.imageLoaded || !this.$props.displayValueCircles) return 0;

                let actualCenter = { x: this.imageData.width / 2, y: this.imageData.height / 2 };
                let xDist = Math.abs(actualCenter.x - this.center.x);
                xDist = Math.abs(actualCenter.x - xDist);
                let yDist = Math.abs(actualCenter.y - this.center.y);
                yDist = Math.abs(actualCenter.y - yDist);
                let edgeDistance = Math.min(xDist, yDist);
                let boxSize = (this.imageData.width + this.imageData.height) / 2;
                let distancePerc = edgeDistance / boxSize * 100;
                let dispObj = this.$props.displayValueCircles;

                if (dispObj) {
                    let diamPerc = dispObj.diameter;
                    let maxCircles = parseInt(distancePerc * 2 / diamPerc);
                    
                    return Math.min(dispObj.circles, maxCircles);
                }
                else return 1;
            },
            imageData() {
                if (!this.imageLoaded)
                    return {
                        width: 0,
                        height: 0,
                        pageTop: 0,
                        pageLeft: 0,
                        offsetTop: 0,
                        offsetLeft: 0
                    }

                let srcWidth = this.srcImage.width;
                let srcHeight = this.srcImage.height;
                let ratio = srcWidth / srcHeight;
                let dom = document.getElementById(this.targetImgId);
                let wider = ratio > 1;
                let unstableAxis = wider ? dom.clientHeight : dom.clientWidth;
                let currentStable;

                if (this.$props.size) currentStable = this.$props.size;
                else currentStable = wider ? dom.clientWidth : dom.clientHeight;

                let currentUnstable = currentStable * ratio;
                let squeeze = unstableAxis < currentUnstable;

                //dom ratio is no longer a box
                if (squeeze) {
                    currentUnstable = unstableAxis;
                    currentStable = currentUnstable / ratio;
                }

                let width = wider ? currentStable : currentUnstable;
                let height = wider ? currentUnstable : currentStable;

                //find image position
                let rect = dom.getBoundingClientRect();
                let position = { x: rect.left, y: rect.top };
                let offsetLeft = dom.offsetLeft;
                let offsetTop = dom.offsetTop;
                position.x += offsetLeft;
                position.y += offsetTop;

                return {
                    width,
                    height,
                    pageTop: position.y,
                    pageLeft: position.x,
                    offsetTop,
                    offsetLeft
                };
            },
            zoomImageSize() {
                return {
                    width: this.imageData.width * ZOOM_RATIO,
                    height: this.imageData.height * ZOOM_RATIO
                }
            }
        },
        watch: {
            src: {
                immediate: true,
                deep: true,
                handler() {
                    this.imageLoaded = false;
                    this.implementImages()
                        .then(() => { this.$forceUpdate(); });
                }
            },
            predefineHits: {
                immediate: true,
                deep: true,
                handler(points) {
                    console.log('defined');

                    if (points) {
                        for (let point of points) {
                            let x = point.x;
                            let y = point.y;

                            if (x && y) this.createHit(point);
                        }
                    }
                }
            }
        },
        methods: {
            /**
             * Activate when the component is created
             */
            onCreated: async function() {
                if (this.$props.src) await this.implementImages();

                //create pre-defined hits
                let predefinedPoints = this.$props.predefineHits;

                if (predefinedPoints) {
                    for (let point of predefinedPoints) {
                        let x = point.x;
                        let y = point.y;

                        if (x && y) this.createHit(point);
                    }
                }

                //add the center point as a pre-defined hit
                if (this.$props.predefCenter)
                    this.createHit(this.center);
            },
            /**
             * Calculate the data needed to render the preview and zoom images.
             */
            implementImages: async function() {
                //load image
                this.srcImage = new Image();
                this.srcImage.src = this.$props.src;
                
                return new Promise((res) => {
                    this.srcImage.onload = async () => {
                        this.imageLoaded = true;
                        res();
                    }
                });
            },
            /**
             * Activate when a touch on the image occurs.
             */
            onTouch: function() {
                this.thumbPos = this.getThumbPosition();
                this.touchPos = this.getZoomCursorPosition(event);

                //calculate hit position
                if (this.inTargetBoundaries(this.touchPos)) {
                    this.zoomImagePos = this.getZoomImagePosition();
                    this.magnify = true;
                }
                else this.magnify = false;
            },
            /**
             * @param {Object} point - {
             *                            x: <Number>{point x coordinate},
             *                            y: <Number>{point y coordinate}
             *                         }
             * @returns {Boolean} True if the point is within the target image.
             */
            inTargetBoundaries: function(point) {
                let maxX = this.imageData.width;
                let maxY = this.imageData.height;

                return this.imageLoaded && point.x >= 0 && point.y >= 0
                    && point.x <= maxX && point.y <= maxY;
            },
            /**
             * Get the position of the cursor on the source image.
             * 
             * @param {Event} event - Touch event
             * @returns {Object} point - {
             *                              x: <Number>{point x coordinate},
             *                              y: <Number>{point y coordinate}
             *                           }
             */
            getSourceCursorPosition: function(event) {
                //event is accidentally canceled
                if (!event.touches) return;

                let posX = 0;
                let posY = 0;
                let touchEv = event.touches[0];

                if (touchEv.pageX || touchEv.pageY) {
                    posX = touchEv.pageX;
                    posY = touchEv.pageY;
                }
                else if (touchEv.clientX || touchEv.clientY) {
                    let docBody = document.body;
                    let docElem = document.documentElement;
                    posX = touchEv.clientX + docBody.scrollLeft + docElem.scrollLeft;
                    posY = touchEv.clientY + docBody.scrollTop + docElem.scrollTop;
                }

                return { x: posX - this.imageData.pageLeft, y: posY - this.imageData.pageTop };
            },
            /**
             * Generate an inline style object for a value circle.
             * 
             * @param {Number} index - The index of the circle
             * @returns {Object} {
             *                      left: <String>{css left attribute in px},
             *                      top: <String>{css top attribute in px},
             *                      width: <String>{css width attribute in px},
             *                      height: <String>{css height attribute in px}
             *                   }
             */
            createValueCircleStyle: function(index) {
                if (!this.$props.displayValueCircles) return;

                let diamPerc = this.$props.displayValueCircles.diameter;
                let boxSize = (this.imageData.width + this.imageData.height) / 2;
                let diam = diamPerc * boxSize / 100;
                let left = this.imageData.offsetLeft + this.center.x - (diam * index / 2);
                let top = this.imageData.offsetTop + this.center.y - (diam * index / 2);
                let alphaChannel = 33;

                return {
                    left: left + 'px',
                    top: top + 'px',
                    width: diam * index + 'px',
                    height: diam * index + 'px',
                    backgroundColor: this.colors.secondary + alphaChannel
                };
            },
            /**
             * Generate an inline style object for a value circle.
             * 
             * @param {Number} index - The index of the circle
             * @returns {Object} {
             *                      left: <String>{css left attribute in px},
             *                      top: <String>{css top attribute in px},
             *                      width: <String>{css width attribute in px},
             *                      height: <String>{css height attribute in px}
             *                   }
             */
            createValueLabelStyle: function(index) {
                if (!this.$props.displayValueCircles) return;

                let diamPerc = this.$props.displayValueCircles.diameter;
                let boxSize = (this.imageData.width + this.imageData.height) / 2;
                let diam = diamPerc * boxSize / 100;
                let left = this.imageData.offsetLeft + this.center.x - VALUE_LABEL_FONT_SIZE / 2;
                let top = this.imageData.offsetTop + this.center.y - (diam * index / 2);

                return {
                    left: left + 'px',
                    top: top + 'px',
                    width: diam * index + 'px',
                    height: diam * index + 'px',
                    fontSize: VALUE_LABEL_FONT_SIZE + 'px'
                };
            },
            /**
             * Create a hit point on the image and emit an event to the parent.
             * 
             * @param point - point: <Object>{
             *                                   x: <Number>{point x coordinate},
             *                                   y: <Number>{point y coordinate}
             *                                },
             * @emits hit - {
             *                 point: <Object>{
             *                                   x: <Number>{point x coordinate},
             *                                   y: <Number>{point y coordinate}
             *                                },
             *                 bullseyeData: <Object>{
             *                                          distance: <Number>{distance from the point to the center},
             *                                          xDistance: <Number>{x distance from the point to the center},
             *                                          yDistance: <Number>{y distance from the point to the center},
             *                                          quarter: <Number>{quarter relative to the center
             *                                                            as in a coordinate system (1/2/3/4)}
             *                                       }
             *              }
             */
            createHit: function(point) {
                this.magnify = false;

                if (!this.hitsFull) {
                    let hit = this.distanceFromCenter(point);
                    this.points.push(point);

                    //emit an object to the parent
                    this.$emit('hit', {
                        point: point,
                        bullseyeData: hit
                    });
                }
            },
            /**
             * Delete a hit point from the image.
             * 
             * @param {Object} point - {
             *                            x: <Number>{point x coordinate},
             *                            y: <Number>{point y coordinate}
             *                         }
             */
            deleteHit: function(point) {
                for (let i in this.points) {
                    let p = this.points[i];

                    if (p.x === point.x && p.y === point.y)
                        this.points.splice(i, 1);
                }
            },
            /**
             * Generate an inline style object for a hit point.
             * 
             * @param {Object} point - {
             *                            x: <Number>{point x coordinate},
             *                            y: <Number>{point y coordinate}
             *                         }
             * @returns {Object} {
             *                      position: <String>{css position},
             *                      left: <String>{css left attribute in px},
             *                      top: <String>{css top attribute in px}
             *                   }
             */
            createHitStyle: function(point) {
                let x = this.imageData.offsetLeft + point.x - HIT_ICON_SIZE / 2;
                let y = this.imageData.offsetTop + point.y - HIT_ICON_SIZE / 2;

                return {
                    position: 'absolute',
                    left: x + 'px',
                    top: y + 'px'
                };
            },
            /**
             * Find the proper class for a hit.
             * 
             * @param {Object} point - {
             *                            x: <Number>{point x coordinate},
             *                            y: <Number>{point y coordinate}
             *                         }
             * @returns {String} The proper class name for the hit (for css purposes).
             */
            findHitClass: function(point) {
                let cssClass = 'hit ';
                let pointTouched = point == this.touchedHit;
                let reachedMaxHits = this.hitsFull;

                if (this.magnify) cssClass += reachedMaxHits ? 'highlight' : 'transparent'
                else cssClass += pointTouched ? 'tint' : 'opaque';

                return cssClass;
            },
            /**
             * Calculate the disntance of a point from the target's center.
             * If a center (most valuable point) is not provided via props,
             * the center is by default the actual image's center.
             * 
             * @param {Object} point - {
             *                            x: <Number>{point x coordinate},
             *                            y: <Number>{point y coordinate}
             *                         }
             * @returns {Object} {
             *                      center: <ObjecT>{
             *                                         x: <Number>{x coordinate}
             *                                         y: <Number>{y coordinate}
             *                                      }
             *                      distance: <Number>{distance from the point to the center},
             *                      xDistance: <Number>{x distance from the point to the center},
             *                      yDistance: <Number>{y distance from the point to the center},
             *                      quarter: <Number>{quarter relative to the center as in a coordinate system (1/2/3/4)}
             *                   }
             */
            distanceFromCenter: function(point) {
                let xPow = Math.pow(point.x - this.center.x, 2);
                let yPow = Math.pow(point.y - this.center.y, 2);
                let xPositive = point.x >= this.center.x;
                let yPositive = point.y >= this.center.y;
                let quarter;

                if (xPositive && !yPositive) quarter = 1;
                else if (!xPositive && !yPositive) quarter = 2;
                else if (!xPositive && yPositive) quarter = 3;
                else quarter = 4;

                return {
                    center: this.center,
                    distance: Math.sqrt(xPow + yPow),
                    xDistance: Math.abs(point.x - this.center.x),
                    yDistance: Math.abs(point.y - this.center.y),
                    quarter: quarter
                }
            },
            /**
             * Get the position of the cursor on the zoom image.
             * 
             * @param {Event} event - Touch event
             * @returns {Object} point - {
             *                              x: <Number>{point x coordinate},
             *                              y: <Number>{point y coordinate}
             *                           }
             */
            getZoomCursorPosition: function(event) {
                if (!event.touches || !event.touches.length) return this.touchPos;

                let touchEv = event.touches[0];
                let docElem = document.documentElement;
                let docBody = document.bounds;
                let scrollLeft = docElem ? docElem.scrollLeft : docBody.scrollLeft;
                let scrollTop = docElem ? docElem.scrollTop : docBody.scrollTop;
                let x = touchEv.clientX + scrollLeft;
                let y = touchEv.clientY + scrollTop;

                return { x: x - this.thumbPos.x, y: y - this.thumbPos.y };
            },
            /**
             * Get the offset position of the magnifier.
             * 
             * @returns {Object} point - {
             *                              x: <Number>{point x coordinate},
             *                              y: <Number>{point y coordinate}
             *                           }
             */
            getThumbPosition: function() {
                let xPos = 0;
                let yPos = 0;

                for (let elem = document.getElementById(this.targetImgId); elem; elem = elem.offsetParent) {
                    let transform = this.getMagnifierTransform(elem);

                    if (elem.tagName == 'BODY') {
                        //deal with browser issues regarding body/window/document and page scroll
                        let xScroll = elem.scrollLeft || document.documentElement.scrollLeft;
                        let yScroll = elem.scrollTop || document.documentElement.scrollTop;

                        xPos += elem.offsetLeft - xScroll + elem.clientLeft + parseInt(transform[0]);
                        yPos += elem.offsetTop - yScroll + elem.clientTop + parseInt(transform[1]);
                    }
                    else {
                        //for all other non-BODY elements
                        xPos += elem.offsetLeft - elem.scrollLeft + elem.clientLeft + parseInt(transform[0]);
                        yPos += elem.offsetTop - elem.scrollTop + elem.clientTop + parseInt(transform[1]);
                    }
                }

                return { x: xPos, y: yPos };
            },
            /**
             * Get the current position of the zoom image, according to the cursor.
             * 
             * @returns {Object} point - {
             *                              x: <Number>{point x coordinate},
             *                              y: <Number>{point y coordinate}
             *                           }
             */
            getZoomImagePosition: function() {
                let xPercent = this.touchPos.x / this.imageData.width * 100;
                let yPercent = this.touchPos.y / this.imageData.height * 100;
                let extendedMagnifier = this.magnifierSize * ZOOM_RATIO / 2;
                let magnifyXOffsetPerc = extendedMagnifier / this.imageData.width * 100;
                let magnifyYOffsetPerc = extendedMagnifier / this.imageData.height * 100;
                let xRangeExtension = magnifyXOffsetPerc / 2;
                let yRangeExtension = magnifyYOffsetPerc / 2;
                let minX = -xRangeExtension;
                let minY = -yRangeExtension;
                let maxX = 100 + xRangeExtension;
                let maxY = 100 + yRangeExtension;
                let xRangePercent = (xPercent) * (maxX - minX) / 100 + minX
                let yRangePercent = (yPercent) * (maxY - minY) / 100 + minY

                return { x: xRangePercent , y: yRangePercent };
            },
            /**
             * Get the transform of the magnifier element.
             * 
             * @param {Document.element} elem - The magnifier's element
             * @returns {Array} [x, y, z] value.
             */
            getMagnifierTransform: function(elem) {
                let transform = window.getComputedStyle(elem, null).getPropertyValue('-webkit-transform');

                function rotate_degree(matrix) {
                    let angle;

                    if (matrix !== 'none') {
                        let values = matrix.split("(")[1].split(")")[0].split(",");
                        let a = values[0];
                        let b = values[1];
                        angle = Math.round(Math.atan2(b, a) * (180 / Math.PI));
                    }
                    else  angle = 0;

                    return angle < 0 ? (angle += 360) : angle;
                }

                let output = [0, 0, 0];
                let regex = /matrix(?:(3d)\(-{0,1}\d+\.?\d*(?:, -{0,1}\d+\.?\d*)*(?:, (-{0,1}\d+\.?\d*))(?:, (-{0,1}\d+\.?\d*))(?:, (-{0,1}\d+\.?\d*)), -{0,1}\d+\.?\d*\)|\(-{0,1}\d+\.?\d*(?:, -{0,1}\d+\.?\d*)*(?:, (-{0,1}\d+\.?\d*))(?:, (-{0,1}\d+\.?\d*))\))/
                let results = transform.match(regex);
                
                if (results) {
                    if (results[1] == '3d') output = results.slice(2, 5);
                    else {
                        results.push(0);
                        output = results.slice(5, 9); //return [X,Y,Z,1] value;
                    }

                    output.push(rotate_degree(transform));
                }
                
                return output;
            }
        }
    }
</script>

<style scoped lang='scss'>
    .magnifier-container {
        position: relative;
    }
    .preview {
        position: relative;
        background-repeat: no-repeat;
        display: block;
        clear: both;
        margin: 0 auto;
        cursor: none;
    }
    .magnifying-glass {
        opacity: 1;
        position: absolute;
        border-color: #9c9c9c;
        border-style: groove;
        border-radius: 50%;
        cursor: none;
        background: #ffffff no-repeat;
    }
    .target {
        margin-left: auto;
        margin-right: auto;
        left: 0;
        right: 0;
    }
    .coordinates {
        font-size: 12px;
        position: absolute;
        color: #ffffff;
        -webkit-text-fill-color: white;
        text-shadow:
            -1px -1px 0 #000,  
            1px -1px 0 #000,
            -1px 1px 0 #000,
            1px 1px 0 #000;
    }
    .coordinates.y {
        transform: rotate(90deg);
    }
    .line {
        position: absolute;
    }
    .line.back {
        border-width: 1px;
        border-color: #ffffff;
        border-style: dashed;
    }
    .line.front {
        border-width: 1px;
        border-color: #000000;
        border-style: dashed;
    }
    .crosshair {
        position: absolute;
        border-width: 3px;
        border-color: #f70000c5;
        border-style: groove;
        border-radius: 50%;
    }
    li {
        list-style-type: none;
    }
    .center-mark {
        position: absolute;
        border-width: 3px;
        border-color: #ff0000;
        border-style: groove;
        border-radius: 50%;
        outline-width: 1px;
        outline-style: dashed;
        outline-color: #ffffff;
        filter: drop-shadow(0px 0px 3px #ff0000);
    }
    .value-circle {
        position: absolute;
        border-width: 2px;
        border-color: #ffffff;
        border-style: solid;
        border-radius: 50%;
    }
    .value-label {
        font-family: 'Comfortaa';
        position: absolute;
        color: #ffffff;
    }
    .hit.opaque {
        transition: opacity .6s;
    }
    .hit.transparent {
        opacity: .1;
    }
    .hit.highlight {
        filter: invert(100%) drop-shadow(0px 0px 3px #e90d0d);
    }
    .hit.tint {
        filter: invert(100%) drop-shadow(0px 0px 3px #20d82f);
    }
</style>