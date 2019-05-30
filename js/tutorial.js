
var TUTORIAL_EVENT = "tutorial_event";

class Tutorial{
    constructor(experiment, network){
        this.intro = introJs();
        this.intro._options.exitOnOverlayClick = false;

        this.experiment = experiment;
        this.network = network;
        this.eventListenerKeyword = null;
        this.stashedEventListenerKeyword = null;
        this.eventTimer = new TutorialTimer();
        this.tutorialDurationTimer = new TutorialTimer();

        let that = this;
        PubSub.subscribe(TUTORIAL_EVENT, (msg, data) => {
            if(that.eventListenerKeyword){
                if(data === that.eventListenerKeyword){
                    that.setTutorialContent(data);
                }
            }
        });

        d3.selectAll('#tutorialButton').on('click', (d) => { 
            if(that.stashedEventListenerKeyword){
                that.setTutorialContent(that.stashedEventListenerKeyword);
            }else{
                that.setTutorialContent("start");
            }
        }); 

        this.eventListenerKeyword = "start";
    }

    start(){
        this.intro.start();

        // Disable SKIP button until it reaches the last step
        $('.introjs-skipbutton').hide();
        this.intro.onafterchange(function(){          
            if (this._introItems.length - 1 == this._currentStep || this._introItems.length == 1) {
                $('.introjs-skipbutton').show();
            } 
        });
    }

    end(){
        this.intro.exit();
        this.stopTimer();
        this.eventListenerKeyword = null;
    }

    skipTutorial(){
        this.end();
        setAddNodeMode(false);
        setAddEdgeMode(false);
        iziToast.info({
            title: "You are given 10 minutes to record as many relations as possible based on your prior knowledge.",
            message: '',
            position: 'topRight',
            timeout: 10000
        });
        this.experiment.startNextStage();
        d3.select("#tutorialButton").node().disabled = true;
    }

    openIntroMessage(objects, messages, classname, callback){
        this.intro.exit();
        this.stopTimer();
        this.eventListenerKeyword = null;

        if(messages.length === 1){
            this.intro.setOption('showButtons', false).setOption('showBullets', false);
        }else{
            this.intro.setOption('showButtons', true).setOption('showBullets', true);
        }
        
        if(!classname){
            classname = 'introJsTooltip';
        }
        
        let steps = [];
        let last_object = null;
        for(let i = 0; i < messages.length; i++){
            if(!objects){ // No object specified
                steps.push({intro: messages[i]});

            }else{
                if(!objects[i]){ // object is null
                    if(!last_object){
                        steps.push({intro: messages[i]});
                    }else{
                        steps.push({element:last_object, intro:messages[i]});
                    }
                }else{
                    last_object = objects[i];
                    steps.push({element:objects[i], intro:messages[i]});
                }
            }
        }
        this.intro.setOptions({steps:steps, tooltipClass:classname}).onchange(callback);
        this.start(); 
    }

