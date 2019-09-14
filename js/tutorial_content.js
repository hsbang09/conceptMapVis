var TUTORIAL_CONTENT = null;

function loadTutorialContent(){
    TUTORIAL_CONTENT = [
    	{
            name: "tutorial-opening-1",
            object: null, 
            content: "<p>Before starting the main task, we are first going to measure the level of your prior knowledge "
                    +"in designing Earth-observing satellite missions. </p>", 
            onChangeCallback: null,
            onExitCallback: null,
    	},
    	{
            name: "tutorial-opening-2",
            object: document.getElementById("cMapNetworkContainer"), 
            content: "<p>You will record information using an interactive graph called concept map, which displays different concepts "
        			+"and their relationships related to Earth-observing satellite missions.</p>", 
            onChangeCallback: null,
            onExitCallback: null,
    	},
    	{
            name: "tutorial-opening-3",
            object: document.getElementById("cMapNetworkContainer"), 
            content: "<p>The vertices in this graph represent concepts related to orbits and instruments. "
        			+"The edges represent the relations that connect those concepts.</p>"
                    , 
            onChangeCallback: null,
            onExitCallback: null,
    	},
        {
            name: "tutorial-opening-3-color-legend",
            object: document.getElementById("groupColorLegendContainer"), 
            content: "<p>The color legend is provided here. Note that the color of each concept represents its type "
                    +"(e.g. type of measurement, spectral region, altitude of an orbit, etc.).</p>", 
            onChangeCallback: null,
            onExitCallback: null,
        },
    	{
            name: "tutorial-opening-4",
            object: document.getElementById("cMapNetworkContainer"), 
            content: "<p>You can move and highlight vertices by dragging and clicking the vertices.</p>"
        			+"<p>This makes it easier to view vertices and their connections when the graph is cluttered.</p>"
        			+"<p>You can also zoom in and zoom out using the mouse (or touch pad).</p>",
            onChangeCallback: null,
            onExitCallback: null,
    	},
    	{
            name: "tutorial-opening-5",
            object: document.getElementById("cMapNetworkContainer"), 
            content: "<p>Recording new information in a concept map can be done in two ways:</p> "
                    +"<ol><li>Adding new relations</li>"
                    +"<li>Adding new concepts</li></ol>"
                    +"<p>This tutorial will walk you through these two methods.</p>",
            onChangeCallback: null,
            onExitCallback: null,
    	},
    	{
            name: "tutorial-new-relation",
            object: document.getElementById("cMapNetworkContainer"), 
            content: "<p>First, to add a new relation, right-click on the concept map display window and click \"Add new relation\" option.</p>"
                        +"<p>(You may close this message and try selecting \"Add new relation\" option)</p>",
            onChangeCallback: function(currentStep){
            	experiment.conceptMap.setAddEdgeMode(false);
                tutorial.startTutorialEventListener("set_add_edge_mode", currentStep);
            },
            onExitCallback: function(currentStep){
            	//that.startTimedMessageGenerator("Right-click on the graph display, and select \"Add new relation\" option");
            },
            showSkipButton: true,
    	},
    	{
            name: "tutorial-new-relation_delay_",
            object: null, 
            content: "",
            onChangeCallback: function(currentStep){
                setTimeout(function() {
                    tutorial.intro.exit();
                    tutorial.setTutorialContent("prior_knowledge_task", "tutorial-add-edge-mode-intro");
                }, 500);
                return;
            },
            onExitCallback: null,
    	},	
    	{
            name: "tutorial-add-edge-mode-intro",
            object: document.getElementById("networkEditModeDisplay"), 
            content: "Now we are in AddRelationMode. Whenever you enter this mode, this message will appear in order to indicate the current mode.",
            onChangeCallback: null,
            onExitCallback: null,
    	},
    	{
            name: "tutorial-add-edge-mode-positive-relation",
            object: document.getElementById("cMapNetworkContainer"), 
            content: "<p>You can define new relations to indicate whether different pairs of concepts have positive or negative relationships.</p>"
                    +"<p>For example, you can make a new relation connecting two concepts \"SAR_ALTIM\" and \"LEO-600-polar\" to indicate "
                    +"that there is a positive effect when you assign the instrument \"SAR_ALTIM\" to the orbit \"LEO-600-polar\".</p>",
            onChangeCallback: null,
            onExitCallback: null,
    	},
    	{
            name: "tutorial-add-edge-mode-negative-relation",
            object: document.getElementById("cMapNetworkContainer"), 
            content: "<p>The relation may also be negative, indicating that the two concepts do not go well together.</p>"
                    +"<p>For example, a negative relation between \"VEG_LID\" and \"AERO_LID\" suggests that assigning these two instruments "
                    +"to the same spacecraft negatively impacts the science benefit score, the cost, or both.</p>",
            onChangeCallback: null,
            onExitCallback: null,
    	},
    	{
            name: "tutorial-add-edge-mode-click-two-concepts",
            object: document.getElementById("cMapNetworkContainer"), 
            content: "<p>To add a new relation, you can simply click the two concepts to be connected.</p>"
                    +"<p>To continue, close this message and try defining a new relation by clicking two concepts.<p>",
            onChangeCallback: function(currentStep){
                tutorial.startTutorialEventListener("new_edge_added", currentStep);
            },
            onExitCallback: function(targetElement) {
                //that.startTimedMessageGenerator("Select two different concepts to define a new relation");
            },
            showSkipButton: true,
    	},
    	{
            name: "tutorial-add-edge-mode-click-two-concepts_delay_",
            object: null, 
            content: "",
            onChangeCallback: function(currentStep){
                setTimeout(function() {
                    tutorial.intro.exit();
                    tutorial.setTutorialContent("prior_knowledge_task", "tutorial-add-edge-mode-two-concepts-clicked");
                }, 1000);
                return;
            },
            onExitCallback: null,
    	},	
    	{
            name: "tutorial-add-edge-mode-two-concepts-clicked",
            object: document.getElementsByClassName("iziToast-capsule")[0], 
            content: "<p>After specifying the two concepts to be connected, a popup message will appear as shown.</p>",
            onChangeCallback: function(currentStep){
                // Remove iziToast overlay layer
                d3.select('.iziToast-overlay.fadeIn').remove();

                // Get iziToast element
                let iziToastElement = document.querySelector('.iziToast-capsule');
                iziToastElement.parentNode.removeChild(iziToastElement);

                // Re-insert the iziToast element
                let body = document.querySelector('body');
                body.appendChild(iziToastElement, body.childNodes[0]);

                // Enable all iziToast buttons
        		PubSub.publish(EXPERIMENT_TUTORIAL_EVENT, "disable_iziToast_buttons");
            },
            onExitCallback: null,
    	},
    	{
            name: "tutorial-add-edge-mode-defining-new-relation-1",
            object: null, 
            content: "<p>First, select from the dropdown menu to indicate whether the relation is positive or negative.</p>",
            onChangeCallback: null,
            onExitCallback: null,
    	},	
    	{
            name: "tutorial-add-edge-mode-defining-new-relation-2",
            object: null, 
            content: "<p>Next, you need to provide a number between 0 and 100 to specify the weight. "
                +"The weight indicates the strength of the relation.</p>"
                +"<p>For example, if assigning \"SAR_ALTIM\" to \"LEO-600-polar\" plays a very important role in improving the overall design, "
                +"the weight of 90 may be assigned. If the relation exists but the impact is small, then weight of 10 may be assigned. </p>",
            onChangeCallback: null,
            onExitCallback: null,
    	},	
    	{
            name: "tutorial-add-edge-mode-defining-new-relation-3",
            object: null, 
            content: "<p>After specifying the relation type and the weight, you can click the confirm button.</p>",
            onChangeCallback: function(currentStep){
                // Enable all iziToast buttons
        		PubSub.publish(EXPERIMENT_TUTORIAL_EVENT, "enable_iziToast_buttons");
                
                tutorial.startTutorialEventListener("new_edge_defined", currentStep);
            },
            onExitCallback: null,
    	},
    	{
            name: "tutorial-add-edge-mode-defining-new-relation-3_delay_",
            object: null, 
            content: "",
            onChangeCallback: function(currentStep){
	            setTimeout(function() {
	            	tutorial.intro.exit();
                    tutorial.setTutorialContent("prior_knowledge_task", "tutorial-add-edge-mode-defining-new-relation-4");
	            }, 1500);
	            return;
            },
            onExitCallback: null,
    	},	
    	{
            name: "tutorial-add-edge-mode-defining-new-relation-4",
            object: document.getElementById("cMapNetworkContainer"), 
            content: "<p>Note that a new edge has been created in the concept map, connecting the selected concepts.</p>",
            onChangeCallback: null,
            onExitCallback: null,
    	},	
    	{
            name: "tutorial-add-edge-mode-custom-relation-1",
            object: null, 
            content: "<p>While 'positive' and 'negative' relations are given as default options, you can also define any custom relation.</p>",
            onChangeCallback: null,
            onExitCallback: null,
    	},	
    	{
            name: "tutorial-add-edge-mode-custom-relation-1_delay_",
            object: null, 
            content: "",
            onChangeCallback: function(currentStep){
            	tutorial.intro.exit();
            	tutorial.conceptMap.addNewEdge("1TQGJ4LG6-23GQ00G-B97", "1TJFRJB1X-VZ3MV4-76L");
	            setTimeout(function() {
                    // Remove iziToast overlay layer
                    d3.select('.iziToast-overlay.fadeIn').remove();

                    // Get iziToast element
                    let iziToastElement = document.querySelector('.iziToast-capsule');
                    iziToastElement.parentNode.removeChild(iziToastElement);

                    // Re-insert the iziToast element
                    let body = document.querySelector('body');
                    body.appendChild(iziToastElement, body.childNodes[0]);

                    // Enable all iziToast buttons
        			PubSub.publish(EXPERIMENT_TUTORIAL_EVENT, "disable_iziToast_buttons");

        			setTimeout(function() {
        				tutorial.setTutorialContent("prior_knowledge_task", "tutorial-add-edge-mode-custom-relation-2");
        			}, 500)
	            }, 1000);
            },
            onExitCallback: null,
    	},	
    	{
            name: "tutorial-add-edge-mode-custom-relation-2",
            object: document.getElementsByClassName("iziToast-capsule")[0], 
            content: "<p>To add a custom relation, simply select 'other' as the relation type.</p>",
            onChangeCallback: null,
            onExitCallback: null,
    	},	
    	{
            name: "tutorial-add-edge-mode-custom-relation-3",
            object: null, 
            content: "<p>Specify the name of the relation in the text input field, and the weight. For now, "
                    +"type in \"myRelation\" in the text input field, and put 100 as the weight.</p>"
                    +"<p>Click confirm to finish defining the relation.</p>",

            onChangeCallback: function(currentStep){
                // Enable all iziToast buttons
        		PubSub.publish(EXPERIMENT_TUTORIAL_EVENT, "enable_iziToast_buttons");

            	tutorial.startTutorialEventListener("new_edge_defined_other", currentStep);
            },
            onExitCallback: null,
    	},	
    	{
            name: "tutorial-add-new-concept-1",
            object: document.getElementById("cMapNetworkContainer"), 
            content: "<p>Now we will move on to the second way of recording information, which is to add new concepts.</p>"
                    +"<p>When you cannot find the exact concept that you want to connect a relation to, you can define a new concept.</p>",
            onChangeCallback: null,
            onExitCallback: null,
    	},	
    	{
            name: "tutorial-add-new-concept-2",
            object: document.getElementById("cMapNetworkContainer"), 
            content: "<p>To add a new concept, right-click on the concept map display window, and click \"Add new concept\" option.</p>"
                    +"<p>(close this message and try selecting \"Add new concept\" option)</p>",
            onChangeCallback: function(currentStep){
                tutorial.conceptMap.setAddEdgeMode(false);
            	tutorial.startTutorialEventListener("add_new_node", currentStep);
            },
            onExitCallback: null,
            showSkipButton: true,
    	},
    	{
            name: "tutorial-add-new-concept-2_delay_",
            object: null, 
            content: "",
            onChangeCallback: function(currentStep){
                // Remove iziToast overlay layer
                d3.select('.iziToast-overlay.fadeIn').remove();

                // Get iziToast element
                let iziToastElement = document.querySelector('.iziToast-capsule');
                iziToastElement.parentNode.removeChild(iziToastElement);

                // Re-insert the iziToast element
                let body = document.querySelector('body');
                body.appendChild(iziToastElement, body.childNodes[0]);

                // Enable all iziToast buttons
        		PubSub.publish(EXPERIMENT_TUTORIAL_EVENT, "disable_iziToast_buttons");

                setTimeout(function() {
                    tutorial.intro.exit();
                    tutorial.setTutorialContent("prior_knowledge_task", "tutorial-add-new-concept-3");
                }, 500);
            },
            onExitCallback: null,
    	},	
    	{
            name: "tutorial-add-new-concept-3",
            object: document.getElementsByClassName("iziToast-capsule")[0], 
            content: "<p>Similarly as before, a pop up message will appear.</p>",
            onChangeCallback: null,
            onExitCallback: null,
    	},	
    	{
            name: "tutorial-add-new-concept-4",
            object: null, 
            content: "<p>Adding a new concept simply requires typing in the name of the concept to be defined.</p>"
                +"<p>To continue, try typing in \"myConcept\" in the text input field, and click confirm.</p>",

            onChangeCallback: function(currentStep){
                // Enable all iziToast buttons
        		PubSub.publish(EXPERIMENT_TUTORIAL_EVENT, "enable_iziToast_buttons");

            	tutorial.startTutorialEventListener("new_node_added", currentStep);
            },
            onExitCallback: null,
    	},
    	{
            name: "tutorial-add-new-concept-4_delay_",
            object: document.getElementById("cMapNetworkContainer"), 
            content: "",
            onChangeCallback: function(currentStep){
                tutorial.intro.exit();
	            setTimeout(function() {
	            	tutorial.setTutorialContent("prior_knowledge_task", "tutorial-add-new-concept-5");
	            }, 500);
            },
            onExitCallback: null,
    	},
    	{
            name: "tutorial-add-new-concept-5",
            object: document.getElementById("cMapNetworkContainer"), 
            content: "<p>Note that a new node is added. Initially, it doesn't have any connection, so it may float around.</p>"
                    +"<p>To fix its location, add relations connecting the new concept to a pre-existing concept.</p>",
            onChangeCallback: null,
            onExitCallback: null,
    	},








        {
            name: "tutorial-textInput-1",
            object: document.getElementById("toggleTextInputPanelButton"), 
            content: "<p>In addition to the concept map, you also have an option to record information in text.</p>"
                    +"<p>To select this option, click the button \"Open Text Input Panel\"</p>",
            onChangeCallback: function(currentStep){
                tutorial.experiment.closeTextInputPanel();
                tutorial.startTutorialEventListener("toggle_text_input_panel", currentStep);
            },
            onExitCallback: null,
        },
        {
            name: "tutorial-textInput-1_delay_",
            object: document.getElementById("toggleTextInputPanelButton"), 
            content: "",
            onChangeCallback: function(currentStep){
                tutorial.intro.exit();
                setTimeout(function() {
                    tutorial.setTutorialContent("prior_knowledge_task", "tutorial-textInput-2");
                }, 500);
            },
            onExitCallback: null,
        },
        {
            name: "tutorial-textInput-2",
            object: document.getElementById("textInputPanel"), 
            content: "<p>You can write information on the provided text box as necessary.</p>"
                    +"<p>However, we ask you to first try to record information using the cocnept map. If you find "
                    +"some information difficult or impossible to record in the concept map, then you may record it here.</p>",
            onChangeCallback: null,
            onExitCallback: null,
        },
    	{
            name: "tutorial-summary",
            object: document.getElementById("cMapNetworkContainer"), 
            content: "<p>We have covered two different ways of recording information on the concept map:</p>"
	                +"<ol><li>Adding new relations</li>"
	                +"<li>Adding new concepts</li></ol>"
                    +"<p>As we just covered, you can also record in formation in text.</p>"
                    +"<p></p>"
	                +"<p>Now you will be given 7 minutes to record any positive or negative relations "
	                +"that you think may be present among the concepts provided. "
	                +"You may also record custom relations or add new concepts as needed.</p>"
	                + "<p>Try to identify and record as many relations as you can based on your prior knowledge "
	                +"about designing an Earth observation mission.</p>",
            onChangeCallback: null,
            onExitCallback: null,
    	},











    	{
            name: "tutorial-closing",
            object: document.getElementById("submitButton"), 
            content: "<p>When you are finished, you can submit the concept map by clicking this button and move on to the next "
            		+"task.</p>",
            onChangeCallback: null,
            onExitCallback: null,
    	},
    	{
            name: "learning_task",
            object: undefined, 
            content: "<p>Try to record as many positive or negative relations as possible "
                    +"based on the observations you make from the data provided in the iFEED interface "
                    +"(instead of relying on your prior knowledge).</p>",
            onChangeCallback: null,
            onExitCallback: null,
    	},
    	{
            name: "problem_solving_task_v1",
            object: undefined, 
            content: "<p>As you answer the questions, you may refer to the information you recorded in the concept map.</p>"
            	+"<p>Note that you are not allowed to make any changes to the concept map during this part of the experiment. </p>",
            onChangeCallback: null,
            onExitCallback: null,
    	},
        {
            name: "problem_solving_task_v2",
            object: undefined, 
            content: "<p>You may refer to the information in the concept map interface as you analyze the dataset. </p>"
                +"<p>Note that you are not allowed to make any changes to the concept map during this part of the experiment. </p>",
            onChangeCallback: null,
            onExitCallback: null,
        },
    ];
}