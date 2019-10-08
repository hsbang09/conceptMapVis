
var ABSTRACT_CONCEPTS = ["Orbit", "Instrument"];

var INSTRUMENTS = ['OCE_SPEC','AERO_POL', 'AERO_LID', 'HYP_ERB', 'CPR_RAD', 'VEG_INSAR', 
                'VEG_LID', 'CHEM_UVSPEC', 'CHEM_SWIRSPEC', 'HYP_IMAG','HIRES_SOUND','SAR_ALTIM'];
var INSTRUMENT_DESCRIPTION = ['Ocean color spectrometer',
                            'Aerosol polarimeter',
                            'Differential absorption lidar',
                            'Short-wave / long-wave radiation budget',
                            'Cloud and precipitation radar',
                            'Polarimetric L-band SAR',
                            'Vegetation/ice green lidar',
                            'UV/VIS limb spectrometer',
                            'SWIR nadir spectrometer',
                            'SWIR-TIR hyperspectral imager',
                            'High resolution IR sounder',
                            'Wide-swath radar altimeter'];

var INSTRUMENT_TYPES = ['radar', 'lidar', 'imager'];

var MEASUREMENTS = ['radiationBudget', 'atmosphericChem', 'atmosphericProp', 'aerosol', 'cloud', 'oceanColor', 'seaSurfaceProp', 
                    'soilMoisture', 'glacierAndIce', 'vegetation', 'topography', 'landCover'];
var MEASUREMENT_DESCRIPTION = [
                            'Downward long-wave irradiance at Earth surface, upward long-wave irradiance, etc.',
                            'Atmospheric chemistry: CH4, CO, CO2, O3, CFCs/HFCs, NOx-NO, NO2-, N2O5, HNO3, etc.',
                            'Atmospheric properties: Atmospheric humidity, wind speed & direction, air temperature at surface, etc.',
                            'Aerosol height, optical depth, shape, composition, scattering properties, etc.',
                            'Cloud top height, cloud droplet size, cloud cover, cloud ice, etc.',
                            'Ocean color - Chlorophyll absorption and fluorescence, pigments, phytoplankton, etc.',
                            'Sear surface properties: Sea level height, sea surface temperature, surface currents, wave height, etc.',
                            'Soil moisture',
                            'Glacier surface elevation, sea ice thinkness, snow cover, snow depth. etc.',
                            'Vegetation type and structure, leaf area index, canopy density',
                            'Topography',
                            'Land use, land cover status'
                            ];

var SPECTRAL_REGION = ['VNIR','UV','SWIR','MW','LWIR'];
var SPECTRAL_REGION_DESCRIPTION = ['Visible and near-infrared','Ultraviolet','Short-wave infrared','Microwave','Long-wave infrared'];

var ILLUMINATION_CONDITION = ['active', 'passive'];
var ILLUMINATION_CONDITION_DESCRIPTION = ['Has its own light source', 
                                            'Does NOT have its own light source'];

var INSTRUMENT_POWER = ['highPower', 'lowPower'];
var INSTRUMENT_POWER_DESCRIPTION = ['Required power more than 350W',
                                    'Required power less than 350W'];

var ORBITS = ['LEO-600-polar', 'SSO-600-AM', 'SSO-600-DD', 'SSO-800-DD', 'SSO-800-PM'];
var ORBIT_DESCRIPTION = ['LEO with polar inclination at 600km altitude', 
                            'SSO with morning LTAN at 600km altitude',
                            'SSO with dawn-dusk LTAN at 600km altitude',
                            'SSO with dawn-dusk LTAN at 800km altitude',
                            'SSO with afternoon LTAN at 600km altitude'];

var ALTITUDES = ['600km', '800km'];
var ALTITUDES_DESCRIPTION = ['Altitude of 600km',
                            'Altitude of 800km']

var LTAN = ['AM', 'PM', 'dawn-dusk'];
var LTAN_DESCRIPTION = ['Local Time of the Ascending Node is AM',
                        'Local Time of the Ascending Node is PM',
                        'Local Time of the Ascending Node is dawn or dusk'];

var ORBIT_TYPES = ['sun-synchronousOrbit', 'polarOrbit'];


