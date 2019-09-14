
// Context info: node, depth, logic(AND or OR)

class ContextMenu {   
    constructor(conceptMap){
        this.conceptMap = conceptMap;
        this.network = conceptMap.network;
        this.nodes = conceptMap.nodes;
        this.edges = conceptMap.edges;
        this.newNodes = conceptMap.newNodes;
        this.newEdges = conceptMap.newEdges;
        this.networkState = conceptMap.networkState;

        this.marginRatio = 0.13;

        this.contextItems = {
            'edge': [
                {'value': 'removeEdge', 'text': 'Remove relation'},
                {'value': 'modifyEdge', 'text': 'Modify relation'}
            ],
            'node': [
                {'value': 'removeNode', 'text': 'Remove concept'},
                {'value': 'modifyNode', 'text': 'Modify concept'}
            ],
            'addEdgeMode':[
                {'value':'addSelfReferenceEdge','text':'Create self-reference relation'}
            ],
            'default':[
                {'value': 'addNewNode', 'text': 'Add new concept'},
                {'value': 'toggleAddEdgeMode', 'text': 'Add new relation'},
            ]
        };

        this.contextMenuSize = {
            'default': {'weight':null,
                    'width':null,
                    'margin':0.15,
                    'scaled':false},
        };
    }    

    removeItem(items, keyword){
        let index = -1;
        for(let i = 0; i < items.length; i++){
            if(items[i].value === keyword){
                index = i;
                break;
            }
        }
        if(index !== -1){
            items.splice(index,1);
        }
    }

    showMenu (event, context) {
        let items = [];
        if(this.networkState.addEdgeMode){
            items = items.concat(this.contextItems['addEdgeMode']);
        }

        let nodeID = null;
        let edgeID = null;
        this.nodes.forEach((d) => {
            if(d.id === context){
                nodeID = context;
            }
        })
        this.edges.forEach((d) => {
            if(d.id === context){
                edgeID = context;
            }
        })

        if(nodeID){
            // Iterate over the newly added nodes
            if(this.newNodes.get(nodeID)){
                items = items.concat(this.contextItems['node']);
            }
        } else if(edgeID){
            // Iterate over the newly added edges
            if(this.newEdges.get(edgeID)){
                items = items.concat(this.contextItems['edge']);
            }
        }  
        items = items.concat(this.contextItems['default']);

        // Remove illegal options
        if(this.networkState.addEdgeMode){
            this.removeItem(items, 'addNewNode');
            if(this.conceptMap.selectedNodes.length !== 1){
                this.removeItem(items, 'addSelfReferenceEdge');
            }
        }
        
        d3.select('.context-menu').remove();
        this.scaleItems(items);
        
        var size = this.contextMenuSize["default"];       
        var width = size.width;
        var height = size.height;
        var margin = size.margin;

        var container = document.getElementById(this.conceptMap.cmapContainerID);
        let clientHeight = container.clientHeight;
        var offsetLeft = container.offsetLeft;
        var offsetTop = container.offsetTop;
        var x = event.clientX - offsetLeft;
        var y = event.clientY - offsetTop;
        var menuOffsetX = 20;
        var menuOffsetY = 0;
        if(x >= container.clientWidth / 2){
            x = x - width + menuOffsetX;
        } else{
            x = x + menuOffsetX;
        }
        if(y >= container.clientHeight / 2){
            y = y + menuOffsetY;
        } else{
            y = y + menuOffsetY;
        }

        // Draw the menu
        var contextMenu = d3.select("#" + this.conceptMap.cmapContainerID)
                        .append('div')
                        .attr('class', 'context-menu')
                        .style('left', x + 'px')
                        .style('top', y +'px')
                        .style('position', 'absolute');

        contextMenu.selectAll('.menu-entry')
                        .data(items)
                        .enter()
                        .append('div')
                        .attr('class', 'menu-entry')
                        .style('cursor', 'pointer');

        d3.selectAll('.menu-entry')
            .on('mouseover', function(d){ 
                d3.select(this)            
                    .style('background-color', 'rgb(200,200,200)');
            })
            .on('mouseout', function(d){ 
                d3.select(this)            
                    .style('background-color', 'rgb(244,244,244)');
            })
            .on('click', (d) => {
                this.ContextMenuAction(context, d.value);
            });
        
        let menuEntry = d3.selectAll('.menu-entry')
            .attr('x', x)
            .attr('y', function(d, i){ return y + (i * height); })
            .attr('width', width + 'px')
            .attr('height', height + 'px')
            .style('padding-left', clientHeight / 99.5 + 'px')
            .style('padding-right', clientHeight / 59.7 + 'px')
            .style('padding-top', clientHeight / 149.25 + 'px')
            .style('padding-bottom', clientHeight / 149.25 + 'px')
            .style('background-color', 'rgb(244,244,244)')
            .style('stroke', 'white')
            .style('stroke-width', '1px')
            .text((d) => { 
                if(d.value === "toggleAddEdgeMode") {
                    if(this.networkState.addEdgeMode){
                        return 'Cancel adding new relation';
                    }else{
                        return 'Add new relation';
                    }
                }              
                return d.text; 
            })
            .style('color', 'steelblue')
            .style('font-size', clientHeight / 42.6 + "px");

        // Remove context menu upon click
        d3.select('body')
            .on('click', function() {
                d3.select('.context-menu').remove();
            });
    }
    
