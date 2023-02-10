'use strict';
var b64decode = require('base64-arraybuffer').decode;

var isPlainObject = require('./is_plain_object');

var isArray = Array.isArray;

var ab = ArrayBuffer;
var dv = DataView;

function isTypedArray(a) {
    return ab.isView(a) && !(a instanceof dv);
}
exports.isTypedArray = isTypedArray;

function isArrayOrTypedArray(a) {
    return isArray(a) || isTypedArray(a);
}
exports.isArrayOrTypedArray = isArrayOrTypedArray;

/*
 * Test whether an input object is 1D.
 *
 * Assumes we already know the object is an array.
 *
 * Looks only at the first element, if the dimensionality is
 * not consistent we won't figure that out here.
 */
function isArray1D(a) {
    return !isArrayOrTypedArray(a[0]);
}
exports.isArray1D = isArray1D;

/*
 * Ensures an array has the right amount of storage space. If it doesn't
 * exist, it creates an array. If it does exist, it returns it if too
 * short or truncates it in-place.
 *
 * The goal is to just reuse memory to avoid a bit of excessive garbage
 * collection.
 */
exports.ensureArray = function(out, n) {
    // TODO: typed array support here? This is only used in
    // traces/carpet/compute_control_points
    if(!isArray(out)) out = [];

    // If too long, truncate. (If too short, it will grow
    // automatically so we don't care about that case)
    out.length = n;

    return out;
};

function detectType(a) {
    return typeof a === 'undefined' ? undefined : a;
}

var typedArrays = {
    i8: detectType(Int8Array),
    ui8: detectType(Uint8Array),
    ui8c: detectType(Uint8ClampedArray),
    i16: detectType(Int16Array),
    ui16: detectType(Uint16Array),
    i32: detectType(Int32Array),
    ui32: detectType(Uint32Array),
    f32: detectType(Float32Array),
    f64: detectType(Float64Array),

    // TODO: potentially add Big Int
    // bi64: detectType(BigInt64Array),
    // bui64: detectType(BigUint64Array),
};

function isArrayBuffer(a) {
    return a.constructor === ArrayBuffer;
}
exports.isArrayBuffer = isArrayBuffer;

exports.decodeTypedArraySpec = function(vIn) {
    var out = [];
    var v = coerceTypedArraySpec(vIn);
    var shape = v.spec.split('|');
    var dtype = shape.shift();
    var ndims = shape.length;
    var T = typedArrays[dtype];
    if(!T) throw new Error('Error in spec: "' + v.spec + '"');

    var buffer = v.vals;
    if(!isArrayBuffer(buffer)) {
        buffer = b64decode(buffer);
    }

    var nj, j;
    var ni = +shape[0];

    var BYTES_PER_ELEMENT = T.BYTES_PER_ELEMENT;
    var rowBites = BYTES_PER_ELEMENT * ni;
    var pos = 0;

    if(ndims === 1) {
        out = new T(buffer);
    } else if(ndims === 2) {
        nj = +shape[1];
        for(j = 0; j < nj; j++) {
            out[j] = new T(buffer, pos, ni);
            pos += rowBites;
        }
    /*

    // 3d arrays are not supported in traces e.g. volume & isosurface
    // once supported we could uncomment this part

    } else if(ndims === 3) {
        nj = +shape[1];
        var nk = +shape[2];
        for(var k = 0; k < nk; k++) {
            out[k] = [];
            for(j = 0; j < nj; j++) {
                out[k][j] = new T(buffer, pos, ni);
                pos += rowBites;
            }
        }
    */
    } else {
        throw new Error('Error in spec: "' + v.spec + '"');
    }

    // attach spec & vals to array for json export
    out.spec = v.spec;
    out.vals = v.vals;

    return out;
};

exports.isTypedArraySpec = function(v) {
    return (
        isPlainObject(v) &&
        v.hasOwnProperty('spec') && (typeof v.spec === 'string') &&
        v.hasOwnProperty('vals') && (typeof v.vals === 'string' || isArrayBuffer(v.vals))
    );
};

function coerceTypedArraySpec(v) {
    return {
        spec: v.spec,
        vals: v.vals
    };
}

/*
 * TypedArray-compatible concatenation of n arrays
 * if all arrays are the same type it will preserve that type,
 * otherwise it falls back on Array.
 * Also tries to avoid copying, in case one array has zero length
 * But never mutates an existing array
 */
exports.concat = function() {
    var args = [];
    var allArray = true;
    var totalLen = 0;

    var _constructor, arg0, i, argi, posi, leni, out, j;

    for(i = 0; i < arguments.length; i++) {
        argi = arguments[i];
        leni = argi.length;
        if(leni) {
            if(arg0) args.push(argi);
            else {
                arg0 = argi;
                posi = leni;
            }

            if(isArray(argi)) {
                _constructor = false;
            } else {
                allArray = false;
                if(!totalLen) {
                    _constructor = argi.constructor;
                } else if(_constructor !== argi.constructor) {
                    // TODO: in principle we could upgrade here,
                    // ie keep typed array but convert all to Float64Array?
                    _constructor = false;
                }
            }

            totalLen += leni;
        }
    }

    if(!totalLen) return [];
    if(!args.length) return arg0;

    if(allArray) return arg0.concat.apply(arg0, args);
    if(_constructor) {
        // matching typed arrays
        out = new _constructor(totalLen);
        out.set(arg0);
        for(i = 0; i < args.length; i++) {
            argi = args[i];
            out.set(argi, posi);
            posi += argi.length;
        }
        return out;
    }

    // mismatched types or Array + typed
    out = new Array(totalLen);
    for(j = 0; j < arg0.length; j++) out[j] = arg0[j];
    for(i = 0; i < args.length; i++) {
        argi = args[i];
        for(j = 0; j < argi.length; j++) out[posi + j] = argi[j];
        posi += j;
    }
    return out;
};

exports.maxRowLength = function(z) {
    return _rowLength(z, Math.max, 0);
};

exports.minRowLength = function(z) {
    return _rowLength(z, Math.min, Infinity);
};

function _rowLength(z, fn, len0) {
    if(isArrayOrTypedArray(z)) {
        if(isArrayOrTypedArray(z[0])) {
            var len = len0;
            for(var i = 0; i < z.length; i++) {
                len = fn(len, z[i].length);
            }
            return len;
        } else {
            return z.length;
        }
    }
    return 0;
}
