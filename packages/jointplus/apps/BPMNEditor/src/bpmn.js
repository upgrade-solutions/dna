/*! JointJS+ v4.1.1 - HTML5 Diagramming Framework - TRIAL VERSION

Copyright (c) 2025 client IO

 2025-11-10 


This Source Code Form is subject to the terms of the JointJS+ Trial License
, v. 2.0. If a copy of the JointJS+ License was not distributed with this
file, You can obtain one at https://www.jointjs.com/license
 or from the JointJS+ archive as was distributed by client IO. See the LICENSE file.*/


joint.setTheme('bpmn');

/* GRAPH */

var example = window.example;
var inputs = window.inputs;
var toolbarConfig = window.toolbarConfig;
var bpmn2 = joint.shapes.bpmn2;
var paperContainerEl = document.getElementById('paper-container');

var BPMNTypes = {
    Pool: 'bpmn2.HeaderedPool',
    Group: 'bpmn2.Group',
    Activity: 'bpmn2.Activity',
    Event: 'bpmn2.Event',
    Gateway: 'bpmn2.Gateway',
    DataObject: 'bpmn2.DataObject',
    DataStore:'bpmn2.DataStore',
    DataAssociation: 'bpmn2.DataAssociation',
    Flow: 'bpmn2.Flow',
    Conversation: 'bpmn2.Conversation',
    ConversationLink: 'bpmn2.ConversationLink',
    Annotation: 'bpmn2.Annotation',
    AnnotationLink: 'bpmn2.AnnotationLink',
    Choreography: 'bpmn2.Choreography'
};

var graph = new joint.dia.Graph({ type: 'bpmn' }, { cellNamespace: joint.shapes });
var commandManager = new joint.dia.CommandManager({ graph: graph });
var keyboard = new joint.ui.Keyboard();

/* PAPER + SCROLLER */