var GROUPS = [
    ABSTRACT_CONCEPTS, 
    INSTRUMENTS, 
    INSTRUMENT_TYPES, 
    MEASUREMENTS, 
    SPECTRAL_REGION, 
    ILLUMINATION_CONDITION, 
    INSTRUMENT_POWER,
    ORBITS, 
    ALTITUDES, 
    LTAN, 
    ORBIT_TYPES
];
var GROUP_LABELS = [
    "abstractConcepts", 
    "instruments", 
    "instrumentTypes", 
    "measurements", 
    "spectralRegion", 
    "illuminationCondition", 
    "instrumentPower",
    "orbits", 
    "altitudes", 
    "LTAN", 
    "orbitTypes"
];

var instrumentProperties = [INSTRUMENT_TYPES, MEASUREMENTS, SPECTRAL_REGION, ILLUMINATION_CONDITION, INSTRUMENT_POWER];
var orbitProperties = [ALTITUDES, LTAN, ORBIT_TYPES];

var LINK_LABELS = {
    abstractConcepts: {
        instruments: "is a class of",
        orbits: "is a class of"
    },
    instruments: {
        abstractConcepts: "is an instance of",
        instrumentTypes: "is an instance of",
        measurements: "measures",
        spectralRegion: "operates in",
        illuminationCondition: "has illumination type",
        instrumentPower: "requires",
    },
    instrumentTypes: {
        instruments: "is a class of",
    }, 
    measurements: {
        instruments: "is measured by",
    }, 
    spectralRegion: {
        instruments: "is the spectral region of",
    },
    illuminationCondition: {
        instruments: "is the illumination type",
    }, 
    instrumentPower: {
        instruments: "is required by",
    },
    orbits: {
        abstractConcepts: "is an instance of",
        altitudes: "has altitude of", 
        LTAN: "has LTAN of", 
        orbitTypes: "is an instance of",
    }, 
    altitudes: {
        orbits: "is the altitude of",
    }, 
    LTAN: {
        orbits: "is the LTAN of",
    }, 
    orbitTypes: {
        orbits: "is a class of"
    }
};

