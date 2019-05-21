
// Context info: node, depth, logic(AND or OR)

class ContextMenu {
    
    constructor(network, newEdges, networkState){

        this.network = network;
        this.newEdges = newEdges;
        this.networkState = networkState;
        this.marginRatio = 0.13;

        this.contextItems = {
            'edge': [{'value': 'removeEdge', 'text': 'Remove this edge'},
                    {'value': 'modifyEdge', 'text': 'Modify this edge'}
                    ],
            'default':[{'value': 'toggleAddEdgeMode', 'text': 'Add new edge'}]
        };

        this.contextMenuSize = {
            'default':{'height':null,
                    'width':null,
                    'margin':0.15,
                    'scaled':false},
        };
    }    

    showMenu (event, context) {
        var edgeID = context;
        var items = [];
        if(edgeID){
            // Iterate over the newly added edges
            var newlyAddedEdge = false;
            if(this.newEdges.get(edgeID)){
                newlyAddedEdge = true;
                items = this.contextItems["edge"];
            }
        }  
        items = items.concat(this.contextItems['default']);

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
                if(d.value === "toggleAddEdgeMode") {
                    if(this.networkState.addEdgeMode){
                        return 'Cancel edge addition';
                    }else{
                        return 'Add new edge';
                    }
                }           
                return d.text; 
            })
            .style('color', 'steelblue')
            .style('font-size', '13px');

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

        var edgeID = context;

        switch(option) {
            case 'toggleAddEdgeMode':
                if(this.networkState.addEdgeMode){
                    setAddEdgeMode(false);
                } else {
                    setAddEdgeMode(true);
                }
                break;

            case 'removeEdge':
                this.network.selectEdges([edgeID]);
                this.network.deleteSelected();
                this.newEdges.remove(edgeID);
                break;

            case 'modifyEdge':
                var data = this.newEdges.get(edgeID);
                var callback = (d) => {
                    edges.update(d);
                    newEdges.update(d);
                }
                editEdge(data, callback);
                break;

            default:
                break;
        }    
    }
}