    setTutorialContent(stage){
        let that = this;
        let objects, contents, classname, callback;        

        callback = function(){
            return undefined;
        };

        this.stashedEventListenerKeyword = stage;
        this.intro.oncomplete(() => {});
        
        if(!stage || stage === "start"){

            this.startTimer(this.tutorialDurationTimer);
            
            objects = [null,
                        document.getElementById("networkContainer")];

            contents = ["In this step, we are going to measure the level of your prior knowledge in designing an Earth observation mission.",
                        
                        "You will record information using an interactive graph, which displays different concepts and their relationships.",

                        "<p>The vertices in this graph represent concepts related to orbits and instruments. The edges represent the relations that connect different concepts.</p>"
                        +"<p>Note that the color of each concept represents its type (e.g. type of measurement, spectral region, altitude of an orbit, etc.).</p>",

                        "You can move and highlight verticies by dragging the mouse. "+
                        "This makes it easier to view verticies and their connections when the graph is cluttered.",

                        "<p>Recording new information in this graph can be done in two ways:</p> "
                        +"<p>1. Adding new relations</p>"
                        +"<p>2. Adding new concepts</p>",

                        "<p>To add a new relation, right-click on the graph display window, and click \"Add new relation\" option.</p>"
                        +"<p>(close this message and try selecting \"Add new relation\" option)</p>"];
                        
            callback = function(targetElement) {
                if(this._currentStep === 5){
                    setAddNodeMode(false);
                    setAddEdgeMode(false);
                    that.eventListenerKeyword = "set_add_edge_mode";
                    that.startTimedMessageGenerator("Right-click on the graph display, and select \"Add new relation\" option");
                }
            }

        } else if(stage === "set_add_edge_mode"){
            this.intro.exit();
            this.stopTimer();
            var delayInMilliseconds = 1500; // 1.5 second delay
            setTimeout(function() {
                that.setTutorialContent("set_add_edge_mode_after_delay");
            }, delayInMilliseconds);
            return;

        } else if(stage === "set_add_edge_mode_after_delay"){
            objects = [document.getElementById("networkEditModeDisplay"),
                        document.getElementById("networkContainer")];

            contents = ["Now we are in AddRelationMode. Whenever you enter this mode, this message will appear in order to indicate the current interaction mode.",

                        "<p>You can define new relations to indicate whether different pairs of concepts have positive or negative relationships.</p>"
                        +"<p>For example, you can make a new relation connecting two concepts \"SAR_ALTIM\" and \"LEO-600-polar\" to indicate "
                        +"that there is a positive effect when you assign the instrument \"SAR_ALTIM\" to the orbit \"LEO-600-polar\".</p>",

                        "<p>The relation may also be negative, indicating that the two concepts do not go well together.</p>"
                        +"<p>For example, a negative relation between \"VEG_LID\" and \"AERO_LID\" suggests that these two instruments "
                        +"do not go well together when they are assigned to the same spacecraft</p>",

                        "To add a new relation, you can simply drag the mouse from one concept node to another.",

                        "<p>Now, try adding a new relation using drag and drop.<p>"
                        +"<p>(close this message and try defining a new relation)</p>"];
            
            callback = function(targetElement) {
                if(this._currentStep === 4){
                    that.eventListenerKeyword = "new_edge_added";
                    that.startTimedMessageGenerator("Drag the mouse from one concept to another to define a new relation");
                }
            }

        } else if(stage === "new_edge_added"){

            objects = [document.getElementsByClassName("iziToast-capsule")[0]];

            contents = ["After specifying the two concepts to be connected, a popup message will appear as shown.",
                        
                        "First, select from the dropdown menu to indicate whether the relation is positive or negative.",

                        "<p>Next, you need to provide a number between 0 and 100 to specify the weight. "
                        +"The weight indicates the strength of the relation.</p>"
                        +"<p>For example, if assigning \"SAR_ALTIM\" to \"LEO-600-polar\" plays a very important role in improving the overall design, "
                        +"the weight of 90 may be assigned. If the relation exists but the impact is small, then weight of 10 may be assigned. </p>",

                        "After specifying the relation type and the weight, you can click the confirm button."];
                        
            callback = function(targetElement) {
                if(this._currentStep === 0){
                    // Remove iziToast overlay layer
                    d3.select('.iziToast-overlay.fadeIn').remove();

                    // Get iziToast element
                    let iziToastElement = document.querySelector('.iziToast-capsule');
                    iziToastElement.parentNode.removeChild(iziToastElement);

                    // Re-insert the iziToast element
                    let body = document.querySelector('body');
                    body.appendChild(iziToastElement, body.childNodes[0]);

                } else if(this._currentStep === 3){
                    that.eventListenerKeyword = "new_edge_defined";
                    that.startTimedMessageGenerator("Set the type of the relation and the weight, and click confirm button.");
                }
            }

        } else if(stage === "new_edge_defined"){

            this.intro.exit();
            this.stopTimer();
            var delayInMilliseconds = 2500; // 2.5 second delay
            setTimeout(function() {
                that.setTutorialContent("new_edge_defined_after_delay");
            }, delayInMilliseconds);
            return;

        }else if(stage === "new_edge_defined_after_delay"){

            objects = [document.getElementById("networkContainer")];

            contents = ["Note that a new edge is created in the graph, connecting two concepts.",
                        
                        "<p>Now we will move on to the second way to record information, which is to add new concepts.</p>"
                        +"<p>When you cannot find the exact concept that you want to connect a relation to, you can define a new concept.</p>",

                        "<p>To add a new concept, right-click on the graph display window, and click \"Add new concept\" option.</p>"
                        +"<p>(close this message and try selecting \"Add new concept\" option)</p>"];
            
            callback = function(targetElement) {
                if(this._currentStep === 2){
                    setAddNodeMode(false);
                    setAddEdgeMode(false);
                    that.eventListenerKeyword = "set_add_node_mode";
                    that.startTimedMessageGenerator("Right-click on the graph display, and select \"Add new concept\" option");
                }
            }

        } else if(stage === "set_add_node_mode"){
            this.intro.exit();
            this.stopTimer();
            var delayInMilliseconds = 1500; // 1.5 second delay
            setTimeout(function() {
                that.setTutorialContent("set_add_node_mode_after_delay");
            }, delayInMilliseconds);
            return;

        } else if(stage === "set_add_node_mode_after_delay"){
            objects = [document.getElementById("networkEditModeDisplay"),
                        document.getElementById("networkContainer")];

            contents = ["Similarly as before, now we are in AddConceptMode. Whenever you enter this mode, this message will appear in order to indicate the current interaction mode.",

                        "<p>A new concept can be defined by combining multiple existing concepts.</p>"
                        +"<p>For example, you can combine \"Sun-synchronousOrbit\" node and \"600km\" node to define a new concept "
                        +"\"Sun-synchronous orbit with altitude 600km\".</p>"
                        +"<p>Note that you cannot select concepts that are mutually exclusive or "
                        +"simple instances of orbits and instruments (e.g. SSO-600-DD, LEO-600-polar, AERO_POL, SAR_ALTIM)</p>",

                        "To combine multiple concepts, first click the nodes to be combined. "
                        +"Then, use the right-click to open a menu and select \"Confirm concept addition\"",

                        "<p>Now, try adding a new concept by selecting multiple concept nodes.<p>"
                        +"<p>(close this message and try defining a new concept)</p>"];
            
            callback = function(targetElement) {
                if(this._currentStep === 3){
                    that.eventListenerKeyword = "new_node_added";
                    that.startTimedMessageGenerator("Select multiple nodes. Then, right-click to open a menu and select \"Confirm concept addition\"");
                }
            }

        } else if(stage === "new_node_added"){
            this.intro.exit();
            this.stopTimer();
            var delayInMilliseconds = 2500; // 2.5 second delay
            setTimeout(function() {
                that.setTutorialContent("new_node_added_after_delay");
            }, delayInMilliseconds);
            return;

        } else if(stage === "new_node_added_after_delay"){
            objects = [document.getElementById("networkContainer")];

            contents = ["After the new concept is added, you can hover the mouse over the node to view its label.",

                        "<p>Now you will be given 10 minutes to record any positive or negative relations that you think may be present among the concepts provided.</p>"
                        + "<p>Try to identify and record as many relations as you can based on your prior knowledge about designing an Earth observation mission.</p>"];
            
            callback = function(targetElement) {
                if(this._currentStep === 1){

                    that.intro.oncomplete(() => { 
                        setAddNodeMode(false);
                        setAddEdgeMode(false);

                        // Save the duration as a file
                        that.stopTimer(that.tutorialDurationTimer);
                        let filename = that.experiment.participantID + "-conceptMapTutorial.json";
                        let out = {participantID = that.participantID, tutorialDuration: that.tutorialDurationTimer.getTimeElapsed() / 1000};
                        that.experiment.saveTextAsFile(filename, JSON.stringify(out));

                        // Start the first task
                        iziToast.info({
                            title: "You are given 10 minutes to record as many relations as possible based on your prior knowledge.",
                            message: '',
                            position: 'topRight',
                            timeout: 10000
                        });
                        that.experiment.startNextStage();
                        d3.select("#tutorialButton").node().disabled = true;
                    });
                }
            }
        } 

        this.openIntroMessage(objects, contents, classname, callback);
    }

