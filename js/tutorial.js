var EXPERIMENT_TUTORIAL_START = "tutorial_start";
var EXPERIMENT_TUTORIAL_EVENT = "tutorial_event";

class Tutorial{
    constructor(conceptMap, experiment){
        this.intro = introJs();
        this.intro._options.exitOnOverlayClick = false;
        this.introjs_nextButton_callback = null;

        this.conceptMap = conceptMap;
        this.experiment = experiment;
        this.network = conceptMap.network;

        // Tutorial context setup
        this.current_step = null; 
        this.max_visited_step = -1;
        this.event_subscription = null;
        this.progress_keyword = null;

        PubSub.subscribe(EXPERIMENT_TUTORIAL_START, () => {
            this.startTutorial();
        });

        loadTutorialContent();
    }

    startTutorial(){
        // Close all existing intro messages
        this.intro.exit();

        // Set the tutorial content and start
        this.setTutorialContent(this.experiment.stage, this.progress_keyword);

        d3.select("#helpButton").node().disabled = false;
        d3.selectAll('#helpButton').on('click', (d) => { 
            this.setTutorialContent(this.experiment.stage, this.progress_keyword);
        }); 
    }

    setTutorialContent(stage, progressKeyword){
        let that = this;
        let objects, contents, classname, onChangeCallback, onExitCallback;
        objects = [];
        contents = [];
        classname = 'introJsTooltipLarge';
        onChangeCallback = function(){
            return undefined;
        };
        onExitCallback = function(){
            return undefined;
        }

        // Initialize the list of visitied steps
        this.max_visited_step = -1;

        let stageContent = [];
        if(stage === 'prior_knowledge_task' || typeof stage === 'undefined' || stage == null){
            stageContent = this.getContentsHavingKeyword(TUTORIAL_CONTENT, "tutorial");
        } else if(stage === "learning_task"){
            stageContent = this.getContentsHavingKeyword(TUTORIAL_CONTENT, "learning_task");
        } else if(stage === "problem_solving_task"){
            stageContent = this.getContentsHavingKeyword(TUTORIAL_CONTENT, "problem_solving_task");
        }

        // Update the target object
        this.updateContentObject(stageContent, "tutorial-add-edge-mode-two-concepts-clicked", document.getElementsByClassName("iziToast-capsule")[0]);
        this.updateContentObject(stageContent, "tutorial-add-edge-mode-custom-relation-2", document.getElementsByClassName("iziToast-capsule")[0]);
        this.updateContentObject(stageContent, "tutorial-add-edge-mode-intro", document.getElementById("networkEditModeDisplay"));
        this.updateContentObject(stageContent, "tutorial-add-new-concept-3", document.getElementsByClassName("iziToast-capsule")[0]);

        onChangeCallback = function(targetElement) {
            that.enable_introjs_nextButton();
            that.current_step = this._currentStep;
            that.progress_keyword = stageContent[this._currentStep].name;

            let skipPrevStep = false;  
            if(this._currentStep !== 0){
                if(stageContent[this._currentStep - 1].name.indexOf("_delay_") !== -1){
                    skipPrevStep = true;
                }
            }
            that.set_introjs_moveButtonCallback(this._currentStep, skipPrevStep);

            // Update max_visited_step
            if(that.max_visited_step < this._currentStep){
                that.max_visited_step = this._currentStep;
            }

            if(stageContent[this._currentStep].showSkipButton){
                $('.introjs-skipbutton').show();
            } else if(this._introItems.length - 1 === this._currentStep || this._introItems.length === 1){
                $('.introjs-skipbutton').show();
            } else{
                $('.introjs-skipbutton').hide();
            }

            if(stageContent[this._currentStep].onChangeCallback){
                stageContent[this._currentStep].onChangeCallback(this._currentStep);
            }
        }

        onExitCallback = function(targetElement) {
            if(stageContent[this._currentStep]){
                if(stageContent[this._currentStep].onExitCallback){
                    stageContent[this._currentStep].onExitCallback(this._currentStep);
                }
            }   
        }

        let progress = null;
        for(let i = 0; i < stageContent.length; i++){
            if(progressKeyword){
                if(stageContent[i].name === progressKeyword){
                    progress = i + 1;
                }
            }
            objects.push(stageContent[i].object);
            contents.push(stageContent[i].content);
        }  

        this.startIntro(objects, contents, classname, onChangeCallback, onExitCallback, stage, progress);
    }

