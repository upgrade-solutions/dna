import { dia, shapes } from '@joint/plus';
import { Node } from './types';
export declare function makeElement(node: Node, parent: Node, index: number): dia.Element<dia.Element.Attributes, dia.ModelSetOptions>;
export declare function makeRouterElement(id: dia.Cell.ID, label: string): shapes.standard.Cylinder<dia.ModelSetOptions>;
export declare function makeDeviceElement(id: dia.Cell.ID, label: string): shapes.standard.Rectangle;
export declare function makeVirtualElement(id: dia.Cell.ID, label: string): shapes.standard.Rectangle;
export declare function makeCloudElement(id: dia.Cell.ID, label: string): shapes.standard.Path;
export declare function makeComputerElement(id: dia.Cell.ID, label: string): shapes.standard.BorderedImage;
export declare function makeLineElement(id: dia.Cell.ID, label: string): shapes.standard.Rectangle;
export declare function makeLink(parentElement: dia.Element, childElement: dia.Element, { direction, style }: {
    direction?: string;
    style?: string;
}): shapes.standard.Link;
export declare function makeBoundaryElement(id: dia.Cell.ID, label: string): shapes.standard.Rectangle;
export declare function getLabelHeight(label: string): number;
export declare function getElementBBox(element: dia.Element): import("@joint/plus").g.Rect;
