
var exampleParticipantID = "0497289903001004819-5_21_10_45";

class Experiment{

    constructor(conceptMap){
        window.onbeforeunload = function() { return "Warning: Changes you made may not be saved."; };

        this.conceptMap = conceptMap;
        this.treatmentCondition = null;
        this.treatmentConditionName = null;
        this.participantID = null;

        // Experiment stages: 
            // prior_knowledge_task: Concept mapping before learning task
            // learning_task: Concept mapping during learning task
            // problem_solving_task: (no modification allowed)
        this.stage = "prior_knowledge_task";

        // Timer for each task
        this.clock = null;

        let that = this;

        // Disable buttons
        if(d3.select("#helpButton").node()){
            d3.select("#helpButton").node().disabled = true;
        }

        if(d3.select("#submitButton").node()){
            d3.select("#submitButton").node().disabled = true;
        } 

        this.loadTextInputPanel();
    }

    loadTextInputPanel(){
        // Set up text input panel
        this.textInputPanelOpen = false;

        let height = this.conceptMap.container.getBoundingClientRect().height;
        let top = this.conceptMap.container.getBoundingClientRect().top;

        d3.select('#textInputPanel')
            .style('height', height + "px")
            .style('left', document.body.clientWidth + "px")
            .style('top', top + "px");

        d3.select('#textInputContainer')
            .style('height', height * 0.9 + "px")
            .style('margin-top', height * 0.03 + "px");

        d3.select('#textInputDirection')
            .style('height', "13%")
            .html("<p>Use this text box to record information that you find difficult or impossible to record on the concept map.</p>"
                +"");
        d3.select('#textInputBox')
            .style('height', "87%");

        d3.select("#toggleTextInputPanelButton")
            .on('click', (d) => { 
                if(this.textInputPanelOpen){
                    this.textInputPanelOpen = false;
                    this.closeTextInputPanel();
                } else {
                    this.textInputPanelOpen = true;
                    this.openTextInputPanel();
                }
            }); 
    }

    loadStage(){
        let that = this;
        this.conceptMap.setAddEdgeMode(false);

        // Set up the submit button
        d3.select('#submitButton').on('click', (d) => { 
            let submit = confirm("Are you sure you want to submit the result?"); 
            if(submit){
                // download the result file
                that.endStage();
            }
        }); 

        // Remove any info from the previous stage
        let removeUserGeneratedInfo = () => {
            // remove all newly added edges and nodes
            let edgesToRemove = this.conceptMap.newEdges.clear();
            this.conceptMap.edges.remove(edgesToRemove);

            let nodesToRemove = this.conceptMap.newNodes.clear();
            this.conceptMap.nodes.remove(nodesToRemove);

            d3.select("#textInputBox").node().value = "";
        }

        if(this.stage === "prior_knowledge_task"){
            removeUserGeneratedInfo();

        }else if(this.stage === "learning_task"){
            removeUserGeneratedInfo();

        }else if(this.stage === "problem_solving_task"){

            if(this.treatmentConditionName === "design_inspection"){
                removeUserGeneratedInfo();
            }

            d3.select('#submitButton').node().disabled = true;

            // Disable adding or modifying edges
            this.conceptMap.contextMenu = null;
            document.getElementById(this.conceptMap.cmapContainerID).removeEventListener('contextmenu', this.conceptMap.contextMenuEventListener);
            document.getElementById(this.conceptMap.cmapContainerID).addEventListener('contextmenu', (e) => {
                e.preventDefault();
                iziToast.warning({
                    title: 'Recording new information is disabled for this part of the experiment',
                    message: '',
                });
            }, false);

            d3.select('#textInputDirection').html("<p>Recording new information is disabled for this part of the experiment.</p>");
        }

        PubSub.publish(EXPERIMENT_TUTORIAL_START);
    }

