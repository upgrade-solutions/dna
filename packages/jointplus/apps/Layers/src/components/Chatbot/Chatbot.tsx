import React, { ReactElement, useCallback, useEffect, useRef, useState } from 'react';
import { Subscription } from 'rxjs';

import './Chatbot.scss';
import JointPlusService from '../../services/joint-plus.service';
import JsonEditor from './JsonEditor/JsonEditor';
import Inspector from './Inspector/Inspector';
import EventBusServiceContext from '../../services/event-bus-service.context';
import { EventBusService } from '../../services/event-bus.service';
import { SharedEvents } from '../../joint-plus/controller';
import { importGraphFromJSON, loadStencilShapes, zoomToFit } from '../../joint-plus/actions';
import { STENCIL_WIDTH } from '../../theme';
import { useLayersContext } from '../../services/layers.context';
import LayersPanel from '../LayersPanel/LayersPanel';

import exampleGraphJSON from '../../joint-plus/config/example-graph.json';

interface ChatbotProps {
    layers?: any[];
}

const ChatbotCore = ({ layers = [] }: ChatbotProps): ReactElement => {

    const elementRef = useRef(null);
    const toolbarRef = useRef(null);
    const stencilRef = useRef(null);
    const paperRef = useRef(null);

    const [joint, setJoint] = useState(null);
    const [eventBusService] = useState(new EventBusService());
    const [stencilOpened, setStencilOpened] = useState(true);
    const [jsonEditorOpened, setJsonEditorOpened] = useState(false);
    const [fileJSON, setFileJSON] = useState(null);
    const [subscriptions] = useState(new Subscription());

    const openFile = useCallback((json: Object): void => {
        setFileJSON(json);
        importGraphFromJSON(joint, json);
        zoomToFit(joint);
    }, [joint]);

    const onStart = useCallback((): void => {
        loadStencilShapes(joint);
        openFile(exampleGraphJSON);
    }, [joint, openFile]);

    const onJsonEditorChange = useCallback((json: Object): void => {
        if (joint) {
            importGraphFromJSON(joint, json);
        }
    }, [joint]);

    const onJointGraphChange = useCallback((json: Object): void => {
        setFileJSON(json);
    }, []);

    const onStencilToggle = useCallback((): void => {
        if (!joint) {
            return;
        }
        const { scroller, stencil } = joint;
        if (stencilOpened) {
            stencil.unfreeze();
            scroller.el.scrollLeft += STENCIL_WIDTH;
        } else {
            stencil.freeze();
            scroller.el.scrollLeft -= STENCIL_WIDTH;
        }
    }, [joint, stencilOpened]);

    const toggleJsonEditor = (): void => {
        setJsonEditorOpened(!jsonEditorOpened);
    };

    const toggleStencil = (): void => {
        setStencilOpened(!stencilOpened);
    };

    useEffect((): void => {
        onStencilToggle();
    }, [stencilOpened, onStencilToggle]);

    const setStencilContainerSize = useCallback((): void => {
        stencilRef.current.style.width = `${STENCIL_WIDTH}px`;
    }, []);

    useEffect(() => {
        subscriptions.add(
            eventBusService.subscribe(SharedEvents.GRAPH_CHANGED, (json: Object) => onJointGraphChange(json))
        );
        subscriptions.add(
            eventBusService.subscribe(SharedEvents.JSON_EDITOR_CHANGED, (json: Object) => onJsonEditorChange(json))
        );
    }, [eventBusService, subscriptions, onJointGraphChange, onJsonEditorChange]);

    useEffect(() => {
        setJoint(new JointPlusService(
            elementRef.current,
            paperRef.current,
            stencilRef.current,
            toolbarRef.current,
            eventBusService
        ));
    }, [eventBusService]);

    useEffect(() => {
        if (!joint) {
            return;
        }
        setStencilContainerSize();
        onStart();
    }, [joint, onStart, setStencilContainerSize]);

    useEffect(() => {
        if (!joint) {
            return;
        }
        return () => {
            subscriptions.unsubscribe();
            joint.destroy();
        };
    }, [joint, subscriptions]);

    // Handle layer visibility changes
    useEffect(() => {
        if (!joint) return;
        const portsLayer = layers.find(layer => layer.id === 'ports');
        if (portsLayer) {
            joint.setPortsVisibility(portsLayer.visible);
        }
        const connectionsLayer = layers.find(layer => layer.id === 'connections');
        if (connectionsLayer) {
            joint.setConnectionsVisibility(connectionsLayer.visible);
        }
        const nodeIconsLayer = layers.find(layer => layer.id === 'node-icons');
        if (nodeIconsLayer) {
            joint.setNodeIconsVisibility(nodeIconsLayer.visible);
        }
    }, [joint, layers]);

    return (
        <EventBusServiceContext.Provider value={eventBusService}>
            <div ref={elementRef} className="joint-scope chatbot">
                <div ref={toolbarRef}/>
                <div className="side-bar">
                    <div className="toggle-bar">
                        <div onClick={toggleStencil}
                             className={'icon toggle-stencil ' + (!stencilOpened ? 'disabled-icon' : '')}
                             data-tooltip="Toggle Element Palette"
                             data-tooltip-position-selector=".toggle-bar"/>
                        <div onClick={toggleJsonEditor}
                             className={'icon toggle-editor ' + (!jsonEditorOpened ? 'disabled-icon' : '')}
                             data-tooltip="Toggle JSON Editor"
                             data-tooltip-position-selector=".toggle-bar"/>
                    </div>
                    <div ref={stencilRef}
                         style={{ display: stencilOpened ? 'initial' : 'none' }}
                         className="stencil-container"/>
                </div>
                <div className="main-container">
                    <div ref={paperRef} className="paper-container"/>
                    <div style={{ display: jsonEditorOpened ? 'initial' : 'none' }}>
                        <JsonEditor content={fileJSON}/>
                    </div>
                </div>
                <Inspector/>
                <LayersPanel/>
            </div>
        </EventBusServiceContext.Provider>
    );
};

// Wrapper component that uses the layers context
const Chatbot = (): ReactElement => {
    const { layers } = useLayersContext();
    return <ChatbotCore layers={layers} />;
};

export default Chatbot;
