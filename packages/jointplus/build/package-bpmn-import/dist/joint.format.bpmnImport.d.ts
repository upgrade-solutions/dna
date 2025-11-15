/*! JointJS+ v4.1.1 - HTML5 Diagramming Framework - TRIAL VERSION

Copyright (c) 2025 client IO

 2025-11-10 


This Source Code Form is subject to the terms of the JointJS+ Trial License
, v. 2.0. If a copy of the JointJS+ License was not distributed with this
file, You can obtain one at https://www.jointjs.com/license
 or from the JointJS+ archive as was distributed by client IO. See the LICENSE file.*/


import { dia } from '@joint/core';

export type DefaultFactory = () => dia.Cell;

export type DecisiveElements =
    'participant' |
    'lane' |
    'task' |
    'serviceTask' |
    'sendTask' |
    'receiveTask' |
    'userTask' |
    'manualTask' |
    'businessRuleTask' |
    'scriptTask' |
    'subProcess' |
    'callActivity' |
    'startEvent' |
    'intermediateThrowEvent' |
    'intermediateCatchEvent' |
    'boundaryEvent' |
    'endEvent' |
    'gateway' |
    'parallelGateway' |
    'inclusiveGateway' |
    'complexGateway' |
    'eventBasedGateway' |
    'exclusiveGateway' |
    'sequenceFlow' |
    'messageFlow' |
    'dataObject' |
    'textAnnotation' |
    'association' |
    'dataStoreReference';


export type ShapeName =
    'Activity' |
    'Event' |
    'Gateway' |
    'DataObject' |
    'DataAssociation' |
    'Flow' |
    'Annotation' |
    'AnnotationLink' |
    'Group' |
    'HeaderedPool' |
    'HeaderedHorizontalPool' |
    'HeaderedVerticalPool' |
    "HorizontalSwimlane" |
    "VerticalSwimlane" |
    'DataStore';

export interface ImportOptions {
    bpmn2Shapes: {
        [name in ShapeName]: new (attributes?: any, opt?: any) => dia.Cell
    };
    cellFactories?: {
        [element in DecisiveElements]?: (xmlNode: Element, xmlDoc: XMLDocument, shapeClass: typeof dia.Cell, defaultFactory: DefaultFactory) => dia.Cell | null
    };
    embedCell?: (parent: dia.Cell, child: dia.Cell) => void;
    useLegacyPool?: boolean;
    convertXMLId?: (id: string) => void;
}

export interface ImportResult {
    cells: dia.Cell[];
    errors: string[];
}

export function fromBPMN(
    xmlDoc: XMLDocument,
    options: ImportOptions
): ImportResult;

export function findExtensionElements(xmlElement: Element): Element[];