    generateSignInMessage(){
        let that = this;

        let textInput = '<input type="text" style="width: '+ this.conceptMap.container.clientHeight / 2.8 +'px">';
        let buttonStyle = "width: "+ this.conceptMap.container.clientHeight / 7.46 +"px;" 
                        + "margin-left: "+ this.conceptMap.container.clientHeight / 59.7 +"px"
                        + "margin-right: "+ this.conceptMap.container.clientHeight / 59.7 +"px"
                        + "float: left;";

        let title, message, submitCallback;
        if(this.stage === "prior_knowledge_task"){

            title = "Copy and paste the participant ID";
            message = "(provided in the top-right corner of the tutorial page)";

            submitCallback = function (instance, toast, button, event, inputs) {
                let inputParticipantID = inputs[0].value;
                let valid = true;

                if(inputParticipantID === "1232123"){
                    inputParticipantID = exampleParticipantID;
                }

                if(inputParticipantID.indexOf("articipan") !== -1){
                    valid = false;
                } else if(inputParticipantID.indexOf("ID:") !== -1){
                    valid = false;
                } else if(inputParticipantID.indexOf("004819") === -1){
                    valid = false;
                }

                let count = 0;
                for(let i = 0; i < inputParticipantID.length; i++){
                    if(inputParticipantID[i] === "_"){
                        count += 1;
                    }
                }
                if(count !== 3){
                    valid = false;
                }

                if(valid){
                    that.treatmentCondition = +inputParticipantID[12];
                    if(that.treatmentCondition === 0){
                        that.treatmentConditionName = "design_inspection";
                    } else if (that.treatmentCondition === 1){
                        that.treatmentConditionName = "manual";
                    } else if (that.treatmentCondition === 2){
                        that.treatmentConditionName = "automated";
                    } else if(that.treatmentCondition === 3){
                        that.treatmentConditionName = "interactive";
                    } else if (that.treatmentCondition === 4){
                        that.treatmentConditionName = "manual_generalization";
                    } else if (that.treatmentCondition === 5){
                        that.treatmentConditionName = "automated_generalization";
                    } else if(that.treatmentCondition === 6){
                        that.treatmentConditionName = "interactive_generalization";
                    } 
                    that.participantID = inputParticipantID;
                    that.displayParticipantID(inputParticipantID);
                    instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');
                    that.loadStage();

                }else{
                    that.generateErrorMessage("Invalid participant ID. Please copy and paste the particpant ID from the tutorial page");
                }
            }

        } else {
            title = "To continue, type in a passcode";
            message = "(Please ask the experimenter to provide the passcode)";

            submitCallback = function (instance, toast, button, event, inputs) {
                let input = inputs[0].value;
                if(input === "goseakers"){
                    instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');
                    that.loadStage();

                }else{
                    that.generateErrorMessage("Invalid passcode");
                }
            }
        }

        iziToast.question({
            drag: false,
            timeout: false,
            close: false,
            overlay: true,
            displayMode: 0,
            id: 'question',
            color: 'blue',
            progressBar: false,
            title: title,
            message: message,
            position: 'center',
            inputs: [
                [textInput, 'change', function (instance, toast, select, event) {}],
            ],
            buttons: [
                ['<button id="iziToast_button_confirm" style="'+ buttonStyle +'"><b>Confirm</b></button>', submitCallback, false], // true to focus
            ],
        });
    }

    endStage(){
        this.stopTimer();
        this.saveNetwork();
        this.saveTextInput();

        if(this.stage === "prior_knowledge_task"){
            if(this.treatmentConditionName === "design_inspection"){
                // Skip learning_task
                this.stage = "problem_solving_task";
            } else {
                this.stage = "learning_task";
            }
            
        } else if(this.stage === "learning_task"){
            this.stage = "problem_solving_task";
        }

        this.generateSignInMessage();
    }
    
