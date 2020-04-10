<template>
    <div class='magnifier-container'> 
        <v-img
            class='preview'
            :id='targetImgId'
            :style="{ backgroundImage: 'url(' + src + ')' }"
            v-touch:moving='onTouch'
            v-touch:start='onTouch'
            v-touch:end='createHit'
        >
            <v-img
                v-show='magnify'
                class='magnifying-glass'
                :style="{
                    backgroundImage: 'url(' + src + ')',
                    backgroundPosition: zoomImagePos.x + '% ' + zoomImagePos.y + '% ',
                    backgroundSize: zoomImageSize.width + 'px ' + zoomImageSize.height + 'px',
                    left: touchPos.x + 'px',
                    top: touchPos.y + 'px'
                }"
            />
        </v-img>
        <ul>
            <li v-for='i in points.length' :key='i'>
                <v-img
                    :class="magnify ? 'hit transparent' : 'hit opaque'"
                    :src='hitIcon'
                    :style='createHitStyle(points[i - 1])'
                    v-longclick='() => { deleteHit(points[i - 1]) }'
                />
            </li>
        </ul>
    </div>
</template>

<script>
    const HIT_ICON_SIZE = 24;
    const MAGNIFIER_SPACE = 10;

    export default {
        props: [
            'src',
            'hits',
            'center'
        ],
        data() {
            return {
                targetImgId: 'targetImgId',
                zoomImgId: 'zoomImgId',
                zoomUrl: null,
                hitIcon: null,
                magnify: false,
                points: [],
                hitPos: { x: 0, y: 0 },
                touchPos: { x: 0, y: 0 },
                thumbPos: { x: 0, y: 0 },
                zoomImagePos: { x: 0, y: 0 },
                zoomImageSize: { width: 0, height: 0 },
            }
        },
        created() {
            let iconContext = require.context('../../assets', false, /\.png$/);
            this.hitIcon = iconContext('./hit.png');
        },
        mounted() {
            this.zoomImageSize = this.calcZoomImageSize(1.5);
        },
        computed: {
            imageData() {
                return document.getElementById(this.targetImgId);
            },
            imageBoxSize() {
                let width = this.imageData.clientWidth;
                let height = this.imageData.clientHeight;
                return Math.min(width, height);
            },
            imageOffset() {
                let width = this.imageData.clientWidth;
                let height = this.imageData.clientHeight;
                let diff = Math.abs(width - height) / 2;
                let top, left;

                if (width > height) {
                    left = diff;
                    top = 0;
                }
                else {
                    left = 0;
                    top = diff;
                }

                return {
                    left: left,
                    top: top
                }
            }
        },
        methods: {
            /**
             * Activate when a touch on the image occurs.
             */
            onTouch: function() {
                let cursor = this.getSourceCursorPosition(event);

                //calculate hit position
                if (this.inTargetBoundaries(cursor)) {
                    this.hitPos = this.calcHitCoordinates()
                    this.zoomImagePos = this.getZoomImagePosition(event, MAGNIFIER_SPACE * 2);
                }

                this.magnify = true;
            },
            /**
             * @param {Object} point - {
             *                            x: <Number>{point x coordinate},
             *                            y: <Number>{point y coordinate}
             *                         }
             * @returns {Boolean} True if the point is within the target image.
             */
            inTargetBoundaries: function(point) {
                let rect = this.imageData.getBoundingClientRect();
                let minX = rect.left;
                let minY = rect.top;
                let maxX = minX + rect.width;
                let maxY = minY + rect.height;
                return point && point.x >= minX && point.y >= minY && point.x <= maxX && point.y <= maxY;
            },
            /**
             * @returns {Object} point - {
             *                              x: <Number>{point x coordinate},
             *                              y: <Number>{point y coordinate}
             *                           }
             */
            findImagePosition: function() {
                let elem = document.getElementById(this.targetImgId);

                if (typeof(this.imageData.offsetParent) !== undefined) {
                    let posX, posY;
                    for(posX = 0, posY = 0; elem; elem = elem.offsetParent) {
                        posX += elem.offsetLeft;
                        posY += elem.offsetTop;
                    }

                    return { x: posX, y: posY };
                }
                else return { x: elem.x, y: elem.y };
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
                let imgPos = this.findImagePosition();
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

                return { x: posX - imgPos.x, y: posY - imgPos.x };
            },
            /**
             * Calculate the coordinates of the hit, based on the magnifier.
             * 
             * @param {Object} point - {
             *                            x: <Number>{point x coordinate},
             *                            y: <Number>{point y coordinate}
             *                         }
             */
            calcHitCoordinates: function() {
                let xPercent = (this.touchPos.x * 100) / this.imageBoxSize;
                let yPercent = (this.touchPos.y * 100) / this.imageBoxSize;
                let extendedImageSize = {
                    min: -(this.imageBoxSize * MAGNIFIER_SPACE / 100),
                    max: this.imageBoxSize + (this.imageBoxSize * MAGNIFIER_SPACE / 100),
                };

                let pxRange = extendedImageSize.max - extendedImageSize.min;
                let x = (xPercent * pxRange / 100) + extendedImageSize.min;
                let y = (yPercent * pxRange / 100) + extendedImageSize.min;

                return { x: x, y: y };
            },
            /**
             * Create a hit point on the image and emit an event to the parent.
             * 
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
            createHit: function() {
                let hits = this.$props.hits;
                this.magnify = false;

                if (this.points.length < hits || !hits) {
                    let point = { x: this.hitPos.x, y: this.hitPos.y };
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

                    if (p.x === point.x && p.y === point.y) {
                        this.points.splice(i, 1);
                        return
                    }
                }
            },
            /**
             * Generate an inline style object for a hit point.
             * 
             * @param {Object} point - {
             *                            x: <Number>{point x coordinate},
             *                            y: <Number>{point y coordinate}
             *                         }
             */
            createHitStyle: function(point) {
                let offsetX = this.imageOffset.left;
                let offsetY = this.imageOffset.top;
                let x = point.x + offsetX - HIT_ICON_SIZE / 2;
                let y = point.y + offsetY - HIT_ICON_SIZE / 2;

                return {
                    position: 'absolute',
                    left: x + 'px',
                    top: y + 'px'
                };
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
             *                      distance: <Number>{distance from the point to the center},
             *                      xDistance: <Number>{x distance from the point to the center},
             * *                    yDistance: <Number>{y distance from the point to the center},
             * *                    quarter: <Number>{quarter relative to the center as in a coordinate system (1/2/3/4)}
             *                   }
             */
            distanceFromCenter: function(point) {
                let center = this.$props.center;

                if (!center) {
                    let offsetX = this.imageOffset.left;
                    let offsetY = this.imageOffset.top;
                    let x = offsetX + this.imageBoxSize / 2;
                    let y = offsetY + this.imageBoxSize / 2;
                    center = { x: x, y: y };
                }

                let xPow = Math.pow(point.x - center.x, 2);
                let yPow = Math.pow(point.y - center.y, 2);
                let xPositive = point.x >= center.x;
                let yPositive = point.y >= center.y;
                let quarter;

                if (xPositive && !yPositive) quarter = 1;
                else if (!xPositive && !yPositive) quarter = 2;
                else if (!xPositive && yPositive) quarter = 3;
                else quarter = 4;

                return {
                    distance: Math.sqrt(xPow + yPow),
                    xDistance: Math.abs(point.x - center.x),
                    yDistance: Math.abs(point.y - center.y),
                    quarter: quarter
                }
            },
            /**
             * @param {Number} ratio - The ratio by which the zoom image should be sized, relative to the source
             * @returns {Object} {
             *                      width: <Number>{width of the zoom image},
             *                      height: <Number>{height of the zoom image}
             *                   }
             */
            calcZoomImageSize: function(ratio) {
                let srcWidth = this.imageData.clientWidth;
                let srcHeight = this.imageData.clientHeight;
                let zoomWidth, zoomHeight;

                if (srcWidth < srcHeight) {
                    zoomWidth = srcWidth * ratio;
                    zoomHeight = zoomWidth;
                }
                else {
                    zoomHeight = srcHeight * ratio;
                    zoomWidth = zoomHeight;
                }
                
                return { width: zoomWidth, height: zoomHeight }
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

                for (let elem = this.imageData; elem; elem = elem.offsetParent) {
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
             * @param {Event} event - Touch event
             * @param {Number} spacePercent - The percentage of space to leave around the zoom image,
             *                                so the user can access its edges
             * @returns {Object} point - {
             *                              x: <Number>{point x coordinate},
             *                              y: <Number>{point y coordinate}
             *                           }
             */
            getZoomImagePosition: function(event, spacePercent) {
                this.thumbPos = this.getThumbPosition();
                this.touchPos = this.getZoomCursorPosition(event);

                let min = spacePercent;
                let max = 100 - spacePercent;
                let xPercent = (this.touchPos.x * 100) / this.imageBoxSize;
                let yPercent = (this.touchPos.y * 100) / this.imageBoxSize;
                let xPos = (xPercent - min) / (max - min) * 100;
                let yPos = (yPercent - min) / (max - min) * 100;

                return { x: xPos, y: yPos };
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
        },
    }
</script>

<style scoped lang='scss'>
    //magnifying glass size
    $magnifier-width: 150px;
    $magnifier-height: 150px;

    //responsive sizes
    $sizes: (
        '(max-width: 320px)' 250px 250px,
        '(max-width: 480px)' 350px 350px,
        '(min-width: 481px)' 450px 450px,
        '(min-width: 1024px)' 550px 550px,
        '(min-width: 1280px)' 600px 600px
    );

    .magnifier-container {
        position: relative;

        .preview {
            position: relative;
            background: {
                repeat: no-repeat;
                size: contain;
                position: 50% 50%;
            }
            display: block;
            clear: both;
            margin: 0 auto;
            cursor: none;

            .magnifying-glass {
                position: absolute;
                border: 8px;
                border-color: #9c9c9c;
                border-style: groove;
                border-radius: 50%;
                cursor: none;
                width: $magnifier-width;
                height: $magnifier-height;
                transform: translate(
                    (-1 * $magnifier-width / 2),
                    (-1 * $magnifier-height / 2)
                );
                background: #ffffff no-repeat;
            }

            @each $breakpoint in $sizes {
                $query: nth($breakpoint, 1);
                $bpWidth: nth($breakpoint, 2);
                $bpHeight: nth($breakpoint, 3);

                @media only screen and #{$query} {
                    width: $bpWidth;
                    height: $bpHeight;
                }
            }
        }
    }
    .target {
        margin-left: auto;
        margin-right: auto;
        left: 0;
        right: 0;
    }
    li {
        list-style-type: none;
    }
    .hit.opaque {
        opacity: .9;
        transition: opacity .6s;
    }
    .hit.transparent {
        opacity: .1;
    }
</style>