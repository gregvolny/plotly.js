'use strict';

var parseSvgPath = require('parse-svg-path');
var round = // require('@plotly/d3').round;
    function(x, n) {
        return n ? Math.round(x * (n = Math.pow(10, n))) / n : Math.round(x);
    };

/** Marker symbol definitions
 * users can specify markers either by number or name
 * add 100 (or '-open') and you get an open marker
 *  open markers have no fill and use line color as the stroke color
 * add 200 (or '-dot') and you get a dot in the middle
 * add both and you get both
 */


var emptyPath = 'M0,0Z';
var sqrt2 = Math.sqrt(2);
var sqrt3 = Math.sqrt(3);
var PI = Math.PI;
var cos = Math.cos;
var sin = Math.sin;

module.exports = {
    circle: {
        n: 0,
        f: function(r, angle, standoff) {
            if(skipAngle(angle)) return emptyPath;

            var rs = round(r, 2);
            var circle = 'M' + rs + ',0A' + rs + ',' + rs + ' 0 1,1 0,-' + rs + 'A' + rs + ',' + rs + ' 0 0,1 ' + rs + ',0Z';
            return standoff ? align(angle, standoff, circle) : circle;
        }
    },
    square: {
        n: 1,
        f: function(r, angle, standoff) {
            if(skipAngle(angle)) return emptyPath;

            var rs = round(r, 2);
            return align(angle, standoff, 'M' + rs + ',' + rs + 'H-' + rs + 'V-' + rs + 'H' + rs + 'Z');
        }
    },
    diamond: {
        n: 2,
        f: function(r, angle, standoff) {
            if(skipAngle(angle)) return emptyPath;

            var rd = round(r * 1.3, 2);
            return align(angle, standoff, 'M' + rd + ',0L0,' + rd + 'L-' + rd + ',0L0,-' + rd + 'Z');
        }
    },
    cross: {
        n: 3,
        f: function(r, angle, standoff) {
            if(skipAngle(angle)) return emptyPath;

            var rc = round(r * 0.4, 2);
            var rc2 = round(r * 1.2, 2);
            return align(angle, standoff, 'M' + rc2 + ',' + rc + 'H' + rc + 'V' + rc2 + 'H-' + rc +
                'V' + rc + 'H-' + rc2 + 'V-' + rc + 'H-' + rc + 'V-' + rc2 +
                'H' + rc + 'V-' + rc + 'H' + rc2 + 'Z');
        }
    },
    x: {
        n: 4,
        f: function(r, angle, standoff) {
            if(skipAngle(angle)) return emptyPath;

            var rx = round(r * 0.8 / sqrt2, 2);
            var ne = 'l' + rx + ',' + rx;
            var se = 'l' + rx + ',-' + rx;
            var sw = 'l-' + rx + ',-' + rx;
            var nw = 'l-' + rx + ',' + rx;
            return align(angle, standoff, 'M0,' + rx + ne + se + sw + se + sw + nw + sw + nw + ne + nw + ne + 'Z');
        }
    },
    'triangle-up': {
        n: 5,
        f: function(r, angle, standoff) {
            if(skipAngle(angle)) return emptyPath;

            var rt = round(r * 2 / sqrt3, 2);
            var r2 = round(r / 2, 2);
            var rs = round(r, 2);
            return align(angle, standoff, 'M-' + rt + ',' + r2 + 'H' + rt + 'L0,-' + rs + 'Z');
        }
    },
    'triangle-down': {
        n: 6,
        f: function(r, angle, standoff) {
            if(skipAngle(angle)) return emptyPath;

            var rt = round(r * 2 / sqrt3, 2);
            var r2 = round(r / 2, 2);
            var rs = round(r, 2);
            return align(angle, standoff, 'M-' + rt + ',-' + r2 + 'H' + rt + 'L0,' + rs + 'Z');
        }
    },
    'triangle-left': {
        n: 7,
        f: function(r, angle, standoff) {
            if(skipAngle(angle)) return emptyPath;

            var rt = round(r * 2 / sqrt3, 2);
            var r2 = round(r / 2, 2);
            var rs = round(r, 2);
            return align(angle, standoff, 'M' + r2 + ',-' + rt + 'V' + rt + 'L-' + rs + ',0Z');
        }
    },
    'triangle-right': {
        n: 8,
        f: function(r, angle, standoff) {
            if(skipAngle(angle)) return emptyPath;

            var rt = round(r * 2 / sqrt3, 2);
            var r2 = round(r / 2, 2);
            var rs = round(r, 2);
            return align(angle, standoff, 'M-' + r2 + ',-' + rt + 'V' + rt + 'L' + rs + ',0Z');
        }
    },
    'triangle-ne': {
        n: 9,
        f: function(r, angle, standoff) {
            if(skipAngle(angle)) return emptyPath;

            var r1 = round(r * 0.6, 2);
            var r2 = round(r * 1.2, 2);
            return align(angle, standoff, 'M-' + r2 + ',-' + r1 + 'H' + r1 + 'V' + r2 + 'Z');
        }
    },
    'triangle-se': {
        n: 10,
        f: function(r, angle, standoff) {
            if(skipAngle(angle)) return emptyPath;

            var r1 = round(r * 0.6, 2);
            var r2 = round(r * 1.2, 2);
            return align(angle, standoff, 'M' + r1 + ',-' + r2 + 'V' + r1 + 'H-' + r2 + 'Z');
        }
    },
    'triangle-sw': {
        n: 11,
        f: function(r, angle, standoff) {
            if(skipAngle(angle)) return emptyPath;

            var r1 = round(r * 0.6, 2);
            var r2 = round(r * 1.2, 2);
            return align(angle, standoff, 'M' + r2 + ',' + r1 + 'H-' + r1 + 'V-' + r2 + 'Z');
        }
    },
    'triangle-nw': {
        n: 12,
        f: function(r, angle, standoff) {
            if(skipAngle(angle)) return emptyPath;

            var r1 = round(r * 0.6, 2);
            var r2 = round(r * 1.2, 2);
            return align(angle, standoff, 'M-' + r1 + ',' + r2 + 'V-' + r1 + 'H' + r2 + 'Z');
        }
    },
    pentagon: {
        n: 13,
        f: function(r, angle, standoff) {
            if(skipAngle(angle)) return emptyPath;

            var x1 = round(r * 0.951, 2);
            var x2 = round(r * 0.588, 2);
            var y0 = round(-r, 2);
            var y1 = round(r * -0.309, 2);
            var y2 = round(r * 0.809, 2);
            return align(angle, standoff, 'M' + x1 + ',' + y1 + 'L' + x2 + ',' + y2 + 'H-' + x2 +
                'L-' + x1 + ',' + y1 + 'L0,' + y0 + 'Z');
        }
    },
    hexagon: {
        n: 14,
        f: function(r, angle, standoff) {
            if(skipAngle(angle)) return emptyPath;

            var y0 = round(r, 2);
            var y1 = round(r / 2, 2);
            var x = round(r * sqrt3 / 2, 2);
            return align(angle, standoff, 'M' + x + ',-' + y1 + 'V' + y1 + 'L0,' + y0 +
                'L-' + x + ',' + y1 + 'V-' + y1 + 'L0,-' + y0 + 'Z');
        }
    },
    hexagon2: {
        n: 15,
        f: function(r, angle, standoff) {
            if(skipAngle(angle)) return emptyPath;

            var x0 = round(r, 2);
            var x1 = round(r / 2, 2);
            var y = round(r * sqrt3 / 2, 2);
            return align(angle, standoff, 'M-' + x1 + ',' + y + 'H' + x1 + 'L' + x0 +
                ',0L' + x1 + ',-' + y + 'H-' + x1 + 'L-' + x0 + ',0Z');
        }
    },
    octagon: {
        n: 16,
        f: function(r, angle, standoff) {
            if(skipAngle(angle)) return emptyPath;

            var a = round(r * 0.924, 2);
            var b = round(r * 0.383, 2);
            return align(angle, standoff, 'M-' + b + ',-' + a + 'H' + b + 'L' + a + ',-' + b + 'V' + b +
                'L' + b + ',' + a + 'H-' + b + 'L-' + a + ',' + b + 'V-' + b + 'Z');
        }
    },
    star: {
        n: 17,
        f: function(r, angle, standoff) {
            if(skipAngle(angle)) return emptyPath;

            var rs = r * 1.4;
            var x1 = round(rs * 0.225, 2);
            var x2 = round(rs * 0.951, 2);
            var x3 = round(rs * 0.363, 2);
            var x4 = round(rs * 0.588, 2);
            var y0 = round(-rs, 2);
            var y1 = round(rs * -0.309, 2);
            var y3 = round(rs * 0.118, 2);
            var y4 = round(rs * 0.809, 2);
            var y5 = round(rs * 0.382, 2);
            return align(angle, standoff, 'M' + x1 + ',' + y1 + 'H' + x2 + 'L' + x3 + ',' + y3 +
                'L' + x4 + ',' + y4 + 'L0,' + y5 + 'L-' + x4 + ',' + y4 +
                'L-' + x3 + ',' + y3 + 'L-' + x2 + ',' + y1 + 'H-' + x1 +
                'L0,' + y0 + 'Z');
        }
    },
    hexagram: {
        n: 18,
        f: function(r, angle, standoff) {
            if(skipAngle(angle)) return emptyPath;

            var y = round(r * 0.66, 2);
            var x1 = round(r * 0.38, 2);
            var x2 = round(r * 0.76, 2);
            return align(angle, standoff, 'M-' + x2 + ',0l-' + x1 + ',-' + y + 'h' + x2 +
                'l' + x1 + ',-' + y + 'l' + x1 + ',' + y + 'h' + x2 +
                'l-' + x1 + ',' + y + 'l' + x1 + ',' + y + 'h-' + x2 +
                'l-' + x1 + ',' + y + 'l-' + x1 + ',-' + y + 'h-' + x2 + 'Z');
        }
    },
    'star-triangle-up': {
        n: 19,
        f: function(r, angle, standoff) {
            if(skipAngle(angle)) return emptyPath;

            var x = round(r * sqrt3 * 0.8, 2);
            var y1 = round(r * 0.8, 2);
            var y2 = round(r * 1.6, 2);
            var rc = round(r * 4, 2);
            var aPart = 'A ' + rc + ',' + rc + ' 0 0 1 ';
            return align(angle, standoff, 'M-' + x + ',' + y1 + aPart + x + ',' + y1 +
                aPart + '0,-' + y2 + aPart + '-' + x + ',' + y1 + 'Z');
        }
    },
    'star-triangle-down': {
        n: 20,
        f: function(r, angle, standoff) {
            if(skipAngle(angle)) return emptyPath;

            var x = round(r * sqrt3 * 0.8, 2);
            var y1 = round(r * 0.8, 2);
            var y2 = round(r * 1.6, 2);
            var rc = round(r * 4, 2);
            var aPart = 'A ' + rc + ',' + rc + ' 0 0 1 ';
            return align(angle, standoff, 'M' + x + ',-' + y1 + aPart + '-' + x + ',-' + y1 +
                aPart + '0,' + y2 + aPart + x + ',-' + y1 + 'Z');
        }
    },
    'star-square': {
        n: 21,
        f: function(r, angle, standoff) {
            if(skipAngle(angle)) return emptyPath;

            var rp = round(r * 1.1, 2);
            var rc = round(r * 2, 2);
            var aPart = 'A ' + rc + ',' + rc + ' 0 0 1 ';
            return align(angle, standoff, 'M-' + rp + ',-' + rp + aPart + '-' + rp + ',' + rp +
                aPart + rp + ',' + rp + aPart + rp + ',-' + rp +
                aPart + '-' + rp + ',-' + rp + 'Z');
        }
    },
    'star-diamond': {
        n: 22,
        f: function(r, angle, standoff) {
            if(skipAngle(angle)) return emptyPath;

            var rp = round(r * 1.4, 2);
            var rc = round(r * 1.9, 2);
            var aPart = 'A ' + rc + ',' + rc + ' 0 0 1 ';
            return align(angle, standoff, 'M-' + rp + ',0' + aPart + '0,' + rp +
                aPart + rp + ',0' + aPart + '0,-' + rp +
                aPart + '-' + rp + ',0' + 'Z');
        }
    },
    'diamond-tall': {
        n: 23,
        f: function(r, angle, standoff) {
            if(skipAngle(angle)) return emptyPath;

            var x = round(r * 0.7, 2);
            var y = round(r * 1.4, 2);
            return align(angle, standoff, 'M0,' + y + 'L' + x + ',0L0,-' + y + 'L-' + x + ',0Z');
        }
    },
    'diamond-wide': {
        n: 24,
        f: function(r, angle, standoff) {
            if(skipAngle(angle)) return emptyPath;

            var x = round(r * 1.4, 2);
            var y = round(r * 0.7, 2);
            return align(angle, standoff, 'M0,' + y + 'L' + x + ',0L0,-' + y + 'L-' + x + ',0Z');
        }
    },
    hourglass: {
        n: 25,
        f: function(r, angle, standoff) {
            if(skipAngle(angle)) return emptyPath;

            var rs = round(r, 2);
            return align(angle, standoff, 'M' + rs + ',' + rs + 'H-' + rs + 'L' + rs + ',-' + rs + 'H-' + rs + 'Z');
        },
        noDot: true
    },
    bowtie: {
        n: 26,
        f: function(r, angle, standoff) {
            if(skipAngle(angle)) return emptyPath;

            var rs = round(r, 2);
            return align(angle, standoff, 'M' + rs + ',' + rs + 'V-' + rs + 'L-' + rs + ',' + rs + 'V-' + rs + 'Z');
        },
        noDot: true
    },
    'circle-cross': {
        n: 27,
        f: function(r, angle, standoff) {
            if(skipAngle(angle)) return emptyPath;

            var rs = round(r, 2);
            return align(angle, standoff, 'M0,' + rs + 'V-' + rs + 'M' + rs + ',0H-' + rs +
                'M' + rs + ',0A' + rs + ',' + rs + ' 0 1,1 0,-' + rs +
                'A' + rs + ',' + rs + ' 0 0,1 ' + rs + ',0Z');
        },
        needLine: true,
        noDot: true
    },
    'circle-x': {
        n: 28,
        f: function(r, angle, standoff) {
            if(skipAngle(angle)) return emptyPath;

            var rs = round(r, 2);
            var rc = round(r / sqrt2, 2);
            return align(angle, standoff, 'M' + rc + ',' + rc + 'L-' + rc + ',-' + rc +
                'M' + rc + ',-' + rc + 'L-' + rc + ',' + rc +
                'M' + rs + ',0A' + rs + ',' + rs + ' 0 1,1 0,-' + rs +
                'A' + rs + ',' + rs + ' 0 0,1 ' + rs + ',0Z');
        },
        needLine: true,
        noDot: true
    },
    'square-cross': {
        n: 29,
        f: function(r, angle, standoff) {
            if(skipAngle(angle)) return emptyPath;

            var rs = round(r, 2);
            return align(angle, standoff, 'M0,' + rs + 'V-' + rs + 'M' + rs + ',0H-' + rs +
                'M' + rs + ',' + rs + 'H-' + rs + 'V-' + rs + 'H' + rs + 'Z');
        },
        needLine: true,
        noDot: true
    },
    'square-x': {
        n: 30,
        f: function(r, angle, standoff) {
            if(skipAngle(angle)) return emptyPath;

            var rs = round(r, 2);
            return align(angle, standoff, 'M' + rs + ',' + rs + 'L-' + rs + ',-' + rs +
                'M' + rs + ',-' + rs + 'L-' + rs + ',' + rs +
                'M' + rs + ',' + rs + 'H-' + rs + 'V-' + rs + 'H' + rs + 'Z');
        },
        needLine: true,
        noDot: true
    },
    'diamond-cross': {
        n: 31,
        f: function(r, angle, standoff) {
            if(skipAngle(angle)) return emptyPath;

            var rd = round(r * 1.3, 2);
            return align(angle, standoff, 'M' + rd + ',0L0,' + rd + 'L-' + rd + ',0L0,-' + rd + 'Z' +
                'M0,-' + rd + 'V' + rd + 'M-' + rd + ',0H' + rd);
        },
        needLine: true,
        noDot: true
    },
    'diamond-x': {
        n: 32,
        f: function(r, angle, standoff) {
            if(skipAngle(angle)) return emptyPath;

            var rd = round(r * 1.3, 2);
            var r2 = round(r * 0.65, 2);
            return align(angle, standoff, 'M' + rd + ',0L0,' + rd + 'L-' + rd + ',0L0,-' + rd + 'Z' +
                'M-' + r2 + ',-' + r2 + 'L' + r2 + ',' + r2 +
                'M-' + r2 + ',' + r2 + 'L' + r2 + ',-' + r2);
        },
        needLine: true,
        noDot: true
    },
    'cross-thin': {
        n: 33,
        f: function(r, angle, standoff) {
            if(skipAngle(angle)) return emptyPath;

            var rc = round(r * 1.4, 2);
            return align(angle, standoff, 'M0,' + rc + 'V-' + rc + 'M' + rc + ',0H-' + rc);
        },
        needLine: true,
        noDot: true,
        noFill: true
    },
    'x-thin': {
        n: 34,
        f: function(r, angle, standoff) {
            if(skipAngle(angle)) return emptyPath;

            var rx = round(r, 2);
            return align(angle, standoff, 'M' + rx + ',' + rx + 'L-' + rx + ',-' + rx +
                'M' + rx + ',-' + rx + 'L-' + rx + ',' + rx);
        },
        needLine: true,
        noDot: true,
        noFill: true
    },
    asterisk: {
        n: 35,
        f: function(r, angle, standoff) {
            if(skipAngle(angle)) return emptyPath;

            var rc = round(r * 1.2, 2);
            var rs = round(r * 0.85, 2);
            return align(angle, standoff, 'M0,' + rc + 'V-' + rc + 'M' + rc + ',0H-' + rc +
                'M' + rs + ',' + rs + 'L-' + rs + ',-' + rs +
                'M' + rs + ',-' + rs + 'L-' + rs + ',' + rs);
        },
        needLine: true,
        noDot: true,
        noFill: true
    },
    hash: {
        n: 36,
        f: function(r, angle, standoff) {
            if(skipAngle(angle)) return emptyPath;

            var r1 = round(r / 2, 2);
            var r2 = round(r, 2);

            return align(angle, standoff, 'M' + r1 + ',' + r2 + 'V-' + r2 +
                'M' + (r1 - r2) + ',-' + r2 + 'V' + r2 +
                'M' + r2 + ',' + r1 + 'H-' + r2 +
                'M-' + r2 + ',' + (r1 - r2) + 'H' + r2);
        },
        needLine: true,
        noFill: true
    },
    'y-up': {
        n: 37,
        f: function(r, angle, standoff) {
            if(skipAngle(angle)) return emptyPath;

            var x = round(r * 1.2, 2);
            var y0 = round(r * 1.6, 2);
            var y1 = round(r * 0.8, 2);
            return align(angle, standoff, 'M-' + x + ',' + y1 + 'L0,0M' + x + ',' + y1 + 'L0,0M0,-' + y0 + 'L0,0');
        },
        needLine: true,
        noDot: true,
        noFill: true
    },
    'y-down': {
        n: 38,
        f: function(r, angle, standoff) {
            if(skipAngle(angle)) return emptyPath;

            var x = round(r * 1.2, 2);
            var y0 = round(r * 1.6, 2);
            var y1 = round(r * 0.8, 2);
            return align(angle, standoff, 'M-' + x + ',-' + y1 + 'L0,0M' + x + ',-' + y1 + 'L0,0M0,' + y0 + 'L0,0');
        },
        needLine: true,
        noDot: true,
        noFill: true
    },
    'y-left': {
        n: 39,
        f: function(r, angle, standoff) {
            if(skipAngle(angle)) return emptyPath;

            var y = round(r * 1.2, 2);
            var x0 = round(r * 1.6, 2);
            var x1 = round(r * 0.8, 2);
            return align(angle, standoff, 'M' + x1 + ',' + y + 'L0,0M' + x1 + ',-' + y + 'L0,0M-' + x0 + ',0L0,0');
        },
        needLine: true,
        noDot: true,
        noFill: true
    },
    'y-right': {
        n: 40,
        f: function(r, angle, standoff) {
            if(skipAngle(angle)) return emptyPath;

            var y = round(r * 1.2, 2);
            var x0 = round(r * 1.6, 2);
            var x1 = round(r * 0.8, 2);
            return align(angle, standoff, 'M-' + x1 + ',' + y + 'L0,0M-' + x1 + ',-' + y + 'L0,0M' + x0 + ',0L0,0');
        },
        needLine: true,
        noDot: true,
        noFill: true
    },
    'line-ew': {
        n: 41,
        f: function(r, angle, standoff) {
            if(skipAngle(angle)) return emptyPath;

            var rc = round(r * 1.4, 2);
            return align(angle, standoff, 'M' + rc + ',0H-' + rc);
        },
        needLine: true,
        noDot: true,
        noFill: true
    },
    'line-ns': {
        n: 42,
        f: function(r, angle, standoff) {
            if(skipAngle(angle)) return emptyPath;

            var rc = round(r * 1.4, 2);
            return align(angle, standoff, 'M0,' + rc + 'V-' + rc);
        },
        needLine: true,
        noDot: true,
        noFill: true
    },
    'line-ne': {
        n: 43,
        f: function(r, angle, standoff) {
            if(skipAngle(angle)) return emptyPath;

            var rx = round(r, 2);
            return align(angle, standoff, 'M' + rx + ',-' + rx + 'L-' + rx + ',' + rx);
        },
        needLine: true,
        noDot: true,
        noFill: true
    },
    'line-nw': {
        n: 44,
        f: function(r, angle, standoff) {
            if(skipAngle(angle)) return emptyPath;

            var rx = round(r, 2);
            return align(angle, standoff, 'M' + rx + ',' + rx + 'L-' + rx + ',-' + rx);
        },
        needLine: true,
        noDot: true,
        noFill: true
    },
    'arrow-up': {
        n: 45,
        f: function(r, angle, standoff) {
            if(skipAngle(angle)) return emptyPath;

            var rx = round(r, 2);
            var ry = round(r * 2, 2);
            return align(angle, standoff, 'M0,0L-' + rx + ',' + ry + 'H' + rx + 'Z');
        },
        backoff: 1,
        noDot: true
    },
    'arrow-down': {
        n: 46,
        f: function(r, angle, standoff) {
            if(skipAngle(angle)) return emptyPath;

            var rx = round(r, 2);
            var ry = round(r * 2, 2);
            return align(angle, standoff, 'M0,0L-' + rx + ',-' + ry + 'H' + rx + 'Z');
        },
        noDot: true
    },
    'arrow-left': {
        n: 47,
        f: function(r, angle, standoff) {
            if(skipAngle(angle)) return emptyPath;

            var rx = round(r * 2, 2);
            var ry = round(r, 2);
            return align(angle, standoff, 'M0,0L' + rx + ',-' + ry + 'V' + ry + 'Z');
        },
        noDot: true
    },
    'arrow-right': {
        n: 48,
        f: function(r, angle, standoff) {
            if(skipAngle(angle)) return emptyPath;

            var rx = round(r * 2, 2);
            var ry = round(r, 2);
            return align(angle, standoff, 'M0,0L-' + rx + ',-' + ry + 'V' + ry + 'Z');
        },
        noDot: true
    },
    'arrow-bar-up': {
        n: 49,
        f: function(r, angle, standoff) {
            if(skipAngle(angle)) return emptyPath;

            var rx = round(r, 2);
            var ry = round(r * 2, 2);
            return align(angle, standoff, 'M-' + rx + ',0H' + rx + 'M0,0L-' + rx + ',' + ry + 'H' + rx + 'Z');
        },
        backoff: 1,
        needLine: true,
        noDot: true
    },
    'arrow-bar-down': {
        n: 50,
        f: function(r, angle, standoff) {
            if(skipAngle(angle)) return emptyPath;

            var rx = round(r, 2);
            var ry = round(r * 2, 2);
            return align(angle, standoff, 'M-' + rx + ',0H' + rx + 'M0,0L-' + rx + ',-' + ry + 'H' + rx + 'Z');
        },
        needLine: true,
        noDot: true
    },
    'arrow-bar-left': {
        n: 51,
        f: function(r, angle, standoff) {
            if(skipAngle(angle)) return emptyPath;

            var rx = round(r * 2, 2);
            var ry = round(r, 2);
            return align(angle, standoff, 'M0,-' + ry + 'V' + ry + 'M0,0L' + rx + ',-' + ry + 'V' + ry + 'Z');
        },
        needLine: true,
        noDot: true
    },
    'arrow-bar-right': {
        n: 52,
        f: function(r, angle, standoff) {
            if(skipAngle(angle)) return emptyPath;

            var rx = round(r * 2, 2);
            var ry = round(r, 2);
            return align(angle, standoff, 'M0,-' + ry + 'V' + ry + 'M0,0L-' + rx + ',-' + ry + 'V' + ry + 'Z');
        },
        needLine: true,
        noDot: true
    },
    arrow: {
        n: 53,
        f: function(r, angle, standoff) {
            if(skipAngle(angle)) return emptyPath;

            var headAngle = PI / 2.5; // 36 degrees - golden ratio
            var x = 2 * r * cos(headAngle);
            var y = 2 * r * sin(headAngle);

            return align(angle, standoff,
                'M0,0' +
                'L' + -x + ',' + y +
                'L' + x + ',' + y +
                'Z'
            );
        },
        backoff: 0.9,
        noDot: true
    },
    'arrow-wide': {
        n: 54,
        f: function(r, angle, standoff) {
            if(skipAngle(angle)) return emptyPath;

            var headAngle = PI / 4; // 90 degrees
            var x = 2 * r * cos(headAngle);
            var y = 2 * r * sin(headAngle);

            return align(angle, standoff,
                'M0,0' +
                'L' + -x + ',' + y +
                'A ' + 2 * r + ',' + 2 * r + ' 0 0 1 ' + x + ',' + y +
                'Z'
            );
        },
        backoff: 0.4,
        noDot: true
    }
};