    startStage(){
        let that = this;

        let callback = [];
        let duration = [];
        let timeLimitExists = false;

        this.conceptMap.setAddEdgeMode(false);

        let startMessage = null;
        let helpMessage = null;

        if(this.stage === "prior_knowledge_task"){
            timeLimitExists = true;

            // remove all newly added edges and nodes
            let edgesToRemove = this.conceptMap.newEdges.clear();
            this.conceptMap.edges.remove(edgesToRemove);

            let nodesToRemove = this.conceptMap.newNodes.clear();
            this.conceptMap.nodes.remove(nodesToRemove);

            let d1 = 5 * 60 * 1000;
            let callback1 = () => {
                alert("5 minutes passed! You have 2 more minutes to finish up. If you are finished, you can click the submit button below.");
            };
            let d2 = 7 * 60 * 1000;
            let callback2 = () => {
                alert("End of the session");
                that.endStage();
            };
            // Set callback functions
            callback = [callback1, callback2];
            duration = [d1, d2];

            startMessage = "Record as many relations as possible based on your prior knowledge.";
            helpMessage = startMessage;

            d3.select("#submitButton").node().disabled = false; 

        }else if(this.stage === "learning_task"){
            timeLimitExists = false;
            startMessage = "Record as many relations as possible based on the observations "
                    +"you made from the design data (instead of relying on your prior knowledge).";
            helpMessage = startMessage;

            d3.select("#submitButton").node().disabled = false; 

        }else if(this.stage === "problem_solving_task"){
            timeLimitExists = false;
            startMessage = "You may refer to the information recorded in the concept map for solving problems.";
            helpMessage = startMessage;

            d3.select("#submitButton").node().disabled = true; 
            d3.select("#textInputBox").node().disabled = true; 
        }

        // Set up the help button
        d3.select("#helpButton").node().disabled = false;
        d3.select('#helpButton').on('click', (d) => { 
            // Start the prior knowledge task
            iziToast.destroy();
            iziToast.info({
                title: helpMessage,
                titleSize: '2.3vh',
                message: '',
                position: 'topRight',
                timeout: 10000,
            });
        }).text("Show task goal");

        // Start the prior knowledge task
        iziToast.destroy();
        iziToast.info({
            title: startMessage,
            titleSize: '2.3vh',
            message: '',
            position: 'topRight',
            timeout: 10000
        });

        this.startTimer(callback, duration, timeLimitExists);
    }

    startTimer(callback, duration, timeLimitExists){
        // Set the timer
        this.clock = new Clock();
        if(timeLimitExists){
            this.clock.stopwatch = false;
        }else{
            this.clock.stopwatch = true;
        }
        this.clock.setCallback(callback);
        this.clock.setDuration(duration);
        this.clock.start();
    }

    continueTimer(){
        this.clock.continue();
    }

    stopTimer(){
        if(this.clock){
            this.clock.stop();
        }
    }

    saveTextInput(){
        let out = {};
        out.participantID = this.participantID;
        out.stage = this.stage;
        out.textInput = d3.select("#textInputBox").node().value;
        let filename = this.participantID + "-textInput-"+ this.stage + ".json";
        this.saveTextAsFile2(filename, JSON.stringify(out));
    }

    saveNetwork(){
        let that = this;

        let out = {};
        out.participantID = this.participantID;
        out.stage = this.stage;

        let timeElapsedInMiliSec = this.clock.getTimeElapsed();
        out.timeElapsed = timeElapsedInMiliSec / 1000;

        let edgesOut = [];
        this.conceptMap.newEdges.forEach((d) => {
            let edgeCopy = JSON.parse(JSON.stringify(d));
            let fromNodeLabel = that.conceptMap.getNodeLabel(d.from);
            let toNodeLabel = that.conceptMap.getNodeLabel(d.to);
            edgeCopy.fromLabel = fromNodeLabel;
            edgeCopy.toLabel = toNodeLabel;
            edgeCopy.width = undefined;
            edgeCopy.color = undefined;
            edgesOut.push(edgeCopy);
        })
        out.edges = edgesOut;

        let nodesOut = [];
        this.conceptMap.newNodes.forEach((d) => {
            let nodeCopy = JSON.parse(JSON.stringify(d));
            nodeCopy.connectedNodes = [];

            that.conceptMap.edges.forEach((d) => {
                let connectedNode = null;
                if(d.from === nodeCopy.id){
                    connectedNode = that.conceptMap.nodes.get(d.to);
                }else if( d.to === nodeCopy.id){
                    connectedNode = that.conceptMap.nodes.get(d.from);
                }
                if(connectedNode){
                    let connectedNodeCopy = JSON.parse(JSON.stringify(connectedNode));
                    connectedNodeCopy.group = undefined;
                    nodeCopy.connectedNodes.push(connectedNodeCopy);
                }
            })
            nodesOut.push(nodeCopy);
        })
        out.nodes = nodesOut;

        let filename = this.participantID + "-conceptMap-"+ this.stage + ".json";
        this.saveTextAsFile2(filename, JSON.stringify(out));
    }

    saveTextAsFile2(filename, inputText){        
        let name = filename;
        let type = "application/json";
        let data = inputText;

        if (data !== null && navigator.msSaveBlob)
            return navigator.msSaveBlob(new Blob([data], { type: type }), name);

        let a = $("<a style='display: none;'/>");
        let url = window.URL.createObjectURL(new Blob([data], {type: type}));
        a.attr("href", url);
        a.attr("download", name);
        $("body").append(a);
        a[0].click();
        window.URL.revokeObjectURL(url);
        a.remove();
    }

