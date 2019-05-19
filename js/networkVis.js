
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

var contexMenu = null;

$.getJSON("visData/ClimateCentric-4.json", (d) => {

    data = d;

    // create an array with nodes
    nodes = new vis.DataSet(data.nodes);

    // create an array with edges
    edges = new vis.DataSet(data.edges);

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
                    addNewEdge(data, callback);
                }
            }
        };

    network = new vis.Network(container, data, options);

    network.on("oncontext", function (params) {
        var nodeID = this.getNodeAt(params.pointer.DOM);
        var edgeID = this.getEdgeAt(params.pointer.DOM);

        console.log(params);
        if(nodeID){  
            console.log("node");
            console.log(nodeID);
            this.selectNodes([nodeID]);
        }else if(edgeID){
            console.log("edge");
            console.log(edgeID);
            this.selectEdges([edgeID]);
        }        
    });
});


function addConnections(elem, index) {
    // need to replace this with a tree of the network, then get child direct children of the element
    elem.connections = network.getConnectedNodes(index);
}


var myNodes = null;

function parseNetwork(){

    var nodes = objectToArray(network.getPositions());

    nodes.forEach(addConnections);

    console.log(nodes);

    myNodes= nodes;
}

function objectToArray(obj) {
    return Object.keys(obj).map(function (key) {
      obj[key].id = key;
      return obj[key];
    });
}

function addNewEdge(data, callback){

    var title = "Adding a new link between " + getNodeLabel(data.from) + " and " + getNodeLabel(data.to) + "\n";

    var linkTypeInput = '<select>'
                            + '<option value="select"> Select </option>'
                            + '<option value="hasSynergyWith"> hasSynergyWith </option>'
                            + '<option value="mustAvoid"> mustAvoid </option>'
                        + '</select>'

    let buttonsStyle = "width: 150px;" +
                    "float: left;";

    var inputCallback = function(){
        var inputs = d3.selectAll(".iziToast-inputs-child.revealIn").nodes();
        var connectionType = inputs[0].value;
        var weight = inputs[1].value;

        var confirmButton = d3.select("#iziToast_button_confirm");
        if(connectionType !== "select" && weight !== ""){
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
        message: 'Please select the connection type and the corresponding weight',
        position: 'center',
        inputs: [
            [linkTypeInput, 'change', function (instance, toast, select, event) {
                inputCallback();
            }],
            ['<input type="number">', 'keyup', function (instance, toast, input, event) {
                inputCallback();
            }],
        ],
        buttons: [
            ['<button id="iziToast_button_confirm" disabled><b style="opacity: 0.05">Confirm</b></button>', function (instance, toast, button, event, inputs) {
                instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');
                var connectionType = inputs[0].options[inputs[0].selectedIndex].value;
                var weight = inputs[1].value;
                data.label = connectionType;
                data.weight = weight;
                newEdges.add(data);
                callback(data);

            }, false], // true to focus
            ['<button id="iziToast_button_cancel">Cancel</button>', function (instance, toast, button, e) {
                instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');
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

