import React, { ReactElement, useCallback, useState } from 'react';

import './LayersPanel.scss';
import { useLayersContext } from '../../services/layers.context';

const LayersPanel = (): ReactElement => {
    const { layers, toggleLayer } = useLayersContext();
    const [isOpen, setIsOpen] = useState(true);

    const handleLayerToggle = useCallback((layerId: string) => {
        toggleLayer(layerId);
    }, [toggleLayer]);

    const togglePanel = useCallback(() => {
        setIsOpen(prev => !prev);
    }, []);

    return (
        <div className={`layers-panel ${isOpen ? 'open' : 'closed'}`}>
            <div className="layers-panel-header">
                <span>Layers</span>
                <button 
                    className="layers-panel-toggle" 
                    onClick={togglePanel}
                    aria-label={isOpen ? 'Close layers panel' : 'Open layers panel'}
                >
                    {isOpen ? '−' : '+'}
                </button>
            </div>
            {isOpen && (
                <div className="layers-list">
                    {layers.map((layer) => (
                        <div key={layer.id} className="layer-item">
                            <input
                                type="checkbox"
                                id={`layer-${layer.id}`}
                                checked={layer.visible}
                                onChange={() => handleLayerToggle(layer.id)}
                                className="layer-checkbox"
                                disabled={layer.id === 'nodes'}
                            />
                            {layer.icon && (
                                <img 
                                    src={layer.icon} 
                                    alt="" 
                                    className="layer-icon"
                                />
                            )}
                            <label htmlFor={`layer-${layer.id}`} className="layer-label">
                                {layer.name}
                            </label>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LayersPanel;
