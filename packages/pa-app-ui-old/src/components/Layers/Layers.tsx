import React, { ReactElement } from '../../../$node_modules/@types/react/index.js';

import './Layers.scss';
import Chatbot from '../Chatbot/Chatbot';
import { LayersProvider } from '../../services/layers.context';

const Layers = (): ReactElement => {
    return (
        <LayersProvider>
            <div className="layers-app">
                <Chatbot />
            </div>
        </LayersProvider>
    );
};

export default Layers;
