import React, { createContext, useContext, useState, ReactElement, ReactNode } from 'react';

export interface Layer {
    id: string;
    name: string;
    visible: boolean;
    icon?: string;
}

interface LayersContextType {
    layers: Layer[];
    toggleLayer: (layerId: string) => void;
    setLayerVisibility: (layerId: string, visible: boolean) => void;
}

const LayersContext = createContext<LayersContextType | undefined>(undefined);

const DEFAULT_LAYERS: Layer[] = [
    { id: 'nodes', name: 'Nodes', visible: true },
    { id: 'node-icons', name: 'Node Icons', visible: true },
    { id: 'ports', name: 'Ports', visible: true },
    { id: 'connections', name: 'Connections', visible: true }
];

interface LayersProviderProps {
    children: ReactNode;
}

export const LayersProvider = ({ children }: LayersProviderProps): ReactElement => {
    const [layers, setLayers] = useState<Layer[]>(DEFAULT_LAYERS);

    const toggleLayer = (layerId: string): void => {
        // Prevent toggling off the Nodes layer
        if (layerId === 'nodes') return;
        
        setLayers(prevLayers =>
            prevLayers.map(layer =>
                layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
            )
        );
    };

    const setLayerVisibility = (layerId: string, visible: boolean): void => {
        setLayers(prevLayers =>
            prevLayers.map(layer =>
                layer.id === layerId ? { ...layer, visible } : layer
            )
        );
    };

    return (
        <LayersContext.Provider value={{ layers, toggleLayer, setLayerVisibility }}>
            {children}
        </LayersContext.Provider>
    );
};

export const useLayersContext = (): LayersContextType => {
    const context = useContext(LayersContext);
    if (!context) {
        throw new Error('useLayersContext must be used within a LayersProvider');
    }
    return context;
};