var paper = new joint.dia.Paper({
    width: 1000,
    height: 1000,
    model: graph,
    gridSize: 5,
    async: true,
    sorting: joint.dia.Paper.sorting.APPROX,
    interactive: { linkMove: false },
    snapLabels: true,
    cellViewNamespace: joint.shapes,
    clickThreshold: 10,
    // Connections
    defaultLink: function() {
        return new bpmn2.Flow({
            attrs: {
                line: {
                    flowType: 'sequence'
                }
            }
        });
    },
    validateConnection: function(cellViewS, _magnetS, cellViewT, _magnetT, _end) {
        var source = cellViewS.model;
        var target = cellViewT.model;
        // don't allow loop links
        if (source === target) return false;
        // don't allow link to link connection
        if (source.isLink()) return false;
        if (target.isLink()) return false;
        // don't allow group connections
        var sourceType = source.get('type');
        var targetType = target.get('type');
        if (sourceType === BPMNTypes.Group || targetType === BPMNTypes.Group) return false;
        if (sourceType === BPMNTypes.Pool || targetType === BPMNTypes.Pool) return false;
        return true;
    },
    defaultAnchor: {
        name: 'perpendicular'
    },
    defaultConnectionPoint: {
        name: 'boundary',
        args: { stroke: true }
    },
    // Embedding
    embeddingMode: true,
    frontParentOnly: false,
    validateEmbedding: function(childView, parentView) {
        var parentType = parentView.model.get('type');
        var childType = childView.model.get('type');
        if (parentType === BPMNTypes.Pool && childType !== BPMNTypes.Pool) return true;
        if (parentType === BPMNTypes.Activity && childType === BPMNTypes.Event) return true;
        if (parentType === BPMNTypes.Group && childType !== BPMNTypes.Group && childType !== BPMNTypes.Pool) return true;
        return false;
    },
    // Highlighting
    highlighting: {
        default: {
            name: 'mask',
            options: {
                attrs: {
                    'stroke': '#3498db',
                    'stroke-width': 3,
                    'stroke-linejoin': 'round'
                }
            }
        }
    }
}).on({

    'blank:pointerdown': function(evt, x, y) {
        closeTools();
        selection.startSelecting(evt, x, y);
    },

    'blank:contextmenu': function(evt, x, y) {
        paperScroller.startPanning(evt, x, y);
    },

    'cell:pointerclick': function(cellView, evt, x, y) {
        openTools(cellView, g.Point(x, y));
    },

    'link:mouseenter': function(linkView) {
        // Open tool only if there is none yet
        if (linkView.hasTools()) return;

        var ns = joint.linkTools;
        var toolsView = new joint.dia.ToolsView({
            name: 'link-hover',
            tools: [
                new ns.Vertices({ vertexAdding: false }),
                new ns.SourceArrowhead(),
                new ns.TargetArrowhead()
            ]
        });

        linkView.addTools(toolsView);
    },

    'link:mouseleave': function(linkView) {
        // Remove only the hover tool, not the pointerdown tool
        if (linkView.hasTools('link-hover')) {
            linkView.removeTools();
        }
    },

    'link:connect': function(linkView) {
        // Change the link type based on the connected elements
        var link = linkView.model;
        var source = link.getSourceCell();
        var target = link.getTargetCell();
        if (!source || !target) return;
        var types = [source.get('type'), target.get('type')];
        var linkType = link.get('type');
        if (types.indexOf(BPMNTypes.Annotation) > -1) {
            if (linkType === BPMNTypes.AnnotationLink) return;
            replaceLink(graph, link, BPMNTypes.AnnotationLink);
            return;
        }
        if (types.indexOf(BPMNTypes.Conversation) > -1) {
            if (linkType === BPMNTypes.ConversationLink) return;
            replaceLink(graph, link, BPMNTypes.ConversationLink);
            return;
        }
        if (types.indexOf(BPMNTypes.DataObject) > -1) {
            if (linkType === BPMNTypes.DataAssociation) return;
            replaceLink(graph, link, BPMNTypes.DataAssociation);
            return;
        }
        if (types.indexOf(BPMNTypes.DataStore) > -1) {
            if (linkType === BPMNTypes.DataAssociation) return;
            replaceLink(graph, link, BPMNTypes.DataAssociation);
            return;
        }
        if (linkType !== BPMNTypes.Flow) {
            replaceLink(graph, link, BPMNTypes.Flow);
            return;
        }
    },

    'paper:pan': function(evt, tx, ty) {
        evt.preventDefault();
        paperScroller.el.scrollLeft += tx;
        paperScroller.el.scrollTop += ty;
    },

    'paper:pinch': function(evt, ox, oy, scale) {
        // the default is already prevented
        paperScroller.zoom(paperScroller.zoom() * scale, { min: 0.2, max: 5, ox, oy, absolute: true });
    }

});

var paperScroller = new joint.ui.PaperScroller({
    autoResizePaper: true,
    padding: 50,
    paper: paper,
    scrollWhileDragging: true
});

paperContainerEl.appendChild(paperScroller.el);
paperScroller.center();

/* SELECTION */

var selection = new joint.ui.Selection({
    paper: paper,
    graph: graph,
    useModelGeometry: true,
    filter: [BPMNTypes.Pool, BPMNTypes.Group] // don't allow to select pool or group shapes
});

/* STENCIL */

var stencil = new joint.ui.Stencil({
    graph: graph,
    paper: paperScroller,
    width: 1100,
    height: '100%',
    dragEndClone: function(cell) {

        var clone = cell.clone();
        var type = clone.get('type');

        // some types of the elements need resizing after they are dropped
        var sizeMultipliers = {};
        sizeMultipliers[BPMNTypes.Pool] = 6;
        sizeMultipliers[BPMNTypes.Choreography] = 2;
        sizeMultipliers[BPMNTypes.Group] = 2;

        if (type in sizeMultipliers) {
            var multiplier = sizeMultipliers[type]
            var originalSize = clone.size();
            clone.set('size', {
                width: originalSize.width * multiplier,
                height: originalSize.height * multiplier
            });
        }

        if (type === BPMNTypes.Pool) {
            var height = clone.size().height;
            clone.set({
                lanes: [{
                    label: 'Lane 1',
                    size: height / 2
                }, {
                    label: 'Lane 2',
                    size: height / 2
                }],
                padding: { top: 0, left: 30, right: 0, bottom: 0 }
            });
        }

        return clone;
    }
});

stencil.render();
document.getElementById('stencil-container').appendChild(stencil.el);

