/*! JointJS+ v4.1.1 - HTML5 Diagramming Framework - TRIAL VERSION

Copyright (c) 2025 client IO

 2025-11-10 


This Source Code Form is subject to the terms of the JointJS+ Trial License
, v. 2.0. If a copy of the JointJS+ License was not distributed with this
file, You can obtain one at https://www.jointjs.com/license
 or from the JointJS+ archive as was distributed by client IO. See the LICENSE file.*/


import { dia, shapes } from '@joint/plus';

export type DefaultFactory = () => exportableObjects.ExportableObject;

export type BPMN2Types =
    "bpmn2.Activity" |
    "bpmn2.Event" |
    "bpmn2.Gateway" |
    "bpmn2.DataObject" |
    "bpmn2.DataAssociation" |
    "bpmn2.Flow" |
    "bpmn2.Annotation" |
    "bpmn2.AnnotationLink" |
    "bpmn2.Group" |
    "bpmn2.Pool" |
    "bpmn2.HeaderedPool" |
    "bpmn2.HorizontalPool" |
    "bpmn2.VerticalPool" |
    "bpmn2.HeaderedHorizontalPool" |
    "bpmn2.HeaderedVerticalPool" |
    "bpmn2.DataStore";

export interface IIdentifierFactory {
    generateXMLId(type: string): string;
    getCellXMLId(cell: dia.Cell): string;
}

export class IdentifierFactory implements IIdentifierFactory {
    counters: Map<string, number>;

    constructor();

    generateXMLId(type: string): string;

    getCellXMLId(cell: dia.Cell): string;
}

export interface ExportOptions {
    exportableObjectFactories: {
        [type in BPMN2Types]?: (cellView: dia.CellView, defaultFactory: DefaultFactory) => exportableObjects.ExportableObject | null;
    } | {
        [type: string]: (cellView: dia.CellView) => exportableObjects.ExportableObject | null;
    };
    targetNamespace?: string;
    identifierFactory?: IIdentifierFactory;
}

export interface ExportResult {
    xml: XMLDocument;
}

export namespace exportableObjects {

    abstract class ExportableObject {
        constructor(cellView: dia.CellView);

        // injected after constructor call in toBPMN() function
        identifierFactory: IIdentifierFactory;

        cell: dia.Cell;
        cellView: dia.CellView;

        // runs during toBPMN() function
        init(): void;

        protected setUpShapeXMLElement(shapeXMLElement: Element): void;

        protected getLabelNode(): SVGElement;

        protected getLabelText(): string;

        protected getBounds(): dia.BBox;

        protected defineExtensionElements(): Element[];

        static sortElement(element: Element, order: string[]): void;
    }

    abstract class AbstractFlow extends ExportableObject {
        constructor(cellView: dia.LinkView);

        declare cell: dia.Link;
        declare cellView: dia.LinkView;

        toEdgeXMLElement(): Element;

        protected getLabelText(): string;
    }

    class Activity extends ExportableObject {
        constructor(cellView: dia.CellView, type?: string, markers?: string[], label?: string);

        type: string;
        markers: string[];
        label: string | null;

        toTaskXMLElement(): Element;

        toShapeXMLElement(): Element;

        isSubProcess(): boolean;

        protected getMarkers(): string[];
    }

    class Flow extends AbstractFlow {
        constructor(cellView: dia.LinkView, label?: string, type?: string);

        label: string | null;
        type: string | null;

        toFlowXMLElement(): Element;

        protected getType(): string;
    }

    interface EventDefinition {
        type: string;
        marker: string;
        interrupting: boolean;
    }
    class Event extends ExportableObject {
        constructor(cellView: dia.CellView, type?: string, marker?: string, interrupting?: boolean, label?: string);

        type: string;
        marker: string | null;
        interrupting: boolean | null;
        label: string | null;

        toEventXMLElement(): Element;

        toShapeXMLElement(): Element;

        protected getEventDefinition(): EventDefinition;

        protected isBoundaryEvent(): boolean;
    }

    class Gateway extends ExportableObject {
        constructor(cellView: dia.CellView, type?: string, label?: string);

        type: string | null;
        label: string | null;

        toGatewayXMLElement(): Element;

        toShapeXMLElement(): Element;

        protected getType(): string;
    }

    class DataAssociation extends AbstractFlow {
    }

    class Annotation extends ExportableObject {
        constructor(cellView: dia.CellView, text?: string);

        text: string | null;

        toTextAnnotationXMLElement(): Element;

        toShapeXMLElement(): Element;

        getText(): string;
    }

    class AnnotationLink extends AbstractFlow {
        toAssociationXMLElement(): Element;
    }

    class Group extends ExportableObject {
        constructor(cellView: dia.CellView, label?: string);

        label: string | null;

        toCategoryXMLElement(): Element;

        toGroupXMLElement(): Element;

        toShapeXMLElement(): Element;
    }

    interface Lane {
        id: string;
        fullyQualifiedId: string;
        label: string | null;
        sublanes: Lane[];
        bbox: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
    }

    type Orientation = "horizontal" | "vertical";

    abstract class AbstractPool extends ExportableObject {
        constructor(cellView: dia.CellView, lanes?: Lane[], header?: string, orientation?: Orientation);

        header: string | null;
        lanes: Lane[];
        orientation: Orientation;

        toProcessXMLElement(processId: string): Element;

        toParticipantXMLElement(processId: string): Element;

        toShapeXMLElements(): DocumentFragment;

        protected abstract getOrientation(): Orientation;

        protected abstract getHeader(): string;

        protected abstract getLanes(): Lane[];

        protected abstract getLaneIdByCell(cell: dia.Cell): string | null;
    }

    class Pool extends AbstractPool {
        declare cell: shapes.bpmn2.Pool;

        protected getOrientation(): Orientation;
        protected getHeader(): any;
        protected getLanes(): Lane[];
        protected getLaneIdByCell(cell: dia.Cell): string | null;
    }

    class CompositePool extends AbstractPool {
        declare cell: shapes.bpmn2.CompositePool;

        protected getOrientation(): Orientation;
        protected getHeader(): any;
        protected getLanes(): Lane[];
        protected getLaneIdByCell(cell: dia.Cell): string | null;
    }

    class HorizontalPool extends CompositePool {
        cell: shapes.bpmn2.HeaderedHorizontalPool;
    }

    class VerticalPool extends CompositePool {
        cell: shapes.bpmn2.HeaderedVerticalPool;
    }

    class DataObject extends ExportableObject {
        constructor(cellView: dia.CellView, label?: string, collection?: boolean);

        label: string | null;
        collection: boolean;

        toDataObjectXMLElement(): Element;

        toDataObjectReferenceXMLElement(): Element;

        toShapeXMLElement(): Element;

        isCollection(): boolean;
    }

    class DataStore extends ExportableObject {
        constructor(cellView: dia.CellView, label?: string);

        label: string | null;

        toDataStoreXMLElement(): Element;

        toDataStoreReferenceXMLElement(): Element;

        toShapeXMLElement(): Element;
    }
}

export function toBPMN(
    paper: dia.Paper,
    options?: ExportOptions
): ExportResult;

export function createExtensionElement(type: string): Element;