    startIntro(objects, messages, classname, onChangeCallback, onExitCallback, stage, progress){
        if(typeof stage === "undefined" || stage == null){
            stage = this.experiment.stage;
        }

        this.intro.setOption('showButtons', true)
                    .setOption('showBullets', true);
        
        if(!classname){
            classname = 'introJsTooltip';
        }
        
        let steps = [];
        let last_object = null;
        for(let i = 0; i < messages.length; i++){
            if(!objects){
                steps.push({intro:messages[i]});

            }else{
                if(typeof objects[i] === "undefined"){
                    steps.push({intro:messages[i]});

                } else if(!objects[i]){
                    if(!last_object){
                        steps.push({intro:messages[i]});
                    }else{
                        steps.push({element:last_object, intro:messages[i]});
                    }
                }else{
                    last_object = objects[i];
                    steps.push({element:objects[i], intro:messages[i]});
                }
            }
        }

        this.intro.setOptions({steps:steps, tooltipClass:classname})
            .setOption('showProgress', true)
            .onchange(onChangeCallback)
            .onexit(onExitCallback)
            .start(); 

        let that = this;
        d3.select('.introjs-skipbutton')
                .text(() => {
                    if(stage === "prior_knowledge_task"){
                        return "START TASK";
                    }else if(stage === "learning_task"){
                        return "START TASK";
                    }else if(stage === "problem_solving_task"){
                        return "DONE";
                    }else{
                        return "DONE"
                    }
                })
                .style('color','red');

        // Disable SKIP button until it reaches the last step
        if(messages.length > 1){
            $('.introjs-skipbutton').hide();
        }
        this.intro.onafterchange(function(){   
            if(this._introItems.length - 1 === this._currentStep && this._introItems.length > 1){
                // Last
                d3.select('.introjs-skipbutton')
                    .text(() => {
                        if(stage === "prior_knowledge_task"){
                            return "START TASK";
                        }else if(stage === "learning_task"){
                            return "START TASK";
                        }else if(stage === "problem_solving_task"){
                            return "DONE";
                        }else{
                            return "DONE"
                        }
                    })
                    .style('color','red');

            } else{
                d3.select('.introjs-skipbutton')
                    .text("Close this message")
                    .style('color','red');
            }
        });

        this.intro.oncomplete(function() {    
            that.intro.onexit(()=>{});
            that.intro.exit();
            that.experiment.startStage();
        });

        if(progress){
            this.intro.goToStep(progress);
        }
    }

    startTutorialEventListener(eventKeyword, targetStep, callback){
        let that = this;

        if(typeof callback === "undefined"){
            callback = () => {
                // Intro is closed
                if(typeof that.intro._currentStep === "undefined"){
                    that.intro.exit();
                    let temp = that.current_step + 1 + 1;
                    that.intro.start().goToStep(temp);
                } else {
                    that.intro.nextStep();
                }
            }
        }

        if(this.max_visited_step > targetStep){
            // this.enable_introjs_nextButton();
            this.disable_introjs_nextButton();
        }else{
            this.disable_introjs_nextButton();
        }

        if(this.event_subscription){
            PubSub.unsubscribe(this.event_subscription);
        }

        this.event_subscription = PubSub.subscribe(EXPERIMENT_TUTORIAL_EVENT, function(msg, data){
            if(eventKeyword === data){
                if(that.current_step === targetStep){

                    // Intro is closed
                    if(typeof that.intro._currentStep !== "undefined"){
                        that.enable_introjs_nextButton();
                    }

                    if(callback){
                        callback();
                    }
                }
            }
        });
    }

    exit(){
        this.intro.exit();
        this.stopTimer();
    }

    skipTutorial(){
        this.exit();

        // Start the first task
        iziToast.destroy();

        this.experiment.startStage();
    }

    disable_introjs_nextButton(){
        this.introjs_nextButton_callback = $('.introjs-nextbutton').get(0).onclick
        $('.introjs-nextbutton').addClass('introjs-disabled');
        $('.introjs-nextbutton').get(0).onclick = null;
        d3.select('.introjs-nextbutton').style('opacity','0.55');
    }

    enable_introjs_nextButton(){
        if(this.introjs_nextButton_callback && $('.introjs-nextbutton').get(0)){
            $('.introjs-nextbutton').removeClass('introjs-disabled');
            $('.introjs-nextbutton').get(0).onclick = this.introjs_nextButton_callback;
            d3.select('.introjs-nextbutton').style('opacity','1.0');
            this.introjs_nextButton_callback = null;
        }
    }

    set_introjs_moveButtonCallback(currentStep, skipPrevStep){
        if(!$('.introjs-nextbutton').get(0) || !$('.introjs-prevbutton').get(0)){
            return;
        }
        let that = this;
        let nextStep = currentStep + 1;
        let prevStep = currentStep - 1;
        if(skipPrevStep){
            prevStep = prevStep - 1;
        }
        let max = this.intro._introItems.length - 1;
        let min = 0;

        if(currentStep !== max){
            $('.introjs-nextbutton').get(0).onclick = () => {
                that.intro.goToStepNumber(nextStep + 1);
            }            
        }

        if(currentStep !== min){
            $('.introjs-prevbutton').get(0).onclick = () => {
                that.intro.goToStepNumber(prevStep + 1);
            }            
        }
    }

    filterContentByKeyword(content, keyword){
        let out = [];
        if(Array.isArray(keyword)){
            for(let i = 0; i < content.length; i++){
                let containsKeyword = false;
                for(let j = 0; j < keyword.length; j++){
                    if(content[i].name.indexOf(keyword[j]) !== -1){
                        containsKeyword = true;
                        break;
                    }
                }
                if(!containsKeyword){
                    out.push(content[i]);
                }
            }
        }else{
            for(let i = 0; i < content.length; i++){
                if(content[i].name.indexOf(keyword) === -1){
                    out.push(content[i]);
                }
            }
        }
        return out;
    }

    getContentsHavingKeyword(contents, keyword){
        let out = [];
        for(let i = 0; i < contents.length; i++){
            if(contents[i].name.indexOf(keyword) !== -1){
                out.push(contents[i]);
            }
        }
        return out;
    }

    findContentByKeyword(contents, keyword){
        let out = null;
        for(let i = 0; i < contents.length; i++){
            if(contents[i].name === keyword){
                out = contents[i];
            }
        }
        return out;
    }

    updateContentObject(contents, keyword, object){
        let content = this.findContentByKeyword(contents, keyword);
        if(content){
            content.object = object;
        }
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

