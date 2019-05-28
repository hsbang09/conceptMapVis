
var seed = 392258;
// let seed = undefined;

var data = null;
var network = null;
var nodes = null;
var edges = null;
var newNodes = new vis.DataSet([]);
var newEdges = new vis.DataSet([]);

var instruments = ['OCE_SPEC', 'AERO_POL','SAR_ALTIM', 'VEG_INSAR', 'CPR_RAD', 'HYP_IMAG', 'OCE_SPEC',
                                'HIRES_SOUND', 'VEG_LID', 'CHEM_SWIRSPEC', 'HYP_ERB', 'AERO_LID', 'CHEM_UVSPEC'];
var instrumentTypes = ['radar', 'lidar', 'imager'];
var measurements = ['topography', 'atmosphericChem', 'oceanColor', 'cloud', 'atmHumidity', 'landCover', 
                    'soilMoisture', 'radiationBudget', 'vegetation', 'aerosol', 'seaSurfaceCurrent']
var spectralRegion = ['VNIR'];
var illuminationCondition = ['active', 'passive'];
var instrumentPower = ['highPower', 'lowPower'];
var orbits = ['LEO-600-polar', 'SSO-600-AM', 'SSO-600-DD', 'SSO-800-DD', 'SSO-800-PM'];
var altitudes = ['600km', '800km'];
var LTAN = ['AM', 'PM', 'dawn-dusk'];
var orbitTypes = ['sun-synchronousOrbit', 'polarOrbit'];

var groups = [instruments, instrumentTypes, measurements, spectralRegion, illuminationCondition, instrumentPower,
                orbits, altitudes, LTAN, orbitTypes];

var instrumentProperties = {"is-a": instrumentTypes,
                            "measures": measurements,
                            "operates in": spectralRegion,
                            "has illumination condition": illuminationCondition,
                            "requires": instrumentPower};

var orbitProperties = {"has altitude": altitudes,
                        "has LTAN": LTAN,
                        "is-a": orbitTypes};

var contextMenu = null;
var contextMenuEventListener = null;
var networkState = {addNodeMode: false, addEdgeMode: false}
var selectedNodes = [];

$.getJSON("visData/ClimateCentric-4.json", (d) => {

    data = d;

    for(let i = 0; i < data.nodes.length; i++){
        let node = data.nodes[i];
        let label = node.label;
        let groupIndex = -1;
        for(let j = 0; j < groups.length; j++){
            let thisGroup = groups[j];
            if(thisGroup.indexOf(label) != -1){
                groupIndex = j;
                break;
            }
        }
        node.group = groupIndex;
    }

    // create a network
    let container = document.getElementById('networkContainer');

    let options = {
            layout: {
                randomSeed: seed,
            },
            edges:{
                color: {
                    color: '#848484',
                    inherit: false,
                },
                width: 1.2,
            }, 
            interaction:{
                hover:true
            },
            manipulation: {
                enabled: false,
                // addNode: function (data, callback) {
                //     // filling in the popup DOM elements
                //     console.log('add', data);
                // },
                // editNode: function (data, callback) {
                //     // filling in the popup DOM elements
                //     console.log('edit', data);
                // },
                addEdge: function (data, callback) {
                    editEdge(data, callback);
                }
            }
        };

    // create an array with nodes
    nodes = new vis.DataSet(data.nodes);

    // create an array with edges
    edges = new vis.DataSet(data.edges);

    let inputData = {
                        nodes: nodes,
                        edges: edges
                    };

    network = new vis.Network(container, inputData, options);

    nodeClickCallback = function(params) {
        let nodeID = network.getNodeAt(params.pointer.DOM);
        
        if(networkState.addNodeMode){
            network.unselectAll();
            if(nodeID){
                let nodeData = nodes.get(nodeID);
                let label = nodeData.label;
                let types = identifyTypeOfConcept(label);
                if(types){
                    let pass = true;
                    for(let i = 0; i < selectedNodes.length; i++){
                        previouslySelected = nodes.get(selectedNodes[i]);
                        let typesToCompare = identifyTypeOfConcept(previouslySelected.label);

                        if(nodeID === previouslySelected.id){
                            displayWarning("Already selected", "");
                            pass = false;
                            break;
                        }
                        if(types[0] !== typesToCompare[0]){
                            displayWarning("Orbit properties and instrument properties cannot be used together to define a new concept", "");
                            pass = false;
                            break;
                        }
                        if(["measures", "operates in"].indexOf(typesToCompare[1]) === -1){
                            if(types[1] === typesToCompare[1]){
                                displayWarning("This property is mutually exclusive with one of the properties already selected", "");
                                pass = false;
                                break;
                            }
                        }
                    }
                    if(pass){
                        selectedNodes.push(nodeID);   
                    }
                } else {
                    if(newNodes.get(nodeID)){
                        displayWarning("New node can only be defined using pre-existing concepts","");
                    }else{
                        displayWarning("A property node should be selected instead of a specific orbit/instrument instance to generate a new concept", "");
                    }
                }
                network.selectNodes(selectedNodes);
            }else{
                selectedNodes = [];
            }
        }
    }

    nodeDragCallBack = function(params){        
        if(networkState.addNodeMode){
            network.unselectAll();
            network.selectNodes(selectedNodes);
        }
    }

    contextMenuEventListener = function(e) {
        let coord = {x: e.layerX, y: e.layerY}
        let nodeID = network.getNodeAt(coord);
        let edgeID = network.getEdgeAt(coord);
        let context = null;
        if(nodeID){  
            network.selectNodes([nodeID]);
            context = nodeID;
        }else if(edgeID){
            network.selectEdges([edgeID]);
            context = edgeID;
        }
        contextMenu = new ContextMenu(network, nodes, edges, newNodes, newEdges, networkState);
        contextMenu.showMenu(e, context);
        e.preventDefault()
    }

    network.on("click", nodeClickCallback, false);
    network.on("dragStart", nodeDragCallBack, false);

    // Add new context menu
    container.addEventListener('contextmenu', contextMenuEventListener, false);

    setAddEdgeMode(false);
});