class ConceptMap{
    constructor(filename, seed, cmapContainerID){
        let that = this;

        if(typeof seed === "undefined"){
            seed = 408450;
        }
        this.seed = seed;
        this.data = null;
        this.network = null;
        this.nodes = null;
        this.edges = null;
        this.newNodes = new vis.DataSet([]);
        this.newEdges = new vis.DataSet([]);

        if(!cmapContainerID){
            this.cmapContainerID = "cMapNetworkContainer";
        } else {
            this.cmapContainerID = cmapContainerID;
        }

        this.contextMenu = null;
        this.contextMenuEventListener = null;
        this.networkState = {addEdgeMode: false};
        this.selectedNodes = [];

        // Get container
        this.container = document.getElementById(this.cmapContainerID);

        let containerWidth = this.container.clientWidth;
        let containerHeight = this.container.clientHeight;
        this.edge_label_font_size = this.container.clientHeight / 42.64;

        // EXPERIMENT
        this.experimentTutorial_iziToastButtons_disabled = false;
        PubSub.subscribe(EXPERIMENT_TUTORIAL_EVENT, function(msg, data){
            if(data === "enable_iziToast_buttons"){
                that.experimentTutorial_iziToastButtons_disabled = false;

            }else if(data === "disable_iziToast_buttons"){
                that.experimentTutorial_iziToastButtons_disabled = true;
            }
        });

        this.userGeneratedConceptGroup = GROUPS.length;

        $.getJSON(filename, (d) => {
            this.data = d;

            for(let i = 0; i < this.data.nodes.length; i++){
                let node = this.data.nodes[i];
                let label = node.label;
                let groupIndex = -1;
                for(let j = 0; j < GROUPS.length; j++){
                    let thisGroup = GROUPS[j];
                    if(thisGroup.indexOf(label) !== -1){
                        groupIndex = j;
                        break;
                    }
                }
                node.group = groupIndex;

                let description = null;
                if(INSTRUMENTS.indexOf(label) !== -1){
                    let index = INSTRUMENTS.indexOf(label);
                    description = INSTRUMENT_DESCRIPTION[index];

                } else if(ORBITS.indexOf(label) !== -1){
                    let index = ORBITS.indexOf(label);
                    description = ORBIT_DESCRIPTION[index];

                } else if(SPECTRAL_REGION.indexOf(label) !== -1){
                    let index = SPECTRAL_REGION.indexOf(label);
                    description = SPECTRAL_REGION_DESCRIPTION[index];

                } else if(MEASUREMENTS.indexOf(label) !== -1){
                    let index = MEASUREMENTS.indexOf(label);
                    description = MEASUREMENT_DESCRIPTION[index];

                } else if(ILLUMINATION_CONDITION.indexOf(label) !== -1){
                    let index = ILLUMINATION_CONDITION.indexOf(label);
                    description = ILLUMINATION_CONDITION_DESCRIPTION[index];
                
                } else if(INSTRUMENT_POWER.indexOf(label) !== -1){
                    let index = INSTRUMENT_POWER.indexOf(label);
                    description = INSTRUMENT_POWER_DESCRIPTION[index];
                
                } else if(LTAN.indexOf(label) !== -1){
                    let index = LTAN.indexOf(label);
                    description = LTAN_DESCRIPTION[index];
                
                } else if(ALTITUDES.indexOf(label) !== -1){
                    let index = ALTITUDES.indexOf(label);
                    description = ALTITUDES_DESCRIPTION[index];
                
                }

                if(description){
                    node.title = description;
                }
            }

            // create a network
            let options = {
                    layout: {
                        randomSeed: that.seed,
                    },
                    edges:{
                        color: {
                            color: '#848484',
                            inherit: false,
                        },
                        width: 1.2,
                        selectionWidth: 5.8,
                        hoverWidth: 5.8,
                        font: {
                            size: 0
                        },
                    }, 
                    nodes:{
                        borderWidthSelected: 10,
                        labelHighlightBold: true,
                    },
                    interaction:{
                        hover:true
                    },
                    manipulation: {
                        enabled: false,
                    },
                    physics: {
                        barnesHut: {
                          avoidOverlap: 0.3,
                          damping: 0.25,
                        }
                    }
                };

            // create an array with nodes
            this.nodes = new vis.DataSet(this.data.nodes);

            // create an array with edges
            this.edges = new vis.DataSet(this.data.edges);

            let inputData = {
                                nodes: this.nodes,
                                edges: this.edges
                            };

            this.network = new vis.Network(this.container, inputData, options);

            let mouseInteractionCallback = (params) => {
                let isDraggingEvent = false;
                if(params.event.type === "panstart"){
                    isDraggingEvent = true;
                }else if(params.event.type === "tap"){
                    isDraggingEvent = false;
                }

                let nodeID = that.network.getNodeAt(params.pointer.DOM);

                if(nodeID){ // A node is selected
                    if(!that.networkState.addEdgeMode){
                        that.selectedNodes = [nodeID];

                        // Display the labels of all edges connected to the selected node if the event is not dragging
                        if(!isDraggingEvent){
                            let nodeLabel = that.nodes._data[nodeID].label;
                            let edgeIds = that.edges.getIds();
                            for(let i = 0; i < edgeIds.length; i++){
                                let edgeToUpdate = {id: edgeIds[i], font: {}};

                                if(params.edges.indexOf(edgeIds[i]) !== -1){ // The edge is connected to the selected node
                                    let edge = that.edges._data[edgeIds[i]];
                                    let otherNodeID;
                                    let originalEdgeLabel = edge.label;
                                    if(edge.from === nodeID){
                                        otherNodeID = edge.to;
                                    }else if(edge.to === nodeID){
                                        otherNodeID = edge.from;
                                    }

                                    if(originalEdgeLabel.indexOf("positive") !== -1 || originalEdgeLabel.indexOf("negative") !== -1){
                                        // pass
                                    }else if(otherNodeID){
                                        let otherNodeLabel = that.nodes._data[otherNodeID].label;
                                        let linkLabel = this.getLinkLabel(nodeLabel, otherNodeLabel);
                                        if(linkLabel){
                                            edgeToUpdate.label = linkLabel;
                                        }
                                    }
                                    edgeToUpdate.font.size = this.edge_label_font_size;

                                }else{
                                    // For all edges not connected to the selected node, set font size to 0
                                    edgeToUpdate.font.size = 0;
                                }
                                that.edges.update(edgeToUpdate);
                            }
                        }

                    } else if(that.networkState.addEdgeMode){
                        if(that.selectedNodes.indexOf(nodeID) === -1){
                            if(that.selectedNodes.length > 1){              
                                displayWarning("Cannot select more than two concepts to dfine a new relation.", "");

                            } else if(that.selectedNodes.length === 1) {
                                that.selectedNodes.push(nodeID); 
                                that.addNewEdge(that.selectedNodes[0], that.selectedNodes[1]);

                            } else{
                                that.selectedNodes.push(nodeID); 
                                that.network.selectNodes(that.selectedNodes);
                            }
                        }
                    }

                } else {
                    if(!isDraggingEvent){
                        // De-select all nodes
                        that.selectedNodes = [];
                        that.network.unselectAll();

                        let edgeID = that.network.getEdgeAt(params.pointer.DOM);

                        // Set the font size of all edges to 0, except for the selected edge (if there's any)
                        let edgeIds = Object.keys(conceptMap.edges._data);
                        for(let i = 0; i < edgeIds.length; i++){
                            if(edgeID){
                                if(edgeIds[i] === edgeID){
                                    that.edges.update({id:edgeIds[i], font:{size: that.edge_label_font_size}});
                                    continue;
                                }
                            }
                            that.edges.update({id:edgeIds[i], font:{size:0}});
                        }
                    }
                }
            }

            that.network.on("click", mouseInteractionCallback, false);
            that.network.on("dragStart", mouseInteractionCallback, false);

            this.contextMenuEventListener = function(e) {
                let coord = {x: e.layerX, y: e.layerY}
                let nodeID = that.network.getNodeAt(coord);
                let edgeID = that.network.getEdgeAt(coord);
                let context = null;
                if(nodeID){  
                    that.network.selectNodes([nodeID]);
                    context = nodeID;
                }else if(edgeID){
                    that.network.selectEdges([edgeID]);
                    context = edgeID;
                }
                that.contextMenu = new ContextMenu(that);
                that.contextMenu.showMenu(e, context);
                e.preventDefault()
            }

            // Add new context menu
            this.container.addEventListener('contextmenu', this.contextMenuEventListener, false);

            this.displayGroupColorLegend();
        });
    }

