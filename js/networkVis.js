

var network = null;
var nodes = null;
let edges = null;

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

    var data = d;

    // create an array with nodes
    nodes = new vis.DataSet(data.nodes);

    // create an array with edges
    edges = new vis.DataSet(data.edges);

    // subscribe to any change in the DataSet
    edges.on('*', function (event, properties, senderId) {
      console.log('event', event, properties);
    });


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
                addNode: function (data, callback) {
                    // filling in the popup DOM elements
                    console.log('add', data);
                },
                editNode: function (data, callback) {
                    // filling in the popup DOM elements
                    console.log('edit', data);
                },
                addEdge: function (data, callback) {
                    console.log('add edge', data);
                    if (data.from == data.to) {
                        var r = confirm("Do you want to connect the node to itself?");
                        if (r === true) {
                            callback(data);
                        }
                    } 
                    else {
                        callback(data);
                    }
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


// // create an array with nodes
// var nodes = new vis.DataSet([
//   {id: '1a', label: 'Node 1'},
//   {id: '2b', label: 'Node 2'},
//   {id: '3c', label: 'Node 3'},
//   {id: '4d', label: 'Node 4'},
//   {id: '5e', label: 'Node 5'}
// ]);

// // create an array with edges
// var edges = new vis.DataSet([
//   {from: '1a', to: '3c', label:'abc'},
//   {from: '1a', to: '2b', label:'bcd'},
//   {from: '2b', to: '4d'},
//   {from: '2b', to: '5e'},
//   {from: '3c', to: '3c'}
// ]);

function objectToArray(obj) {
    return Object.keys(obj).map(function (key) {
      obj[key].id = key;
      return obj[key];
    });
}