function identifyTypeOfConcept(conceptLabel){
    let propertyGroupConnector = null;
    let isOrbitProp = false;
    for(let prop in orbitProperties){
        for(let j = 0; j < orbitProperties[prop].length; j++){
            if(orbitProperties[prop][j] === conceptLabel){
                isOrbitProp = true;
                propertyGroupConnector = prop;
                break;
            }
        }
    }
    let isInstrumentProp = false;
    if(!isOrbitProp){
        for(let prop in instrumentProperties){
            for(let j = 0; j < instrumentProperties[prop].length; j++){
                if(instrumentProperties[prop][j] === conceptLabel){
                    isInstrumentProp = true;
                    propertyGroupConnector = prop;
                    break;
                }
            }
        }
    }

    if(!isOrbitProp && !isInstrumentProp){
        return null;
    }else{
        let out = [];
        if(isOrbitProp){
            out.push(0);
        }else{
            out.push(1);
        }
        out.push(propertyGroupConnector);
        return out;
    }
}

function objectToArray(obj) {
    return Object.keys(obj).map(function (key) {
      obj[key].id = key;
      return obj[key];
    });
}

function generateRandomUniqueID(){
    let out = "";
    for(let i = 0; i < 20; i++){
        out += "" + Math.floor(Math.random() * 10);
    }
    return out;
}

function addNode(){
    let nodeData = {id: null,
                group: null,
                label: null};

    let edgeDataList = [];

    let isOrbitProp = false;
    let newID = generateRandomUniqueID();
    let newLabel = "";
    for(let i = 0; i < selectedNodes.length; i++){
        let label = nodes.get(selectedNodes[i]).label;
        let types = identifyTypeOfConcept(label);
        let connector = types[1];
        if(i === 0){
            if(types[0] === 0){
                isOrbitProp = true;
                newLabel += "Orbit";
            }else{
                isOrbitProp = false;
                newLabel += "Instrument";
            }
            newLabel += " that ";
        }else{
            newLabel += " AND ";
        }
        newLabel +=  connector + " " + label;

        let edgeData = {id: generateRandomUniqueID(),
                        from: selectedNodes[i],
                        to: newID,
                        label: null};
        edgeDataList.push(edgeData);
    }

    nodeData.id = newID;
    if(isOrbitProp){
        nodeData.group = groups.length;
    }else{
        nodeData.group = groups.length + 1;
    }
    nodeData.title = newLabel;

    // Add new node
    nodes.add(nodeData);
    newNodes.add(nodeData);

    // Add edges connecting to the newly added node
    for(let i = 0; i < edgeDataList.length; i++){
        edges.add(edgeDataList[i]);
    }
    setAddNodeMode(false);
}

