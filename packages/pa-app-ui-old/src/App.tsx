import React, { ReactElement } from '../$node_modules/@types/react/index.js';

import Layers from './components/Layers/Layers';
import { APIExample } from './components/ExampleFetch';

const App = (): ReactElement => {
    return (
        <>
            {/* <APIExample /> */}
            <Layers />
        </>
    );
};

export default App;
