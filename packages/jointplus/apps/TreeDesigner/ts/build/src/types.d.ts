import type { dia } from '@joint/plus';
export interface TreeData {
    id: string;
    type?: string;
    label?: string;
    connections?: 'none' | 'parallel' | 'serial' | 'branch';
    connectionDirection?: 'none' | 'forward' | 'backward' | 'bidirectional';
    connectionStyle?: 'solid' | 'dashed' | 'dotted';
    children?: TreeData[];
    size?: number;
    hidden?: boolean;
    boundary?: boolean;
    boundaryLabel?: string;
    margin?: number;
}
export type Node = TreeData & dia.Element;
