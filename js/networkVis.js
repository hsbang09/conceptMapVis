EDGE_LABEL_FONT_SIZE = 14;

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
                            'CH4, CO, CO2, O3, CFCs/HFCs, NOx-NO, NO2-, N2O5, HNO3, etc.',
                            'Atmospheric humidity, wind speed & direction, air temperature at surface, etc.',
                            'Aerosol height, optical depth, shape, composition, scattering properties, etc.',
                            'Cloud top height, cloud droplet size, cloud cover, cloud ice, etc.',
                            'Ocean color - Chlorophyll absorption and fluorescence, pigments, phytoplankton, etc.',
                            'Sea level height, sea surface temperature, surface currents, wave height, etc.',
                            'Soil moisture',
                            'Glacier surface elevation, sea ice thinkness, snow cover, snow depth. etc.',
                            'Vegetation type and structure, leaf area index, canopy density',
                            'Topography',
                            'Land use, land cover status'
                            ];

var SPECTRAL_REGION = ['VNIR','UV','SWIR','MW','LWIR'];
var SPECTRAL_REGION_DESCRIPTION = ['Visible and near-infrared','Ultraviolet','Short-wave infrared','Microwave','Long-wave infrared'];

var ILLUMINATION_CONDITION = ['active', 'passive'];
var INSTRUMENT_POWER = ['highPower', 'lowPower'];

var ORBITS = ['LEO-600-polar', 'SSO-600-AM', 'SSO-600-DD', 'SSO-800-DD', 'SSO-800-PM'];
var ORBIT_DESCRIPTION = ['LEO with polar inclination at 600km altitude', 
                            'SSO with morning LTAN at 600km altitude',
                            'SSO with dawn-dusk LTAN at 600km altitude',
                            'SSO with dawn-dusk LTAN at 800km altitude',
                            'SSO with afternoon LTAN at 600km altitude'];

var ALTITUDES = ['600km', '800km'];
var LTAN = ['AM', 'PM', 'dawn-dusk'];
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
    constructor(filename, seed){
        let that = this;

        if(typeof seed === "undefined"){
            seed = 596436;
        }
        this.seed = seed;
        this.data = null;
        this.network = null;
        this.nodes = null;
        this.edges = null;
        this.newNodes = new vis.DataSet([]);
        this.newEdges = new vis.DataSet([]);

        this.contextMenu = null;
        this.contextMenuEventListener = null;
        this.networkState = {addEdgeMode: false};
        this.selectedNodes = [];

        this.userGeneratedConceptGroup = GROUPS.length;

        $.getJSON(filename, (d) => {
            this.data = d;

            for(let i = 0; i < this.data.nodes.length; i++){
                let node = this.data.nodes[i];
                let label = node.label;
                let groupIndex = -1;
                for(let j = 0; j < GROUPS.length; j++){
                    let thisGroup = GROUPS[j];
                    if(thisGroup.indexOf(label) != -1){
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
                }

                if(description){
                    node.title = description;
                }
            }

            // create a network
            let container = document.getElementById('networkContainer');

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
                        font: {
                            size: 0
                        },
                    }, 
                    interaction:{
                        hover:true
                    },
                    manipulation: {
                        enabled: false,
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

            this.network = new vis.Network(container, inputData, options);

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
                                    edgeToUpdate.font.size = EDGE_LABEL_FONT_SIZE;

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
                                    that.edges.update({id:edgeIds[i], font:{size: EDGE_LABEL_FONT_SIZE}});
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
            container.addEventListener('contextmenu', this.contextMenuEventListener, false);
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
            labelInput = '<input type="text">';

        }else{
            labelInput = '<input type="text" value="'+ initialLabel +'">';
        }
        
        let buttonStyle = "width: 80px;" 
                        + "margin-left: 10px"
                        + "margin-right: 10px"
                        + "float: left;";

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
                [labelInput, 'change', function (instance, toast, select, event) {}],
            ],
            buttons: [
                ['<button id="iziToast_button_confirm" style="'+ buttonStyle +'"><b>Confirm</b></button>', function (instance, toast, button, event, inputs) {
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
        let edgeData = {id: this.generateRandomUniqueID(), from: node1, to: node2, font: {size: EDGE_LABEL_FONT_SIZE}};
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

        
        let buttonStyle = "width: 80px;" 
                        + "margin-left: 10px"
                        + "margin-right: 10px"
                        + "float: left;";

        let inputFieldStyle = "margin-left: 10px"
                        + "margin-right: 10px";

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
                    .style('margin-left','10px')
                    .style('margin-right','10px')
                    .attr('type','text')
                    .on('change', ()=>{
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
                        PubSub.publish(EXPERIMENT_TUTORIAL_EVENT, "new_edge_defined_other");
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
            let container = document.getElementById('networkContainer');
            let offset = 6;
            // let x = container.offsetLeft + offset;
            // let y = container.offsetTop + offset;
            d3.select('#networkContainer')
                .append('div')
                .attr('id', 'networkEditModeDisplay')
                .style('left', offset + 'px')
                .style('top', offset +'px')
                .style('position', 'absolute')
                .text('AddRelationMode: define a new relation by selecting two nodes')
                .style('color', 'green')
                .style('font-size','24px');

            d3.select('#networkContainer')
                .style('border-color','#0E8E1C')
                .style('border-width','2.5px');

            // EXPERIMENT
            PubSub.publish(EXPERIMENT_TUTORIAL_EVENT, "set_add_edge_mode");

        }else{
            this.selectedNodes = [];
            this.network.selectNodes([]);
            this.networkState.addEdgeMode = false;
            d3.select('#networkEditModeDisplay').remove();
            d3.select('#networkContainer')
                .style('border-color','#000000')
                .style('border-width','0.8px');
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
