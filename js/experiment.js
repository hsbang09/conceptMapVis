
var exampleParticipantID = "0497289903001004819-5_21_10_45";

class Experiment{

    constructor(){
        this.participantID = null;
        // Experiment stages: 
        //      - 0: Concept mapping before any interaction
        //      - 1: Concept mapping during interaction
        //      - 2: Problem solving (no modifiication allowed)
        this.experimentStage = -1; 

        let that = this;
        d3.selectAll('#submitButton').on('click', (d) => { 
            var submit = confirm("Are you sure you want to submit the result?"); 
            if(submit){
                // download the result file
                that.endStage();
            }
        }); 
    }

    endStage(){
        this.clock.stop();
        this.saveNetwork();
        this.generateSignInMessage();
    }

    startNextStage(){
        let that = this;
        that.experimentStage += 1;
        var callback = [];
        var duration = [];
        var timeLimitExists = false;

        if(this.experimentStage === 0){
            timeLimitExists = true;

            var d1 = 8 * 60 * 1000;
            var callback1 = () => {
                alert("8 minutes passed! You have 2 more minutes to finish up. If you are finished, you can click the submit button below.");
            };
            var d2 = 10 * 60 * 1000;
            var callback2 = () => {
                alert("End of the session");
                that.endStage();
            };

            // Set callback functions
            callback = [callback1, callback2];
            duration = [d1, d2];

        }else if(this.experimentStage === 1){
            timeLimitExists = false;

            // remove all newly added edges and nodes
            let edgesToRemove = newEdges.clear();
            edges.remove(edgesToRemove);

            let nodesToRemove = newNodes.clear();
            nodes.remove(nodesToRemove);

        }else{
            timeLimitExists = false;

            // Disable adding or modifying edges
            setAddEdgeMode(false);
            setAddNodeMode(false);
            contextMenu = null;
            document.getElementById('networkContainer').removeEventListener('contextmenu', contextMenuEventListener);
            document.getElementById('networkContainer').addEventListener('contextmenu', (e) => {
                e.preventDefault();
                iziToast.warning({
                    title: 'Modifying edges is disabled for this part of the experiment',
                    message: '',
                });
            }, false);
        }

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
        this.clock.stop();
    }

    saveNetwork(){
        var out = {};

        out.participantID = this.participantID;
        out.stage = this.experimentStage;

        var timeElapsedInMiliSec = this.clock.getTimeElapsed();
        out.timeElapsed = timeElapsedInMiliSec / 1000;

        var edgesOut = [];
        newEdges.forEach((d)=>{
            let edgeCopy = JSON.parse(JSON.stringify(d));
            let fromNodeLabel = getNodeLabel(d.from);
            let toNodeLabel = getNodeLabel(d.to);
            edgeCopy.fromLabel = fromNodeLabel;
            edgeCopy.toLabel = toNodeLabel;
            edgeCopy.color = undefined;
            edgesOut.push(edgeCopy);
        })
        out.edges = edgesOut;

        var nodesOut = [];
        newNodes.forEach((d) => {
            var nodeCopy = JSON.parse(JSON.stringify(d));
            nodeCopy.connectedNodes = [];

            edges.forEach((d) => {
                let connectedNode = null;
                if(d.from === nodeCopy.id){
                    connectedNode = nodes.get(d.to);
                }else if( d.to === nodeCopy.id){
                    connectedNode = nodes.get(d.from);
                }
                if(connectedNode){
                    nodeCopy.connectedNodes.push(connectedNode);
                }
            })
            nodesOut.push(nodeCopy);
        })
        out.nodes = nodesOut;

        var filename = this.participantID + "-" + this.experimentStage + ".json";
        this.saveTextAsFile(filename, JSON.stringify(out));
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
        var container = document.getElementById('networkContainer');
        var width = container.clientWidth;
        var offset = 6;
        var x = + width - 345;
        var y = + offset;
        d3.select('#networkContainer')
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

    generateSignInMessage(){
        let that = this;

        var textInput = '<input type="text" style="width: 300px">';
        var buttonStyle = "width: 80px;" 
                        + "margin-left: 10px"
                        + "margin-right: 10px"
                        + "float: left;";

        var title, message, submitCallback;
        if(this.experimentStage === -1){
            title = "Copy and paste the participant ID";
            message = "(provided in the top-right corner of the tutorial page)";
            submitCallback = function (instance, toast, button, event, inputs) {
                    
                var inputParticipantID = inputs[0].value;
                var valid = true;

                if(inputParticipantID.indexOf("004819") === -1){
                    valid = false;
                }

                var count = 0;
                for(let i = 0; i < inputParticipantID.length; i++){
                    if(inputParticipantID[i] === "_"){
                        count += 1;
                    }
                }
                if(count !== 3){
                    valid = false;
                }

                if(valid){
                    that.startNextStage();
                    that.participantID = inputParticipantID;
                    that.displayParticipantID(inputParticipantID);
                    instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');

                }else{
                    that.generateErrorMessage("Invalid participant ID. Please copy and paste the particpant ID from the tutorial page");
                }
            }
        }else{
            title = "To continue, type in a passcode";
            message = "(Please ask the experimenter to provide the passcode)";
            submitCallback = function (instance, toast, button, event, inputs) {

                var input = inputs[0].value;
                if(input === "qkdgustmd"){
                    that.startNextStage();
                    instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');

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



