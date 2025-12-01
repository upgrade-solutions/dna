import { useCallback, useEffect, useState } from '../../../../$node_modules/@types/react/index.js';
import { dia } from '../../../../$node_modules/@joint/plus/index.ts';

interface Props {
    cell: dia.Cell;
    assignFormFields: Function;
}

export const useBaseInspector = (props: Props): Function => {

    const { cell, assignFormFields } = props;

    const [context] = useState({ id: cell.id });

    const addCellListener = useCallback((): void => {
        cell.on('change', () => assignFormFields(), context);
    }, [cell, assignFormFields, context]);

    const removeCellListener = useCallback((): void => {
        cell.off(null, null, context);
    }, [cell, context]);

    const changeCellProp = (path: dia.Path, value: any): void => {
        cell.prop(path, value);
    };

    useEffect(() => {
        addCellListener();
        assignFormFields();
        return () => {
            removeCellListener();
        };
    }, [assignFormFields, addCellListener, removeCellListener]);

    return changeCellProp;
};