function editEdge(data, callback){
    let addingNewEdge = true;
    let initialWeight = null;
    let initialConnectionType = null;
    if(typeof data.label !== "undefined"){
        addingNewEdge = false;
        if(data.label.indexOf("hasSynergyWith") !== -1){
            initialConnectionType = "hasSynergyWith";
        }else if(data.label.indexOf("mustAvoid") !== -1){
            initialConnectionType = "mustAvoid";
        }

        if(data.weight){
            initialWeight = data.weight;
        }
    }

    let title;
    if(addingNewEdge){
        title = "Adding a new link between " + getNodeLabel(data.from) + " and " + getNodeLabel(data.to) + "\n";
    }else{
        title = "Modifying the link between " + getNodeLabel(data.from) + " and " + getNodeLabel(data.to) + "\n";
    }

    let linkTypeInput, weightInput;
    if(addingNewEdge){
        linkTypeInput = '<select>'
                            + '<option value="select"> Select </option>'
                            + '<option value="hasSynergyWith"> hasSynergyWith </option>'
                            + '<option value="mustAvoid"> mustAvoid </option>'
                        + '</select>';

        weightInput = '<input type="number">';
    }else{
        if(initialConnectionType === "hasSynergyWith"){
            linkTypeInput = '<select>'
                            + '<option value="hasSynergyWith" selected> hasSynergyWith </option>'
                            + '<option value="mustAvoid"> mustAvoid </option>'
                        + '</select>';
        }else if(initialConnectionType === "mustAvoid"){
            linkTypeInput = '<select>'
                            + '<option value="hasSynergyWith"> hasSynergyWith </option>'
                            + '<option value="mustAvoid" selected> mustAvoid </option>'
                        + '</select>';
        }
        weightInput = '<input type="number" value="'+ initialWeight +'">';
    }
    
    let buttonStyle = "width: 80px;" 
                    + "margin-left: 10px"
                    + "margin-right: 10px"
                    + "float: left;";

    let inputCallback = function(){
        let inputs = d3.selectAll(".iziToast-inputs-child.revealIn").nodes();
        let connectionType = inputs[0].value;
        let weight = inputs[1].value;

        let confirmButton = d3.select("#iziToast_button_confirm");
        if(connectionType !== "select" && weight !== "" && parseInt(weight) >= 0 && parseInt(weight) <= 100){
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
        message: 'Please select the connection type and the corresponding weight (0-100)',
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
                let connectionType = inputs[0].options[inputs[0].selectedIndex].value;
                let weight = inputs[1].value;
                data.label = connectionType + " (" + weight + ")";
                data.weight = weight;

                if(connectionType === "hasSynergyWith"){
                    data.color = { color: '#25CF37',
                                    highlight: '#25CF37',
                                    hover: '#25CF37'};
                }else if(connectionType === "mustAvoid"){
                    data.color = { color: '#FF2222',
                                    highlight: '#FF2222',
                                    hover: '#FF2222'};
                }
                data.width = ((weight / 100) * 7) + 1; // max: 8, min: 1

                if(addingNewEdge){
                    newEdges.add(data);
                }
                callback(data);
                setAddEdgeMode(false);
            }, false], // true to focus

            ['<button id="iziToast_button_cancel" style="'+ buttonStyle +'">Cancel</button>', function (instance, toast, button, e) {
                instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');
                network.disableEditMode();
                setAddEdgeMode(false);
            }]
        ],
    });
}

function setAddNodeMode(flag){
    selectedNodes = [];
    network.unselectAll();
    if(flag || typeof flag === 'undefined'){
        setAddEdgeMode(false);
        networkState.addNodeMode = true;
        let container = document.getElementById('networkContainer');
        let offset = 6;
        let x = container.offsetLeft + offset;
        let y = container.offsetTop + offset;
        d3.select('#networkContainer')
            .append('div')
            .attr('id', 'networkEditModeDisplay')
            .style('left', x + 'px')
            .style('top', y +'px')
            .style('position', 'absolute')
            .text('AddNodeMode: select multiple concept nodes to be combined')
            .style('color', 'blue');

        d3.select('#networkContainer')
            .style('border-color','#1F57BE')
            .style('border-width','2.5px');

    }else{
        network.disableEditMode();
        networkState.addNodeMode = false;
        d3.select('#networkEditModeDisplay').remove();

        d3.select('#networkContainer')
            .style('border-color','#000000')
            .style('border-width','0.8px');
    }
}

function setAddEdgeMode(flag){
    if(flag || typeof flag === 'undefined'){
        setAddNodeMode(false);
        network.addEdgeMode();
        networkState.addEdgeMode = true;
        let container = document.getElementById('networkContainer');
        let offset = 6;
        let x = container.offsetLeft + offset;
        let y = container.offsetTop + offset;
        d3.select('#networkContainer')
            .append('div')
            .attr('id', 'networkEditModeDisplay')
            .style('left', x + 'px')
            .style('top', y +'px')
            .style('position', 'absolute')
            .text('AddEdgeMode: make a new connection by dragging from one node to another node')
            .style('color', 'green');

        d3.select('#networkContainer')
            .style('border-color','#0E8E1C')
            .style('border-width','2.5px');

    }else{
        network.disableEditMode();
        networkState.addEdgeMode = false;
        d3.select('#networkEditModeDisplay').remove();

        d3.select('#networkContainer')
            .style('border-color','#000000')
            .style('border-width','0.8px');
    }
}

function displayWarning(title, message){
    iziToast.warning({
        title: title,
        message: message,
    });
}

function getNodeLabel(nodeID){
    var out = null;
    nodes.forEach((d) => {
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

