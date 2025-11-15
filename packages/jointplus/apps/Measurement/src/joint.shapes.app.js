/*! JointJS+ v4.1.1 - HTML5 Diagramming Framework - TRIAL VERSION

Copyright (c) 2025 client IO

 2025-11-10 


This Source Code Form is subject to the terms of the JointJS+ Trial License
, v. 2.0. If a copy of the JointJS+ License was not distributed with this
file, You can obtain one at https://www.jointjs.com/license
 or from the JointJS+ archive as was distributed by client IO. See the LICENSE file.*/


(function(shapes) {

    shapes.standard.Rectangle.define('app.Shape', {
        size: { width: 100, height: 100 },
        z: 1,
        attrs: {
            body: {
                fill: '#FFFFFF',
                strokeWidth: 1,
                stroke: '#A2A2A2',
                rx: 2,
                ry: 2
            }
        }
    });

    shapes.measurement.Distance.define('app.Distance', {
        z: 2,
        attrs: {
            distanceLabel: {
                fill: '#464554',
                distanceText: {
                    fixed: 1
                }
            },
            line: {
                stroke: '#464554'
            },
            anchorLines: {
                strokeDasharray: 'none',
                stroke: '#D2D2D2'
            }
        }
    });

    shapes.measurement.Distance.define('app.MainDistance', {
        z: 3,
        attrs: {
            distanceLabel: {
                fill: '#4666E5',
                distanceText: {
                    fixed: 1
                }
            },
            line: {
                stroke: '#4666E5'
            },
            anchorLines: {
                strokeDasharray: 'none',
                stroke: '#D2D2D2'
            }
        }
    });

})(joint.shapes);