stencil.load([{
    type: BPMNTypes.Activity
}, {
    type: BPMNTypes.Gateway
}, {
    type: BPMNTypes.Event
}, {
    type: BPMNTypes.Conversation
}, {
    type: BPMNTypes.DataAssociation
}, {
    type: BPMNTypes.DataStore
}, {
    type: BPMNTypes.DataObject
}, {
    type: BPMNTypes.Annotation,
    attrs: {
        body: {
            fill: '#ffffff'
        }
    }
}, {
    type: BPMNTypes.Group,
    size: {
        width: 80,
        height: 80
    },
    attrs: {
        label: { text: 'Group' }
    }
}, {
    type: BPMNTypes.Pool,
    padding: { top: 0, left: 15, right: 0, bottom: 0 },
    size: { width: 90, height: 50 },
    lanes: [{
        label: 'Lane 1'
    }, {
        label: 'Lane 2'
    }],
    attrs: {
        body: { fill: '#ffffff' },
        headerLabel: { text: 'Header' },
        laneLabels: { fontSize: 13 },
        milestoneLabels: { fontSize: 13 }
    }
}, {
    type: BPMNTypes.Choreography,
    size: { width: 60, height: 80 },
    participants: ['Participant 1', 'Participant 2']
}]);

joint.layout.GridLayout.layout(stencil.getGraph(), {
    columns: 100,
    columnWidth: 'compact',
    marginX: 20,
    marginY: 20,
    columnGap: 40
});

stencil.on('element:drop', function(elementView, _evt, _x, _y) {
    // open inspector after a new element dropped from stencil
    openTools(elementView);
});

/* KEYBOARD */

keyboard.on('delete backspace', function() {
    graph.removeCells(selection.collection.toArray());
});

/* TOOLBAR */

var toolbar = new joint.ui.Toolbar({
    tools: toolbarConfig.tools,
    references: {
        paperScroller: paperScroller,
        commandManager: commandManager
    }
});

toolbar.on({
    'to-json:pointerclick': function() {
        var windowFeatures = 'menubar=no,location=no,resizable=yes,scrollbars=yes,status=no';
        var windowName = 'json_output_' + Date.now();
        var jsonWindow = window.open('', windowName, windowFeatures);
        if (jsonWindow) {
            jsonWindow.document.write(JSON.stringify(graph.toJSON()));
        }
    },
    'to-bpmn:pointerclick': function() {
        const { xml } = joint.format.toBPMN(paper);
        const blob = new Blob([ new XMLSerializer().serializeToString(xml)], {
            type: 'text/plain'
        });
        joint.util.downloadBlob(blob, 'jointjs.bpmn');
    },
    'clear:pointerclick': function() {
        graph.clear();
        paperScroller.center(500, 500);
    },
    'print:pointerclick': function() {
        joint.format.print(paper);
    }
});

toolbar.render();
document.getElementById('toolbar-container').appendChild(toolbar.el);

/* TOOLTIPS */

new joint.ui.Tooltip({
    target: '[data-tooltip]',
    content: function(el) { return el.dataset.tooltip; },
    top: '.joint-toolbar',
    padding: 10,
    direction: 'top'
});

// Create tooltips for all the shapes in stencil.
stencil.getGraph().getElements().forEach(function(cell) {
    new joint.ui.Tooltip({
        target: '.joint-stencil [model-id="' + cell.id + '"]',
        content: cell.get('type').split('.')[1],
        bottom: '.joint-stencil',
        direction: 'bottom',
        padding: 0
    });
});

// load an example graph
graph.fromJSON(example);
paperScroller.positionContent('top-left', { padding: 50, useModelGeometry: true });

/* ACTIONS */

function closeTools() {
    paper.removeTools();
    joint.ui.Inspector.close();
    joint.ui.FreeTransform.clear(paper);
    joint.ui.Halo.clear(paper);
}

function openTools(cellView, coordinates) {

    closeTools();

    var cell = cellView.model;
    var type = cell.get('type');

    selection.collection.reset([]);
    // Add the cell into the selection collection silently
    // so no selection box is rendered above the cellView.
    selection.collection.add(cell, { silent: true });

    if (cell.isElement()) {
        createElementHalo(cellView);
        createElementFreeTransform(cellView);
        if (type === BPMNTypes.Pool && coordinates) {
            createPoolTools(cellView, coordinates);
        }
    } else {
        createLinkTools(cellView);
    }

    joint.ui.Inspector.create('#inspector-container', {
        cell: cell,
        inputs: inputs[type],
        groups: {
            general: { label: type, index: 1 },
            appearance: { index: 2 },
            defaults: { index: 3 }
        }
    });
}

