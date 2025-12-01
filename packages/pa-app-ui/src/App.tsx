import React, { ReactElement } from 'react';

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
