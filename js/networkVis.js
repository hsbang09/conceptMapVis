
var data = null;
var network = null;
var nodes = null;
var edges = null;
var newEdges = new vis.DataSet([]);

let instruments = ['OCE_SPEC', 'AERO_POL','SAR_ALTIM', 'VEG_INSAR', 'CPR_RAD', 'HYP_IMAG', 'OCE_SPEC',
                                'HIRES_SOUND', 'VEG_LID', 'CHEM_SWIRSPEC', 'HYP_ERB', 'AERO_LID', 'CHEM_UVSPEC'];
let instrumentTypes = ['radar', 'lidar', 'imager'];
let measurements = ['topography', 'atmosphericChem', 'oceanColor', 'cloud', 'atmHumidity', 'landCover', 
                    'soilMoisture', 'radiationBudget', 'vegetation', 'aerosol', 'seaSurfaceCurrent']
let spectralRegion = ['VNIR', ''];
let illuminationCondition = ['active, passive'];
let instrumentPower = ['highPower', 'lowPower'];
let orbits = ['LEO-600-polar', 'SSO-600-AM', 'SSO-600-DD', 'SSO-800-DD', 'SSO-800-PM'];
let altitudes = ['600km', '800km'];
let LTAN = ['AM', 'PM', 'dawn-dusk'];
let orbitTypes = ['sun-synchronousOrbit', 'polarOrbit'];

let groups = [instruments, instrumentTypes, measurements, spectralRegion, illuminationCondition, instrumentPower,
                orbits, altitudes, LTAN, orbitTypes];

var contextMenu = null;
var networkState = {addEdgeMode: false}

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
    var container = document.getElementById('networkContainer');

    var options = {
            edges:{
                color: {
                    color: '#848484',
                    inherit: false,
                },
                width: 1.2,
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

    var inputData = {
                        nodes: nodes,
                        edges: edges
                    };

    network = new vis.Network(container, inputData, options);

    // Add new context menu
    container.addEventListener('contextmenu', (e) => {
        var coord = {x: e.layerX, y: e.layerY}
        var nodeID = network.getNodeAt(coord);
        var edgeID = network.getEdgeAt(coord);
        if(nodeID){  
            // this.selectNodes([nodeID]);
        }else if(edgeID){
            network.selectEdges([edgeID]);
        }

        contextMenu = new ContextMenu(network, newEdges, networkState);
        contextMenu.showMenu(e, edgeID);
        e.preventDefault()
    }, false);
});

function objectToArray(obj) {
    return Object.keys(obj).map(function (key) {
      obj[key].id = key;
      return obj[key];
    });
}

function editEdge(data, callback){

    var addingNewEdge = true;
    var initialWeight = null;
    var initialConnectionType = null;
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

    var title;
    if(addingNewEdge){
        title = "Adding a new link between " + getNodeLabel(data.from) + " and " + getNodeLabel(data.to) + "\n";
    }else{
        title = "Modifying the link between " + getNodeLabel(data.from) + " and " + getNodeLabel(data.to) + "\n";
    }

    var linkTypeInput, weightInput;
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
    
    var buttonStyle = "width: 80px;" 
                    + "margin-left: 10px"
                    + "margin-right: 10px"
                    + "float: left;";

    var inputCallback = function(){
        var inputs = d3.selectAll(".iziToast-inputs-child.revealIn").nodes();
        var connectionType = inputs[0].value;
        var weight = inputs[1].value;

        var confirmButton = d3.select("#iziToast_button_confirm");
        if(connectionType !== "select" && weight !== "" && parseInt(weight) >= 0 && parseInt(weight) <= 100){
            // Activate confirm button                    
            confirmButton.node().disabled = false;
            confirmButton.select('b').style("opacity", "1.0");
        } else {
            var confirmButton = d3.select("#iziToast_button_confirm");
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
                var connectionType = inputs[0].options[inputs[0].selectedIndex].value;
                var weight = inputs[1].value;
                data.label = connectionType + " (" + weight + ")";
                data.weight = weight;

                if(connectionType === "hasSynergyWith"){
                    data.color = { color: '#25CF37',
                                    highlight: '#25CF37'};
                }else if(connectionType === "mustAvoid"){
                    data.color = { color: '#FF2222',
                                    highlight: '#FF2222'};
                }
                data.width = ((weight / 100) * 6) + 1; // max: 8, min: 1

                if(addingNewEdge){
                    newEdges.add(data);
                }
                callback(data);
                this.networkState.addEdgeMode = false;
            }, false], // true to focus

            ['<button id="iziToast_button_cancel" style="'+ buttonStyle +'">Cancel</button>', function (instance, toast, button, e) {
                instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');
                network.disableEditMode();
                this.networkState.addEdgeMode = false;
            }]
        ],
    });
}

function getNodeLabel(nodeID){
    var nodeData = data.nodes;
    for(var i = 0; i < nodeData.length; i++){
        if(nodeData[i].id === nodeID){
            return nodeData[i].label;
        }
    }
    return null;
}