function createPoolTools(poolView, coordinates) {

    var pool = poolView.model;

    // If there is a lane under the pointer (mouse/touch),
    // add the swimlane tools and remove the FreeTransform from the cell
    var lanesIds = pool.getLanesFromPoint(coordinates);
    if (lanesIds.length === 0) return;
    var laneId = lanesIds[0];

    var boundaryTool = new joint.elementTools.SwimlaneBoundary({
        laneId: laneId,
        padding: 0,
        attributes: {
            'fill': 'none',
            'stroke-width': 3,
            'stroke': '#3498db'
        }
    });
    var transformTool = new joint.elementTools.SwimlaneTransform({
        laneId: laneId,
        minSize: 60,
        padding: 0,
    });
    var elementToolsView = new joint.dia.ToolsView({
        tools: [boundaryTool, transformTool]
    });
    poolView.addTools(elementToolsView);
    joint.ui.FreeTransform.clear(paper);
}

function createLinkTools(linkView) {
    var ns = joint.linkTools;
    var toolsView = new joint.dia.ToolsView({
        name: 'link-pointerdown',
        tools: [
            new ns.Vertices(),
            new ns.SourceAnchor(),
            new ns.TargetAnchor(),
            new ns.SourceArrowhead(),
            new ns.TargetArrowhead(),
            new ns.Segments(),
            new ns.Boundary({ padding: 15 }),
            new ns.Remove({ offset: -20, distance: 40 })
        ]
    });

    linkView.addTools(toolsView);
}


function createElementHalo(cellView) {
    var type = cellView.model.get('type');
    var halo = new joint.ui.Halo({
        cellView: cellView,
        theme: 'default',
        type: 'toolbar',
        useModelGeometry: true,
        boxContent: type
    });
    halo.removeHandle('rotate');
    halo.removeHandle('resize');
    if (type === BPMNTypes.Pool || type === BPMNTypes.Group) {
        halo.removeHandle('link');
        halo.removeHandle('fork');
        halo.removeHandle('unlink');
    }
    halo.render();
}

function createElementFreeTransform(cellView) {
    var defaultMinSize = 30;
    var freeTransform = new joint.ui.FreeTransform({
        cellView: cellView,
        allowOrthogonalResize: false,
        allowRotation: false,
        minWidth: function(el) {
            return (el.get('type') === BPMNTypes.Pool) ? el.getMinimalSize().width : defaultMinSize;
        },
        minHeight: function(el) {
            return (el.get('type') === BPMNTypes.Pool) ? el.getMinimalSize().height : defaultMinSize;
        }
    });
    freeTransform.render();
}

function replaceLink(linkGraph, link, type) {
    var link2JSON = {
        type: type,
        source: link.source(),
        target: link.target(),
        vertices: link.vertices()
    };
    link.remove();
    linkGraph.addCell(link2JSON);
}

// Import

paperContainerEl.addEventListener('drop', (evt) => {
    evt.preventDefault();
    paperContainerEl.classList.remove('drop-zone');
    const [file] = evt.dataTransfer.files;
    const reader = new FileReader();
    reader.onload = () => {
        const xmlDoc = (new DOMParser()).parseFromString(reader.result, 'application/xml');
        const { cells, errors } = joint.format.fromBPMN(xmlDoc, {
            bpmn2Shapes: bpmn2
        });
        if (errors.length > 0) {
            console.error(...errors);
            return;
        }
        graph.resetCells(cells);
        commandManager.reset();
        paperScroller.zoomToFit({ useModelGeometry: true, maxScale: 1, minScale: 0.2, padding: 50 })
    };
    reader.readAsText(file);
});

paperContainerEl.addEventListener('dragover', (evt) => {
    evt.preventDefault();
    paperContainerEl.classList.add('drop-zone');
});

paperContainerEl.addEventListener('dragleave', (evt) => {
    evt.preventDefault();
    paperContainerEl.classList.remove('drop-zone');
});