    generateRandomUniqueID(){
        let out = "";
        for(let i = 0; i < 20; i++){
            out += "" + Math.floor(Math.random() * 10);
        }
        return out;
    }

    addNewNode(){
        // EXPERIMENT
        PubSub.publish(EXPERIMENT_TUTORIAL_EVENT, "add_new_node");

        let nodeData = {id: this.generateRandomUniqueID(),
                    group: this.userGeneratedConceptGroup,
                    userDefined: true};

        this.setNodeProperties(nodeData);
    }

    setNodeProperties(data){
        let that = this;
        let addingNewNode = true;
        let initialLabel = null;

        if(typeof data.label !== "undefined"){
            addingNewNode = false;
            initialLabel = data.label;
        }

        let title;
        if(addingNewNode){
            title = "Adding a new node";
        }else{
            title = "Modifying the node " + initialLabel;
        }

        let labelInput;
        if(addingNewNode){
            labelInput = '<input id="new_concept_label_input" type="text">';

        }else{
            labelInput = '<input id="new_concept_label_input" type="text" value="'+ initialLabel +'">';
        }
        
        let buttonStyle = "width: "+ this.container.clientHeight / 7.46 +"px;" 
                        + "margin-left: "+ this.container.clientHeight / 59.7 +"px"
                        + "margin-right: "+ this.container.clientHeight / 59.7 +"px"
                        + "float: left;";

        let inputCallback = function(){
            let labelInputValue = d3.select("#new_concept_label_input").node().value;
            let validInput = true;

            if(labelInputValue === "" || labelInputValue === null){
                validInput = false;
            }

            // EXPERIMENT
            if(that.experimentTutorial_iziToastButtons_disabled){
                validInput = false;
            }

            let confirmButton = d3.select("#iziToast_button_confirm");
            if(validInput){
                // Activate confirm button                    
                confirmButton.node().disabled = false;
                confirmButton.select('b').style("opacity", "1.0");

            } else {
                let confirmButton = d3.select("#iziToast_button_confirm");
                confirmButton.node().disabled = true;
                confirmButton.select('b').style("opacity", "0.05");
            }
        }

        iziToast.destroy();
        iziToast.question({
            drag: false,
            timeout: false,
            close: false,
            overlay: true,
            displayMode: 0,
            id: 'question',
            progressBar: false,
            title: title,
            message: 'Please type in the name of the new concept.',
            position: 'center',
            inputs: [
                [labelInput, 'keyup', function (instance, toast, select, event) {
                    inputCallback();
                }],
            ],
            buttons: [
                ['<button id="iziToast_button_confirm" disabled style="'+ buttonStyle +'"><b style="opacity: 0.05">Confirm</b></button>', function (instance, toast, button, event, inputs) {
                    instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');
                    data.label = inputs[0].value;

                    if(addingNewNode){
                        that.nodes.add(data);
                        that.newNodes.add(data);

                        // EXPERIMENT
                        PubSub.publish(EXPERIMENT_TUTORIAL_EVENT, "new_node_added");

                    }else{
                        that.nodes.update(data);
                        that.newNodes.update(data);
                    }
                }, false], // true to focus

                ['<button id="iziToast_button_cancel" style="'+ buttonStyle +'">Cancel</button>', function (instance, toast, button, e) {
                    instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');
                }]
            ],
            onOpened: ()=> {},
        });
    }