    startTimedMessageGenerator(hintMessage){
        var callback = [];
        var duration = [];
        var d1 = 1 * 10 * 1000;
        var callback1 = () => {
            iziToast.info({
                title: hintMessage,
                message: '',
                position: 'topRight',
                timeout: 10000
            });
        };
        var d2 = 1 * 20 * 1000;
        var callback2 = () => {
            iziToast.info({
                title: "If you are not sure how to continue, please ask the experimenter for help",
                message: "",
                position: 'topRight',
                timeout: 10000
            });
        };
        callback = [callback1, callback2];
        duration = [d1, d2];
        this.startTimer(this.eventTimer, callback, duration);
    }

    startTimer(timer, callback, duration){
        // Set the timer
        this.stopTimer(timer);
        timer.setCallback(callback);
        timer.setDuration(duration);
        timer.start();
    }

    stopTimer(timer){
        if(timer){
            timer.stop();
        } else if (this.eventTimer){
            this.stopTimer(this.eventTimer);
        }
    }
}


class TutorialTimer{
    constructor(){        
        this.timeinterval = null;
        this.startTime = null;
        this.endTime = null;
        this.timeElapsed = null;

        // Duration needs to be set up to use this class as a timer
        this.duration = [];
        this.callback = [];
    }

    callbackExists(){
        if(this.callback.length === 0){
            return false;
        }else{
            return true;
        }
    }