    saveTextAsFile(filename, inputText){
        let textToWrite = inputText;
        let fileNameToSaveAs = filename;
        let textFileAsBlob = new Blob([textToWrite], {type:'text/plain'});
        let downloadLink = document.createElement("a");

        downloadLink.download = fileNameToSaveAs;
        downloadLink.innerHTML = "Download File";

        if (window.webkitURL != null){
            // Chrome allows the link to be clicked
            // without actually adding it to the DOM.
            downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
        
        }else{
            // Firefox requires the link to be added to the DOM
            // before it can be clicked.
            downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
            downloadLink.onclick = document.body.removeChild(event.target);
            downloadLink.style.display = "none";
            document.body.appendChild(downloadLink);
        }
        downloadLink.click();
    }

    createResultFile(data, filename, type) {
        var file = new Blob([data], {type: type});
        if (window.navigator.msSaveOrOpenBlob) // IE10+
            window.navigator.msSaveOrOpenBlob(file, filename);

        else { // Others
            var a = document.createElement("a");
            var url = URL.createObjectURL(file);
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            setTimeout(function() {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);  
            }, 0); 
        }
    }

    generateErrorMessage(message){
        iziToast.error({
            title: 'Error',
            message: message,
            position: 'topRight'
        });
    }

    displayParticipantID(participantID){
        var container = document.getElementById(this.conceptMap.cmapContainerID);
        var width = container.clientWidth;
        var offset = 6;
        var x = + width - 345;
        var y = + offset;
        d3.select('#'+this.conceptMap.cmapContainerID)
            .append('div')
            .attr('id', 'participantID')
            .style('left', x + 'px')
            .style('top', y +'px')
            .style('position', 'absolute')
            .text('Participant ID: ' + this.participantID)
            .style('color', 'black');
    }

    closeAllMessage(){
        iziToast.destroy();
    }

    openTextInputPanel() {
        let container = document.getElementById(this.conceptMap.cmapContainerID);
        let width = container.clientWidth * 2 / 5;
        let left = document.body.clientWidth - width - 3;
        document.getElementById("textInputPanel").style.width = width + "px";
        document.getElementById("textInputPanel").style.left = left + "px";
        d3.select('#toggleTextInputPanelButton').text('Close Text Input Panel');
    }

    closeTextInputPanel() {
        document.getElementById("textInputPanel").style.width = "0px";
        document.getElementById("textInputPanel").style.left = document.body.clientWidth + "px";
        d3.select('#toggleTextInputPanelButton').text('Open Text Input Panel');
    }

    importUserGeneratedNetwork(filename){
        let that = this;
        $.getJSON(filename, (d) => {
            let userGeneratedEdges = d.edges;
            let userGeneratedNodes = d.nodes;

            that.conceptMap.nodes.add(userGeneratedNodes);
            that.conceptMap.newNodes.add(userGeneratedNodes);

            let edgeConnectingNewNodes = [];
            for(let i = 0; i < userGeneratedNodes.length; i++){
                let node = userGeneratedNodes[i];
                let connectedNodes = node.connectedNodes;

                for(let j = 0; j < connectedNodes.length; j++){
                    edgeConnectingNewNodes.push({
                        from: node.id,
                        to: connectedNodes[j].id,
                    });
                }
            }
            that.conceptMap.edges.add(edgeConnectingNewNodes);


            for(let i = 0; i < userGeneratedEdges.length; i++){
                let edge = userGeneratedEdges[i];

                if(edge.label.indexOf("positive") !== -1){
                    edge.color = { 
                        color: '#25CF37',
                        highlight: '#25CF37',
                        hover: '#25CF37'
                    }
                }else if(edge.label.indexOf("negative") !== -1){
                    edge.color = { 
                        color: '#FF2222',
                        highlight: '#FF2222',
                        hover: '#FF2222'
                    };
                }
                if(edge.weight){
                    edge.width = ((edge.weight / 100) * 7) + 1; // max: 8, min: 1
                }
                that.conceptMap.edges.add(edge);
                that.conceptMap.newEdges.add(edge);
            }
        })
    }
}