    addNewEdge(node1, node2){
        let edgeData = {id: this.generateRandomUniqueID(), from: node1, to: node2, font: {size: this.edge_label_font_size}};
        this.setEdgeProperties(edgeData);
    }

    setEdgeProperties(data){
        let that = this;

        let addingNewEdge = true;
        let initialWeight = null;
        let initialConnectionType = null;
        let initialConnectionName = null;

        if(typeof data.label !== "undefined"){
            addingNewEdge = false;
            initialConnectionType = data.label.split("(")[0].trim();

            if(initialConnectionType.indexOf("negative") === -1 && initialConnectionType.indexOf("positive") === -1){
                initialConnectionName = initialConnectionType;
            }
        
            if(data.weight){
                initialWeight = data.weight;
            }
        }

        let title;
        if(addingNewEdge){
            title = "Adding a new relation between " + this.getNodeLabel(data.from) + " and " + this.getNodeLabel(data.to) + "\n";
        }else{
            title = "Modifying the relation between " + this.getNodeLabel(data.from) + " and " + this.getNodeLabel(data.to) + "\n";
        }

        let connectionTypeSelectID = "relation_input_type";
        let connectionTypeOtherID = "relation_input_type_other";
        let connectionWeightID = "relation_input_weight";
        
        let buttonStyle = "width: "+ this.container.clientHeight / 7.46 + "px;" 
                        + "margin-left: "+ this.container.clientHeight / 59.7 + "px"
                        + "margin-right: "+ this.container.clientHeight / 59.7 + "px"
                        + "float: left;";

        let inputFieldStyle = "margin-left: "+ this.container.clientHeight / 59.7 + "px"
                        + "margin-right: "+ this.container.clientHeight / 59.7 + "px";

        let linkTypeInput, weightInput;
        if(addingNewEdge){
            linkTypeInput = '<select id="'+ connectionTypeSelectID +'">'
                                + '<option value="select"> Select </option>'
                                + '<option value="positive"> positive </option>'
                                + '<option value="negative"> negative </option>'
                                + '<option value="other"> other (type in the name) </option>'
                            + '</select>';
            weightInput = '<input style="'+ inputFieldStyle +'" id="'+ connectionWeightID +'" type="number">';

        }else{
            if(initialConnectionType === "positive"){
                linkTypeInput = '<select id="'+ connectionTypeSelectID +'">'
                                + '<option value="positive" selected> positive </option>'
                                + '<option value="negative"> negative </option>'
                                + '<option value="other"> other (type in the name) </option>'
                            + '</select>';
            }else if(initialConnectionType === "negative"){
                linkTypeInput = '<select id="'+ connectionTypeSelectID +'">'
                                + '<option value="positive"> positive </option>'
                                + '<option value="negative" selected> negative </option>'
                                + '<option value="other"> other (type in the name) </option>'
                            + '</select>';
            }else{
                linkTypeInput = '<select id="'+ connectionTypeSelectID +'">'
                                + '<option value="positive"> positive </option>'
                                + '<option value="negative"> negative </option>'
                                + '<option value="other" selected> other (type in the name) </option>'
                            + '</select>';
                linkTypeInput = linkTypeInput + '<input style="'+ inputFieldStyle +'" id="'+ connectionTypeOtherID +'" type="text" value="'+ initialConnectionName +'">';
            }
            weightInput = '<input style="'+ inputFieldStyle +'" id="'+ connectionWeightID +'" type="number" value="'+ initialWeight +'">';
        }

        let inputCallback = function(){
            let connectionType = d3.select('#'+connectionTypeSelectID).node().value;
            let connectionName = null;
            let connectionNameInputAbsent = true;
            if(d3.select('#'+connectionTypeOtherID).node()){
                connectionNameInputAbsent = false;
                connectionName = d3.select('#'+connectionTypeOtherID).node().value;
            }
            let connectionWeight = d3.select('#'+connectionWeightID).node().value;

            if(connectionType === "other" && connectionNameInputAbsent){
                d3.select('.iziToast-inputs')
                    .insert('input', 'select + *')
                    .attr('id', connectionTypeOtherID)
                    .style('margin-left', that.container.clientHeight / 59.7 + "px")
                    .style('margin-right', that.container.clientHeight / 59.7 + "px")
                    .attr('type','text')
                    .on('keyup', ()=>{
                        inputCallback();
                    });

            }else if(connectionType !== "other"){
                d3.select('#relation_input_type_other').remove();
            }

            let validInput = true;
            if(connectionType === "select"){
                validInput = false;
            }

            if(connectionWeight === "" || parseInt(connectionWeight) < 0 || parseInt(connectionWeight) > 100){
                validInput = false;
            }

            if(connectionType === "other"){
                if(!connectionName){
                    validInput = false;
                }
            }

            // EXPERIMENT
            if(that.experimentTutorial_iziToastButtons_disabled){
                validInput = false;
            }

            let confirmButton = d3.select("#iziToast_button_confirm");
            if(validInput){
                // Activate confirm button                    
                confirmButton.node().disabled = false;
                confirmButton.select('b').style("opacity", "1.0");

            } else {
                let confirmButton = d3.select("#iziToast_button_confirm");
                confirmButton.node().disabled = true;
                confirmButton.select('b').style("opacity", "0.05");
            }
        }

        iziToast.destroy();
        iziToast.question({
            drag: false,
            timeout: false,
            close: false,
            overlay: true,
            displayMode: 0,
            id: 'question',
            progressBar: false,
            title: title,
            message: 'Please set the relation type and the corresponding weight (0-100)',
            position: 'center',
            inputs: [
                [linkTypeInput, 'change', function (instance, toast, select, event) {
                    inputCallback();
                }],
                [weightInput, 'keyup', function (instance, toast, input, event) {
                    inputCallback();
                }],
            ],
            buttons: [
                ['<button id="iziToast_button_confirm" disabled style="'+ buttonStyle +'"><b style="opacity: 0.05">Confirm</b></button>', function (instance, toast, button, event, inputs) {
                    instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');

                    let connectionType = d3.select('#'+connectionTypeSelectID).node().value;
                    let connectionName = null;
                    if(d3.select('#'+connectionTypeOtherID).node()){
                        connectionName = d3.select('#'+connectionTypeOtherID).node().value;
                    }
                    let connectionWeight = d3.select('#'+connectionWeightID).node().value;

                    if(connectionName){
                        data.label = connectionName + " (" + connectionWeight + ")";
                        data.weight = connectionWeight;

                    }else{
                        data.label = connectionType + " (" + connectionWeight + ")";
                        data.weight = connectionWeight;
                    }
                    
                    if(connectionType === "positive"){
                        data.color = { color: '#25CF37',
                                        highlight: '#25CF37',
                                        hover: '#25CF37'};
                    }else if(connectionType === "negative"){
                        data.color = { color: '#FF2222',
                                        highlight: '#FF2222',
                                        hover: '#FF2222'};
                    }else if(connectionType === "other"){
                        data.color = { color: '#A825CF',
                                        highlight: '#A825CF',
                                        hover: '#A825CF'};
                    }
                    data.width = ((+connectionWeight / 100) * 7) + 1; // max: 8, min: 1

                    if(addingNewEdge){
                        that.edges.add(data);
                        that.newEdges.add(data);
                    }else{
                        that.edges.update(data);
                        that.newEdges.update(data);
                    }
                    that.setAddEdgeMode(false);

                    // EXPERIMENT
                    if(connectionType === "other"){
                        // PubSub.publish(EXPERIMENT_TUTORIAL_EVENT, "new_edge_defined_other");
                        PubSub.publish(EXPERIMENT_TUTORIAL_EVENT, "new_edge_defined");
                    }else{
                        PubSub.publish(EXPERIMENT_TUTORIAL_EVENT, "new_edge_defined");
                    }
                    
                }, false], // true to focus

                ['<button id="iziToast_button_cancel" style="'+ buttonStyle +'">Cancel</button>', function (instance, toast, button, e) {
                    instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');
                    that.setAddEdgeMode(false);
                }]
            ],
            onOpened: ()=> {
                // EXPERIMENT
                PubSub.publish(EXPERIMENT_TUTORIAL_EVENT, "new_edge_added");
            },
        });
    }