function skipAngle(angle) {
    return angle === null;
}

var lastPathIn, lastPathOut;
var lastAngle, lastStandoff;

function align(angle, standoff, path) {
    if((!angle || angle % 360 === 0) && !standoff) return path;

    if(
        lastAngle === angle &&
        lastStandoff === standoff &&
        lastPathIn === path
    ) return lastPathOut;

    lastAngle = angle;
    lastStandoff = standoff;
    lastPathIn = path;

    function rotate(t, xy) {
        var cosT = cos(t);
        var sinT = sin(t);

        var x = xy[0];
        var y = xy[1] + (standoff || 0);
        return [
            x * cosT - y * sinT,
            x * sinT + y * cosT
        ];
    }

    var t = angle / 180 * PI;

    var x = 0;
    var y = 0;
    var cmd = parseSvgPath(path);
    var str = '';

    for(var i = 0; i < cmd.length; i++) {
        var cmdI = cmd[i];
        var op = cmdI[0];

        var x0 = x;
        var y0 = y;

        if(op === 'M' || op === 'L') {
            x = +cmdI[1];
            y = +cmdI[2];
        } else if(op === 'm' || op === 'l') {
            x += +cmdI[1];
            y += +cmdI[2];
        } else if(op === 'H') {
            x = +cmdI[1];
        } else if(op === 'h') {
            x += +cmdI[1];
        } else if(op === 'V') {
            y = +cmdI[1];
        } else if(op === 'v') {
            y += +cmdI[1];
        } else if(op === 'A') {
            x = +cmdI[1];
            y = +cmdI[2];

            var E = rotate(t, [+cmdI[6], +cmdI[7]]);
            cmdI[6] = E[0];
            cmdI[7] = E[1];
            cmdI[3] = +cmdI[3] + angle;
        }

        // change from H, V, h, v to L or l
        if(op === 'H' || op === 'V') op = 'L';
        if(op === 'h' || op === 'v') op = 'l';

        if(op === 'm' || op === 'l') {
            x -= x0;
            y -= y0;
        }

        var B = rotate(t, [x, y]);

        if(op === 'H' || op === 'V') op = 'L';


        if(
            op === 'M' || op === 'L' ||
            op === 'm' || op === 'l'
        ) {
            cmdI[1] = B[0];
            cmdI[2] = B[1];
        }
        cmdI[0] = op;

        str += cmdI[0] + cmdI.slice(1).join(',');
    }

    lastPathOut = str;

    return str;
}