class Clock{
    constructor(){        
        this.timeinterval = null;
        this.startTime = null;
        this.endTime = null;
        this.timeElapsed = null;

        // Flag to indicate whether this class would be used as a stopwatch (true) or timer (false).
        this.stopwatch = true;

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

    resetClock(){
        this.stop();

        this.timeinterval = null;
        this.startTime = null;
        this.endTime = null;
        this.timeElapsed = null;

        // Flag to indicate whether this class would be used as a stopwatch (true) or timer (false).
        this.stopwatch = true;

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

        if(this.stopwatch){
            let durationClone = [];
            let callbackClone = [];
            for(let i = 0; i < this.duration.length; i++){
                durationClone.push(this.duration[i]);
                callbackClone.push(this.callback[i]);
            }
            this.startStopWatch(durationClone, callbackClone);

        } else{            
            if(this.duration.length === 0){
                alert("Duration needs to be set in order to use Clock as a timer.");

            }else{
                let deadlineClone = [];
                let callbackClone = [];
                for(let i = 0; i < this.duration.length; i++){
                    let deadline = new Date(this.startTime + this.duration[i]);
                    deadlineClone.push(deadline);
                    callbackClone.push(this.callback[i]);
                }
                this.startTimer(deadlineClone, callbackClone);
            }
        }
    }

    continue(){
        clearInterval(this.timeinterval);

        // Remove unnecessary callbacks based on the time elapsed
        var reducedDuration = [];
        var reducedCallback = [];
        for(let i = 0; i < this.duration.length; i++){
            if(this.timeElapsed < this.duration[i]){
                reducedDuration.push(this.duration[i]);
                reducedCallback.push(this.callback[i]);
            }
        }
        this.startTime = Date.parse(new Date()) - this.timeElapsed;
        this.endTime = null;
        this.timeElapsed = null;

        if(this.stopwatch){
            this.startStopWatch(reducedDuration, reducedCallback);

        } else{            
            if(reducedDuration.length === 0){
                alert("Deadline already passed!");

            }else{
                let deadlines = [];
                for(let i = 0; i < reducedDuration.length; i++){
                    let deadline = new Date(this.startTime + reducedDuration[i]);
                    deadlines.push(deadline);
                }
                this.startTimer(deadlines, reducedCallback);
            }
        }
    }

    stop(){
        this.endTime = Date.parse(new Date());
        this.timeElapsed = this.endTime - this.startTime;
        clearInterval(this.timeinterval);
    }  

    getTimeRemaining(deadline){
      let t = Date.parse(deadline) - Date.parse(new Date());
      let seconds = Math.floor( (t/1000) % 60 );
      let minutes = Math.floor( t/1000/60 );
      return {
        'total': t,
        'minutes': minutes,
        'seconds': seconds
      };
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

            // Display the result in the element with id="timer"
            document.getElementById("timer").innerHTML = "Elapsed time: " + minutes + "m " + seconds + "s ";
        }

        updateClock(); // run function once at first to avoid delay
        this.timeinterval = setInterval(updateClock, 1000);
    }

    startTimer(endtime, callback){
        let that = this;

        function updateClock(){
            let finalEndtime = null;
            let nextEndtime = null;
            if(Array.isArray(endtime)){
                finalEndtime = endtime[endtime.length-1];
                if(endtime.length > 1){
                    nextEndtime = endtime[0];
                }
            }else{
                finalEndtime = endtime;
            }
            let t = null;
            let t2 = null;
            t = that.getTimeRemaining(finalEndtime);
            if(nextEndtime){
                t2 = that.getTimeRemaining(nextEndtime);
            }
            let minutes = t.minutes;
            let seconds = t.seconds;

            if(t.total <= 0){
                if(callback.length !== 0){
                    callback[callback.length-1]();
                }else{
                    alert("Timer finished!");
                }
                that.stop();
                return;

            }else{
                if(callback.length > 1 && t2 !== null){
                    if(t2.total <= 0){
                        callback[0]();
                        callback.splice(0,1);
                        endtime.splice(0,1);
                    }
                }
            }
            // Display the result in the element with id="timer"
            document.getElementById("timer").innerHTML = "Time remaining: " + minutes + "m " + seconds + "s ";
        }

        updateClock(); // run function once at first to avoid delay
        this.timeinterval = setInterval(updateClock, 1000);
    }
}



