
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
                {'value': 'removeEdge', 'text': 'Remove this relation'},
                {'value': 'modifyEdge', 'text': 'Modify this relation'}
            ],
            'node': [
                {'value': 'removeNode', 'text': 'Remove this concept'}
            ],
            'addNodeMode':[
                {'value':'confirmNodeAddition','text':'Confirm concept addition'}
            ],
            'default':[
                {'value': 'toggleAddNodeMode', 'text': 'Add new concept'},
                {'value': 'toggleAddEdgeMode', 'text': 'Add new relation'}
            ]
        };

        this.contextMenuSize = {
            'default':{'`eight':null,
                    'width':null,
                    'margin':0.15,
                    'scaled':false},
        };
    }    

    showMenu (event, context) {

        let items = [];
        if(this.networkState.addNodeMode){
            items = items.concat(this.contextItems['addNodeMode']);
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
        if(this.networkState.addNodeMode){
            let index = -1;
            for(let i = 0; i < items.length; i++){
                if(items[i].value === 'toggleAddEdgeMode'){
                    index = i;
                    break;
                }
            }
            items.splice(index,1);
        }else if(this.networkState.addEdgeMode){
            let index = -1;
            for(let i = 0; i < items.length; i++){
                if(items[i].value === 'toggleAddNodeMode'){
                    index = i;
                    break;
                }
            }
            items.splice(index,1);
        }
        
        d3.select('.context-menu').remove();
        this.scaleItems(items);
        
        var size = this.contextMenuSize["default"];       
        var width = size.width;
        var height = size.height;
        var margin = size.margin;

        var container = document.getElementById('networkContainer');
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
        var contextMenu = d3.select('#networkContainer')
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
        
        var menuEntry = d3.selectAll('.menu-entry')
            .attr('x', x)
            .attr('y', function(d, i){ return y + (i * height); })
            .attr('width', width + 'px')
            .attr('height', height + 'px')
            .style('padding-left','4px')
            .style('padding-right', '4px')
            .style('padding-top', '2px')
            .style('padding-bottom', '2px')
            .style('background-color', 'rgb(244,244,244)')
            .style('stroke', 'white')
            .style('stroke-width', '1px')
            .text((d) => { 
                if(d.value === "toggleAddNodeMode") {
                    if(this.networkState.addNodeMode){
                        return 'Cancel concept addition';
                    }else{
                        return 'Add new concept';
                    }
                } else if(d.value === "toggleAddEdgeMode") {
                    if(this.networkState.addEdgeMode){
                        return 'Cancel relation addition';
                    }else{
                        return 'Add new relation';
                    }
                }              
                return d.text; 
            })
            .style('color', 'steelblue')
            .style('font-size', '19px');

        // Remove context menu upon click
        d3.select('body')
            .on('click', function() {
                d3.select('.context-menu').remove();
            });
    }
    
    // Automatically set width, height, and margin;
    scaleItems(items) {
        if(!this.contextMenuSize['default']['scaled']){
            let tempContextMenu = d3.select('#networkContainer')
                                    .append('svg')
                                    .append('g')
                                    .selectAll('.tempContextMenu')
                                    .data(items)
                                    .enter()
                                    .append('text')
                                    .attr('x', -1000)
                                    .attr('y', -1000)
                                    .attr('class', 'tempContextMenu')
                                    .text(function(d){ return d.text; });

            // tempContextMenu.style(this.style.text);
                            
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
            d3.select('#networkContainer')
                .select('svg')
                .remove();                        
        }
    }
    
    ContextMenuAction(context, option){
        let that = this;
        switch(option) {
            case 'confirmNodeAddition':
                if(that.conceptMap.selectedNodes.length < 2){
                    displayWarning("At least two nodes must be selected to add new concept","");
                }else{
                    that.conceptMap.addNode();
                }
                break;

            case 'toggleAddNodeMode':
                if(this.networkState.addNodeMode){
                    that.conceptMap.setAddNodeMode(false);
                } else {
                    that.conceptMap.setAddNodeMode(true);
                }
                break;

            case 'toggleAddEdgeMode':
                if(this.networkState.addEdgeMode){
                    that.conceptMap.setAddEdgeMode(false);
                } else {
                    that.conceptMap.setAddEdgeMode(true);
                }
                break;

            case 'removeNode':
                this.network.selectNodes([context]);
                this.network.deleteSelected();
                this.newNodes.remove(context);
                break;

            case 'removeEdge':
                this.network.selectEdges([context]);
                this.network.deleteSelected();
                this.newEdges.remove(context);
                break;

            case 'modifyEdge':
                var data = this.newEdges.get(context);
                var callback = (d) => {
                    that.edges.update(d);
                    that.newEdges.update(d);
                }
                that.conceptMap.editEdge(data, callback);
                break;

            default:
                break;
        }    
    }
}