    setAddEdgeMode(flag){
        if(flag || typeof flag === 'undefined'){

            if(this.selectedNodes.length > 2){
                this.selectedNodes = [];
                this.network.selectNodes([]);
            } else if(this.selectedNodes.length === 2){
                this.addNewEdge(this.selectedNodes[0], this.selectedNodes[1]);
                return;
            } 

            this.networkState.addEdgeMode = true;

            let offset = this.container.clientHeight / 150;
            d3.select('#cMapNetworkContainer')
                .append('div')
                .attr('id', 'networkEditModeDisplay')
                .style('left', offset + 'px')
                .style('top', offset +'px')
                .style('position', 'absolute')
                .text('AddRelationMode: define a new relation by selecting two nodes')
                .style('color', 'green')
                .style('font-size','2.7vh');

            d3.select('#cMapNetworkContainer')
                .style('border-color','#0E8E1C')
                .style('border-width','0.65vh');

            // EXPERIMENT
            PubSub.publish(EXPERIMENT_TUTORIAL_EVENT, "set_add_edge_mode");

        }else{
            this.selectedNodes = [];
            this.network.selectNodes([]);
            this.networkState.addEdgeMode = false;
            d3.select('#networkEditModeDisplay').remove();
            d3.select('#cMapNetworkContainer')
                .style('border-color','lightgray')
                .style('border-width','0.35vh');
        }
    }

