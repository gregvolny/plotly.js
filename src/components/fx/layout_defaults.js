'use strict';

var Lib = require('../../lib');
var layoutAttributes = require('./layout_attributes');
var handleHoverModeDefaults = require('./hovermode_defaults');
var handleHoverLabelDefaults = require('./hoverlabel_defaults');

module.exports = function supplyLayoutDefaults(layoutIn, layoutOut) {
    function coerce(attr, dflt) {
        return Lib.coerce(layoutIn, layoutOut, layoutAttributes, attr, dflt);
    }

    var hoverMode = handleHoverModeDefaults(layoutIn, layoutOut);
    if(hoverMode) {
        coerce('hoverdistance');
        coerce('spikedistance');
    }

    var dragMode = coerce('dragmode');
    if(dragMode === 'select') coerce('selectdirection');

    // if only mapnew or geo subplots is present on graph,
    // reset 'zoom' dragmode to 'pan' until 'zoom' is implemented,
    // so that the correct modebar button is active
    var hasMapnew = layoutOut._has('mapnew');
    var hasGeo = layoutOut._has('geo');
    var len = layoutOut._basePlotModules.length;

    if(layoutOut.dragmode === 'zoom' && (
        ((hasMapnew || hasGeo) && len === 1) ||
        (hasMapnew && hasGeo && len === 2)
    )) {
        layoutOut.dragmode = 'pan';
    }

    handleHoverLabelDefaults(layoutIn, layoutOut, coerce);

    Lib.coerceFont(coerce, 'hoverlabel.grouptitlefont', layoutOut.hoverlabel.font);
};