    setCallback(callback){
        if(callback instanceof Array){
            this.callback = callback;
        }else{
            this.callback = [callback];
        }
    }

    setDuration(duration){
        if(duration instanceof Array){
            this.duration = duration;
        }else{
            this.duration = [duration];
        }
    }

    addCallback(callback){
        if(callback instanceof Array){
            this.callback = this.callback.concat(callback);
        }else{
            this.callback.push(callback);
        }
    }

    addDuration(duration){
        if(duration instanceof Array){
            this.duration = this.duration.concat(duration);
        }else{
            this.duration.push(duration);
        }
    }

    reset(){
        this.stop();

        this.timeinterval = null;
        this.startTime = null;
        this.endTime = null;
        this.timeElapsed = null;

        // Duration needs to be set up to use this class as a timer
        this.duration = [];
        this.callback = [];
    }

    clearCallback(){
        this.callback = [];
        this.duration = [];
    }

    start(){
        clearInterval(this.timeinterval);
        this.startTime = Date.parse(new Date());
        this.endTime = null;
        this.timeElapsed = null;

        let durationClone = [];
        let callbackClone = [];
        for(let i = 0; i < this.duration.length; i++){
            durationClone.push(this.duration[i]);
            callbackClone.push(this.callback[i]);
        }
        this.startStopWatch(durationClone, callbackClone);
    }

    stop(){
        this.endTime = Date.parse(new Date());
        this.timeElapsed = this.endTime - this.startTime;
        clearInterval(this.timeinterval);
    }  

    getTimeElapsed(){
        let out;
        if(this.timeElapsed){
            out = this.timeElapsed;
        }else{
            out = Date.parse(new Date()) - this.startTime;
        }
        return out;
    }

    getTimeElapsedInMinutesAndSeconds(){
        let t = this.getTimeElapsed();
        let seconds = Math.floor( (t/1000) % 60 );
        let minutes = Math.floor( t/1000/60 );
        return {
            'total': t,
            'minutes': minutes,
            'seconds': seconds
        };
    }

    startStopWatch(duration, callback){
        let that = this;
        function updateClock(){
            let t = that.getTimeElapsedInMinutesAndSeconds();
            let minutes = t.minutes;
            let seconds = t.seconds;

            if(callback.length != 0){
                if(t.total > duration[0]){
                    callback[0]();
                    callback.splice(0,1);
                    duration.splice(0,1);
                }
            }
        }
        updateClock(); // run function once at first to avoid delay
        this.timeinterval = setInterval(updateClock, 1000);
    }
}