    getNodeLabel(nodeID){
        let out = null;
        this.nodes.forEach((d) => {
            if(d.id === nodeID){
                if(d.label){
                    out = d.label;
                }else if(d.title){
                    out = d.title;
                }else{
                    out = null;
                }
            }
        })
        return out;
    }

    getLinkLabel(fromConceptLabel, toConceptLabel){
        let fromGroup = this.getGroupLabel(fromConceptLabel);
        let toGroup = this.getGroupLabel(toConceptLabel);

        if(fromGroup === null || toGroup === null){
            return null;

        } else {
            if(Object.keys(LINK_LABELS).indexOf(fromGroup) !== -1){
                if(Object.keys(LINK_LABELS[fromGroup]).indexOf(toGroup) !== -1){
                    return LINK_LABELS[fromGroup][toGroup];
                }
            }
        }
        return null;
    }

    getGroupLabel(label){
        let groupIndex = null;
        for(let i = 0; i < GROUPS.length; i++){
            if(GROUPS[i].indexOf(label) !== -1){
                groupIndex = i;
            }
        }
        if(groupIndex !== null){
            return GROUP_LABELS[groupIndex];
        }
        return null;
    }

    isInGroup(label, testGroup){
        if(Array.isArray(testGroup[0])){
            for(let i = 0; i < testGroup.length; i++){
                if(this.isInGroup(label, testGroup[i])){
                    return true;
                }
            }
            return false;

        } else {
            return testGroup.indexOf(label) !== -1;
        }
    }