    // Automatically set width, height, and margin;
    scaleItems(items) {
        if(!this.contextMenuSize['default']['scaled']){
            let tempContextMenu = d3.select("#" + this.conceptMap.cmapContainerID)
                                    .append('svg')
                                    .attr('id', 'tempContextMenuSVG')
                                    .append('g')
                                    .selectAll('.tempContextMenu')
                                    .data(items)
                                    .enter()
                                    .append('text')
                                    .attr('x', -1000)
                                    .attr('y', -1000)
                                    .attr('class', 'tempContextMenu')
                                    .text(function(d){ return d.text; });
                            
            let z = d3.selectAll('.tempContextMenu')
                        .nodes()
                        .map((x) => { return x.getBBox(); });
            
            let width = d3.max(z.map(function(x){ return x.width; }));
            let margin = this.marginRatio * width;
            width =  width + 2 * margin;
            let height = d3.max(z.map(function(x){ return x.height + margin / 2; }));

            this.contextMenuSize['default']['width'] = width;
            this.contextMenuSize['default']['height'] = height;
            this.contextMenuSize['default']['margin'] = margin;
            this.contextMenuSize['default']['scaled'] = true;

            // cleanup
            d3.select("#" + this.conceptMap.cmapContainerID)
                .select('#tempContextMenuSVG')
                .remove();                        
        }
    }
    
    ContextMenuAction(context, option){
        let that = this;
        switch(option) {
            case 'addNewNode':
                that.conceptMap.addNewNode();
                break;

            case 'modifyNode':
                let nodeData = this.newNodes.get(context);
                that.conceptMap.setNodeProperties(nodeData);
                break;

            case 'removeNode':
                this.network.selectNodes([context]);
                this.network.deleteSelected();
                this.newNodes.remove(context);
                break;

            case 'toggleAddEdgeMode':
                if(this.networkState.addEdgeMode){
                    that.conceptMap.setAddEdgeMode(false);
                } else {
                    that.conceptMap.setAddEdgeMode(true);
                }
                break;

            case 'addSelfReferenceEdge':
                let node = that.conceptMap.selectedNodes[0];
                that.conceptMap.addNewEdge(node, node);
                break;

            case 'modifyEdge':
                let edgeData = this.newEdges.get(context);
                that.conceptMap.setEdgeProperties(edgeData);
                break;

            case 'removeEdge':
                this.network.selectEdges([context]);
                this.network.deleteSelected();
                this.newEdges.remove(context);
                break;
                
            default:
                break;
        }    
    }
}
