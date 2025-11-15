/*! JointJS+ v4.1.1 - HTML5 Diagramming Framework - TRIAL VERSION

Copyright (c) 2025 client IO

 2025-11-10 


This Source Code Form is subject to the terms of the JointJS+ Trial License
, v. 2.0. If a copy of the JointJS+ License was not distributed with this
file, You can obtain one at https://www.jointjs.com/license
 or from the JointJS+ archive as was distributed by client IO. See the LICENSE file.*/


import { dia } from '@joint/plus';

import { SharedEvents } from '../joint-plus/controller';
import JointPlusService from '../services/joint-plus.service';
import { STORE_JOINT } from './helpers/actionTypes';

export interface State {
    joint: JointPlusService;
    graphJSON: object;
    selection: dia.Cell[];
}

const initialState: State = {
    joint: null as JointPlusService,
    graphJSON: {},
    selection: []
};

const reducer = (state = initialState, action: { type: string, payload: any }) => {
    switch (action.type) {
        case STORE_JOINT:
            return {
                ...state,
                joint: action.payload
            };
        case SharedEvents.GRAPH_CHANGED:
            return {
                ...state,
                graphJSON: action.payload
            };
        case SharedEvents.SELECTION_CHANGED:
            return {
                ...state,
                selection: action.payload,
            };
        default:
            return state;
    }
};

export default reducer;