    displayGroupColorLegend(){
        let that = this;
        let usedGroupIDs = [];
        for(let key in this.nodes._data){
            let group = this.nodes._data[key].group;
            if(usedGroupIDs.indexOf(group) === -1){
                usedGroupIDs.push(group);
            }
        }

        let usedGroups = [];
        for(let i = 0; i < usedGroupIDs.length; i++){
            let groupID = usedGroupIDs[i];
            let label = GROUP_LABELS[groupID];
            let color = this.network.groups.groups[groupID].color.background;
            usedGroups.push({id:i, label: label, color: color});
        }
        
        let container = document.getElementById(this.cmapContainerID);
        let containerWidth = container.clientWidth;
        let containerHeight = container.clientHeight;

        let offset = containerHeight / 65;
        let legendFontSize = containerHeight / 41;
        let width = containerHeight / 3.7;
        let height = containerHeight / 2.6;
        // let containerLocX = + containerWidth - width - offset;
        let containerLocX = + offset;
        let containerLocY = + containerHeight - height - offset;
        let legendVerticalOffset = containerHeight / 30;
        let circleRadius = containerHeight / 99.5;

        let legendContainer = d3.select("#" + this.cmapContainerID)
            .append('div')
            .attr('id', 'groupColorLegendContainer')
            .style('left', containerLocX + 'px')
            .style('top', containerLocY +'px')
            .style('position', 'absolute');

        let svg = legendContainer.append('svg')
            .style('width', width + 'px')
            .style('height', height + 'px');

        let legendEnter = svg.selectAll('div')
                .data(usedGroups)
                .enter()
                .append('g')
                .attr('class', 'group_color_legend')
                .attr("transform", (d) => {
                    let y = + legendVerticalOffset * (d.id + 1);
                    let x = + circleRadius * 1.3;
                    return "translate(" + x + "," + y + ")";
                })
                .style('width', '100%')
                .style('height', legendVerticalOffset)
                .on("mouseover", (d) => {
                    that.showMemberInstancesDisplay(d.label);

                    d3.selectAll(".group_color_legend")
                        .filter(function(d2) { 
                            return d2.label === d.label; 
                        })
                        .select('text')
                        .style('fill', 'darkOrange');

                })
                .on("mouseout", (d) => {
                    that.removeMemberInstanceDisplay(d.label);

                    d3.selectAll(".group_color_legend")
                        .filter(function(d2) { 
                            return d2.label === d.label; 
                        })
                        .select('text')
                        .style('fill', 'black');

                })
                .on("click", (d) => {
                    that.selectSubclassConcepts(d.label);
                });

        legendEnter.append('circle')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', circleRadius)
            .style('fill', (d) => {
                return d.color;
            })

        legendEnter.append('text')
            .style('font-size', legendFontSize + "px")
            .attr('x', legendFontSize / 1.3)
            .attr('y', legendFontSize / 4.0)
            .text((d) => {
                return d.label;
            })
    }

    selectSubclassConcepts(groupName){
        let groupIndex = GROUP_LABELS.indexOf(groupName);
        let subclassConcepts = GROUPS[groupIndex];
        let nodesToSelect = [];
        for(let key in this.nodes._data){
            let node = this.nodes._data[key];
            let label = node.label;
            if(subclassConcepts.indexOf(label) !== -1){
                nodesToSelect.push(node.id);
            }   
        }
        this.network.selectNodes(nodesToSelect);
        this.removeMemberInstanceDisplay();
    }

    removeMemberInstanceDisplay(){
        d3.select("#tooltip_groupMemberInstances").remove();
    }

    showMemberInstancesDisplay(groupName){
        let groupIndex = GROUP_LABELS.indexOf(groupName);
        let subclassConcepts = GROUPS[groupIndex];

        // Get container
        this.container = document.getElementById(this.cmapContainerID);
        let tooltip_width = this.container.clientWidth / 2.96;
        let tooltip_height = this.container.clientHeight / 7.61;
        let font_size = tooltip_width / 40.64;

        if(groupName === "measurements" || groupName === "instruments" || groupName === "orbits"){
            tooltip_width = this.container.clientWidth / 3.2;
            tooltip_height = this.container.clientHeight / 7.21;
        }else{
            tooltip_width = this.container.clientWidth / 6.16;
            tooltip_height = this.container.clientHeight / 9.31;
        }

        let mouseLoc_x = d3.mouse(d3.select("#"+this.cmapContainerID).node())[0];
        let mouseLoc_y = d3.mouse(d3.select("#"+this.cmapContainerID).node())[1];
        let tooltip_location = {x:  mouseLoc_x + 40, 
                                y:  mouseLoc_y - 20 -  tooltip_height};

        let tooltipContainer = d3.select("#" + this.cmapContainerID)
            .append('div')
            .attr('id', 'tooltip_groupMemberInstances')
            .style('left', tooltip_location.x + 'px')
            .style('top', tooltip_location.y +'px')
            .style('position', 'absolute');

        let tooltipContainerDiv = tooltipContainer.append("div")
            .style("width", tooltip_width + "px")
            .style("height", tooltip_height + "px")
            .style("background-color","#D0D0D0")
            .style("padding", (tooltip_height / 9) + "px");

        tooltipContainerDiv
            .append("p")
            .text("[Member concepts]")
            .style("font-size",font_size + "px");

        tooltipContainerDiv
            .append("p")
            .text(()=> {
                return subclassConcepts.join(" | ");
            })
            .style("font-size",font_size + "px");
    }
}

function objectToArray(obj) {
        return Object.keys(obj).map(function (key) {
          obj[key].id = key;
          return obj[key];
        });
    }

function displayWarning(title, message){
    iziToast.warning({
        title: title,
        message: message,
    });
}
