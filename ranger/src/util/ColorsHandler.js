module.exports = {
    hexToRGB,
    RGBHexToHSL,
    HSLToRGBHex,
    transistHSLDifference,
    darken,
    brighten,
    lighten,
    unlighten
};

/**
 * Convert a color from RGB hex format to RGB representation.
 * 
 * @param {String} hex - RBG hex color [#ffffff]
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
 * @param {String} hex - RBG hex color [#ffffff]
 * @returns {Object} {
 *                      {Number} h - hue [°],
 *                      {Number} s - saturation [%],
 *                      {Number} l - lightness [%]
 *                   }
 */
function RGBHexToHSL(hex) {
    let rgb = hexToRGB(hex);

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
 * Convert an HSL color value to RGB.
 *
 * @param {Object} hsl {
 *                     {Number} h - hue [°],
 *                     {Number} s - saturation [%],
 *                     {Number} l - lightness [%]
 *                  }
 * @return {Object} {
 *                     {Number} r - red,
 *                     {Number} g - green,
 *                     {Number} b - blue
 *                  }
 */
function HSLToRGBHex(hsl) {
    let r, g, b;
    let h = hsl.h / 360;
    let s = hsl.s / 100;
    let l = hsl.l / 100;

    if (s === 0) r = g = b = l;
    else {
        let hueToRGB = function hueToRGB(p, q, t) {
            if (t < 0) t++;
            else if (t > 1) t--;
            else if (t < 1 / 6) return p + (q - p) * 6 * t;
            else if (t < 1 / 2) return q;
            else if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        }

        let q = (l < .5) ? l * (1 + s) : (l + s) - l * s;
        let p = 2 * l - q;
        r = hueToRGB(p, q, h + 1 / 3);
        g = hueToRGB(p, q, h);
        b = hueToRGB(p, q, h - 1 / 3);
    }

    let padZeros = (num, pad) => {
        let numLen = ('' + num).length;
        
        for (let i = 0; i < pad - numLen; i++)
            num = 0 + num;

        return num;
    }

    r = padZeros(Math.round(r * 255).toString(16), 2);
    g = padZeros(Math.round(g * 255).toString(16), 2);
    b = padZeros(Math.round(b * 255).toString(16), 2);

    return `#${r}${g}${b}`;
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

/**
 * Brighten or darken a color.
 * 
 * @param {String} color - RBG hex color [#ffffff]
 * @param {Number} percent - A positive number to brighten the color,
 *                           or negative to darken it [%].
 * @returns {String} The color with a modified shader [#ffffff]
 */
function shadeColor(color, percent) {
    let r = parseInt(color.substring(1, 3), 16);
    let g = parseInt(color.substring(3, 5), 16);
    let b = parseInt(color.substring(5, 7), 16);

    r = parseInt(r * (100 + percent) / 100);
    g = parseInt(g * (100 + percent) / 100);
    b = parseInt(b * (100 + percent) / 100);

    r = (r < 255) ? r : 255;  
    g = (g < 255) ? g : 255;  
    b = (b < 255) ? b : 255;  

    let rr = ((r.toString(16).length === 1) ? '0' + r.toString(16) : r.toString(16));
    let gg = ((g.toString(16).length === 1) ? '0' + g.toString(16) : g.toString(16));
    let bb = ((b.toString(16).length === 1) ? '0' + b.toString(16) : b.toString(16));

    return `#${rr}${gg}${bb}`;
}

/**
 * lighten or unlighten a color.
 * 
 * @param {String} color - RBG hex color [#ffffff]
 * @param {Number} percent - A positive number to brighten the color,
 *                           or negative to darken it [%].
 * @returns {String} The color with a modified shader [#ffffff]
 */
function lightColor(color, percent) {
    let hsl = RGBHexToHSL(color);
    hsl.l += hsl.l * percent / 100;
    let hex = HSLToRGBHex(hsl);
    return hex;
}

/**
 * Darken a color.
 * 
 * @param {String} color - RBG hex color [#ffffff]
 * @param {Number} percent - How darker should the color become [%]
 * @returns {String} The color with a modified darkness [#ffffff]
 */
function darken(color, percent) {
    return shadeColor(color, -clampPercent(percent))
}

/**
 * Brighten a color.
 * 
 * @param {String} color - RBG hex color [#ffffff]
 * @param {Number} percent - How brighter should the color become [%]
 * @returns {String} The color with a modified brightness [#ffffff]
 */
function brighten(color, percent) {
    return shadeColor(color, clampPercent(percent))
}

/**
 * Lighten a color.
 * 
 * @param {String} color - RBG hex color [#ffffff]
 * @param {Number} percent - How lighter should the color become [%]
 * @returns {String} The color with a modified lightness [#ffffff]
 */
function lighten(color, percent) {
    let light = lightColor(color, clampPercent(percent));
    return brighten(light, percent);
}

/**
 * Unlighten a color.
 * 
 * @param {String} color - RBG hex color [#ffffff]
 * @param {Number} percent - How darker should the color become [%]
 * @returns {String} The color with a modified darkness [#ffffff]
 */
function unlighten(color, percent) {
    let light = lightColor(color, clampPercent(percent));
    return darken(light, percent);
}

/**
 * Clamp a percentage value between 0 and 100.
 * 
 * @param {Number} perc - The value to clamp
 * @returns {Number} A value in [0, 100].
 */
function clampPercent(perc) {
    return Math.min(Math.max(perc, 0), 100);
}