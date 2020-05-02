module.exports = {
    hexToRGB,
    RGBHexToHSL,
    transistHSLDifference
};

/**
 * Convert a color from RGB hex format to RGB representation.
 * 
 * @param {String} hex - RBG hex color ('#ffffff)
 * @returns {Object} {
 *                      {Number} r - red,
 *                      {Number} g - green,
 *                      {Number} b - blue
 *                   }
 */
function hexToRGB(hex) {
    let r = 0, g = 0, b = 0;

    //3 digits
    if (hex.length == 4) {
        r = '0x' + hex[1] + hex[1];
        g = '0x' + hex[2] + hex[2];
        b = '0x' + hex[3] + hex[3];

    //6 digits
    }
    else if (hex.length == 7) {
        r = '0x' + hex[1] + hex[2];
        g = '0x' + hex[3] + hex[4];
        b = '0x' + hex[5] + hex[6];
    }
    
    return { r, g, b };
}

/**
 * Convert a color from RBG hex format to an HSL representation.
 * 
 * @param {String} hex - RBG hex color ('#ffffff)
 * @returns {Object} {
 *                      {Number} h - hue [°],
 *                      {Number} s - saturation [%],
 *                      {Number} l - lightness [%]
 *                   }
 */
function RGBHexToHSL(hex) {
    let rgb = this.hexToRGB(hex);

    //make r, g, and b fractions of 1
    let r = rgb.r / 255;
    let g = rgb.g / 255;
    let b = rgb.b / 255;
    
    //find greatest and smallest channel values
    let cmin = Math.min(r,g,b);
    let cmax = Math.max(r,g,b);
    let delta = cmax - cmin;
    let h = 0;
    let s = 0;
    let l = 0;

    //no difference in hue
    if (delta == 0) h = 0;
    //red is max
    else if (cmax == r) h = ((g - b) / delta) % 6;
    //green is max
    else if (cmax == g) h = (b - r) / delta + 2;
    //blue is max
    else h = (r - g) / delta + 4;

    //make negative hues positive behind 360°
    h = Math.round(h * 60);
    if (h < 0) h += 360;

    //calculate lightness and saturation
    l = (cmax + cmin) / 2;
    s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);

    return { h, s, l };
}

/**
 * Generate an HSL representation of the transition between 2 colors.
 * 
 * @param {Object} base - {
 *                           {Number} h - base hue [°],
 *                           {Number} s - base saturation [%],
 *                           {Number} l - base lightness [%]
 *                        }
 * @param {Object} target - {
 *                             {Number} h - target hue [°],
 *                             {Number} s - target saturation [%],
 *                             {Number} l - target lightness [%]
 *                          }
 * @returns {Object} {
 *                      {Number} h - transition hue [°],
 *                      {Number} s - transition saturation [%],
 *                      {Number} l - transition lightness [%]
 *                   }
 */
function transistHSLDifference(base, target) {
    let h = target.h - base.h;
    let s = 100 + (target.s - base.s);
    let l = 100 + (target.l - base.l);

    if (s < 0) s = 0;
    else if (s > 100) s = 100;

    if (l < 0) l = 0;
    else if (l > 100) l = 100;

    return { h, s, l };
}