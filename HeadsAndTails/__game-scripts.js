pc.extend(pc,function(){var TweenManager=function(t){this._app=t,this._tweens=[],this._add=[]};TweenManager.prototype={add:function(t){return this._add.push(t),t},update:function(t){for(var i=0,e=this._tweens.length;i<e;)this._tweens[i].update(t)?i++:(this._tweens.splice(i,1),e--);if(this._add.length){for(let t=0;t<this._add.length;t++)this._tweens.indexOf(this._add[t])>-1||this._tweens.push(this._add[t]);this._add.length=0}}};var Tween=function(t,i,e){pc.events.attach(this),this.manager=i,e&&(this.entity=null),this.time=0,this.complete=!1,this.playing=!1,this.stopped=!0,this.pending=!1,this.target=t,this.duration=0,this._currentDelay=0,this.timeScale=1,this._reverse=!1,this._delay=0,this._yoyo=!1,this._count=0,this._numRepeats=0,this._repeatDelay=0,this._from=!1,this._slerp=!1,this._fromQuat=new pc.Quat,this._toQuat=new pc.Quat,this._quat=new pc.Quat,this.easing=pc.Linear,this._sv={},this._ev={}},_parseProperties=function(t){var i;return t instanceof pc.Vec2?i={x:t.x,y:t.y}:t instanceof pc.Vec3?i={x:t.x,y:t.y,z:t.z}:t instanceof pc.Vec4||t instanceof pc.Quat?i={x:t.x,y:t.y,z:t.z,w:t.w}:t instanceof pc.Color?(i={r:t.r,g:t.g,b:t.b},void 0!==t.a&&(i.a=t.a)):i=t,i};Tween.prototype={to:function(t,i,e,s,n,r){return this._properties=_parseProperties(t),this.duration=i,e&&(this.easing=e),s&&this.delay(s),n&&this.repeat(n),r&&this.yoyo(r),this},from:function(t,i,e,s,n,r){return this._properties=_parseProperties(t),this.duration=i,e&&(this.easing=e),s&&this.delay(s),n&&this.repeat(n),r&&this.yoyo(r),this._from=!0,this},rotate:function(t,i,e,s,n,r){return this._properties=_parseProperties(t),this.duration=i,e&&(this.easing=e),s&&this.delay(s),n&&this.repeat(n),r&&this.yoyo(r),this._slerp=!0,this},start:function(){var t,i,e,s;if(this.playing=!0,this.complete=!1,this.stopped=!1,this._count=0,this.pending=this._delay>0,this._reverse&&!this.pending?this.time=this.duration:this.time=0,this._from){for(t in this._properties)this._properties.hasOwnProperty(t)&&(this._sv[t]=this._properties[t],this._ev[t]=this.target[t]);this._slerp&&(this._toQuat.setFromEulerAngles(this.target.x,this.target.y,this.target.z),i=void 0!==this._properties.x?this._properties.x:this.target.x,e=void 0!==this._properties.y?this._properties.y:this.target.y,s=void 0!==this._properties.z?this._properties.z:this.target.z,this._fromQuat.setFromEulerAngles(i,e,s))}else{for(t in this._properties)this._properties.hasOwnProperty(t)&&(this._sv[t]=this.target[t],this._ev[t]=this._properties[t]);this._slerp&&(i=void 0!==this._properties.x?this._properties.x:this.target.x,e=void 0!==this._properties.y?this._properties.y:this.target.y,s=void 0!==this._properties.z?this._properties.z:this.target.z,void 0!==this._properties.w?(this._fromQuat.copy(this.target),this._toQuat.set(i,e,s,this._properties.w)):(this._fromQuat.setFromEulerAngles(this.target.x,this.target.y,this.target.z),this._toQuat.setFromEulerAngles(i,e,s)))}return this._currentDelay=this._delay,this.manager.add(this),this},pause:function(){this.playing=!1},resume:function(){this.playing=!0},stop:function(){this.playing=!1,this.stopped=!0},delay:function(t){return this._delay=t,this.pending=!0,this},repeat:function(t,i){return this._count=0,this._numRepeats=t,this._repeatDelay=i||0,this},loop:function(t){return t?(this._count=0,this._numRepeats=1/0):this._numRepeats=0,this},yoyo:function(t){return this._yoyo=t,this},reverse:function(){return this._reverse=!this._reverse,this},chain:function(){for(var t=arguments.length;t--;)t>0?arguments[t-1]._chained=arguments[t]:this._chained=arguments[t];return this},update:function(t){if(this.stopped)return!1;if(!this.playing)return!0;if(!this._reverse||this.pending?this.time+=t*this.timeScale:this.time-=t*this.timeScale,this.pending){if(!(this.time>this._currentDelay))return!0;this._reverse?this.time=this.duration-(this.time-this._currentDelay):this.time-=this._currentDelay,this.pending=!1}var i=0;(!this._reverse&&this.time>this.duration||this._reverse&&this.time<0)&&(this._count++,this.complete=!0,this.playing=!1,this._reverse?(i=this.duration-this.time,this.time=0):(i=this.time-this.duration,this.time=this.duration));var e,s,n=0===this.duration?1:this.time/this.duration,r=this.easing(n);for(var h in this._properties)this._properties.hasOwnProperty(h)&&(e=this._sv[h],s=this._ev[h],this.target[h]=e+(s-e)*r);if(this._slerp&&this._quat.slerp(this._fromQuat,this._toQuat,r),this.entity&&(this.entity._dirtifyLocal(),this.element&&this.entity.element&&(this.entity.element[this.element]=this.target),this._slerp&&this.entity.setLocalRotation(this._quat)),this.fire("update",t),this.complete){var a=this._repeat(i);return a?this.fire("loop"):(this.fire("complete",i),this.entity&&this.entity.off("destroy",this.stop,this),this._chained&&this._chained.start()),a}return!0},_repeat:function(t){if(this._count<this._numRepeats){if(this._reverse?this.time=this.duration-t:this.time=t,this.complete=!1,this.playing=!0,this._currentDelay=this._repeatDelay,this.pending=!0,this._yoyo){for(var i in this._properties){var e=this._sv[i];this._sv[i]=this._ev[i],this._ev[i]=e}this._slerp&&(this._quat.copy(this._fromQuat),this._fromQuat.copy(this._toQuat),this._toQuat.copy(this._quat))}return!0}return!1}};var BounceOut=function(t){return t<1/2.75?7.5625*t*t:t<2/2.75?7.5625*(t-=1.5/2.75)*t+.75:t<2.5/2.75?7.5625*(t-=2.25/2.75)*t+.9375:7.5625*(t-=2.625/2.75)*t+.984375},BounceIn=function(t){return 1-BounceOut(1-t)};return{TweenManager:TweenManager,Tween:Tween,Linear:function(t){return t},QuadraticIn:function(t){return t*t},QuadraticOut:function(t){return t*(2-t)},QuadraticInOut:function(t){return(t*=2)<1?.5*t*t:-.5*(--t*(t-2)-1)},CubicIn:function(t){return t*t*t},CubicOut:function(t){return--t*t*t+1},CubicInOut:function(t){return(t*=2)<1?.5*t*t*t:.5*((t-=2)*t*t+2)},QuarticIn:function(t){return t*t*t*t},QuarticOut:function(t){return 1- --t*t*t*t},QuarticInOut:function(t){return(t*=2)<1?.5*t*t*t*t:-.5*((t-=2)*t*t*t-2)},QuinticIn:function(t){return t*t*t*t*t},QuinticOut:function(t){return--t*t*t*t*t+1},QuinticInOut:function(t){return(t*=2)<1?.5*t*t*t*t*t:.5*((t-=2)*t*t*t*t+2)},SineIn:function(t){return 0===t?0:1===t?1:1-Math.cos(t*Math.PI/2)},SineOut:function(t){return 0===t?0:1===t?1:Math.sin(t*Math.PI/2)},SineInOut:function(t){return 0===t?0:1===t?1:.5*(1-Math.cos(Math.PI*t))},ExponentialIn:function(t){return 0===t?0:Math.pow(1024,t-1)},ExponentialOut:function(t){return 1===t?1:1-Math.pow(2,-10*t)},ExponentialInOut:function(t){return 0===t?0:1===t?1:(t*=2)<1?.5*Math.pow(1024,t-1):.5*(2-Math.pow(2,-10*(t-1)))},CircularIn:function(t){return 1-Math.sqrt(1-t*t)},CircularOut:function(t){return Math.sqrt(1- --t*t)},CircularInOut:function(t){return(t*=2)<1?-.5*(Math.sqrt(1-t*t)-1):.5*(Math.sqrt(1-(t-=2)*t)+1)},BackIn:function(t){var i=1.70158;return t*t*((i+1)*t-i)},BackOut:function(t){var i=1.70158;return--t*t*((i+1)*t+i)+1},BackInOut:function(t){var i=2.5949095;return(t*=2)<1?t*t*((i+1)*t-i)*.5:.5*((t-=2)*t*((i+1)*t+i)+2)},BounceIn:BounceIn,BounceOut:BounceOut,BounceInOut:function(t){return t<.5?.5*BounceIn(2*t):.5*BounceOut(2*t-1)+.5},ElasticIn:function(t){var i,e=.1;return 0===t?0:1===t?1:(!e||e<1?(e=1,i=.1):i=.4*Math.asin(1/e)/(2*Math.PI),-e*Math.pow(2,10*(t-=1))*Math.sin((t-i)*(2*Math.PI)/.4))},ElasticOut:function(t){var i,e=.1;return 0===t?0:1===t?1:(!e||e<1?(e=1,i=.1):i=.4*Math.asin(1/e)/(2*Math.PI),e*Math.pow(2,-10*t)*Math.sin((t-i)*(2*Math.PI)/.4)+1)},ElasticInOut:function(t){var i,e=.1,s=.4;return 0===t?0:1===t?1:(!e||e<1?(e=1,i=.1):i=s*Math.asin(1/e)/(2*Math.PI),(t*=2)<1?e*Math.pow(2,10*(t-=1))*Math.sin((t-i)*(2*Math.PI)/s)*-.5:e*Math.pow(2,-10*(t-=1))*Math.sin((t-i)*(2*Math.PI)/s)*.5+1)}}}()),function(){pc.Application.prototype.addTweenManager=function(){this._tweenManager=new pc.TweenManager(this),this.on("update",(function(t){this._tweenManager.update(t)}))},pc.Application.prototype.tween=function(t){return new pc.Tween(t,this._tweenManager)},pc.Entity.prototype.tween=function(t,i){var e=this._app.tween(t);return e.entity=this,this.once("destroy",e.stop,e),i&&i.element&&(e.element=i.element),e},pc.Entity.prototype.localMoveTo=function(t,i,e=pc.QuadraticOut){return this.tween(this.getLocalPosition()).to(t,i,e).start()},pc.Entity.prototype.localMoveBy=function(t,i,e=pc.SineOut){return this.tween(this.getLocalPosition()).by(t,i,e).start()},pc.Entity.prototype.moveTo=function(t,i){return this.tween(this.getPosition()).to(t,i,pc.SineOut).start()},pc.Entity.prototype.moveBy=function(t,i){return this.tween(this.getPosition()).by(t,i,pc.SineOut).start()},pc.Entity.prototype.rotateTo=function(t,i,e=pc.CircularOut){return this.tween(this.getLocalEulerAngles()).rotate(t,i,e).start()},pc.Entity.prototype.setOpacity=function(t){this.element&&(this.element.material,this.element.opacity=t)},pc.Entity.prototype.setOpacityCascade=function(t){this.setOpacity(t);for(let i=0;i<this.children.length;i++)this.children[i].setOpacityCascade&&this.children[i].setOpacityCascade(t)},pc.Entity.prototype.opacityToCascade=function(t,i,e){let s={v:t};return this.setOpacityCascade(t),this.tween(s).to({v:i},e,pc.SineOut).on("update",(()=>{this.setOpacityCascade(s.v)})).start()},pc.Entity.prototype.opacityTo=function(t,i,e){if(!this.element.material)return;let s={v:t};return this.setOpacity(t),this.tween(s).to({v:i},e,pc.SineOut).on("update",(()=>{this.setOpacity(s.v)})).start()},pc.Entity.prototype.setTextureFromURL=function(t){let i="t_"+t,e=pc.app.assets.find(i,"texture");if(null===e){pc.app.loader.getHandler("texture").crossOrigin="anonymous";var s=new pc.Asset(i,"texture",{url:t});pc.app.assets.add(s),s.on("load",(t=>{this.element.texture=t.resource})),pc.app.assets.load(s)}else this.element.texture=e.resource},pc.Entity.prototype.blink=function(t,i,e,s){for(let n=0;n<s;n++)setTimeout((()=>{this.setOpacity(t)}),e*n*2),setTimeout((()=>{this.setOpacity(i)}),e*(2*n+1))};var t=pc.Application.getApplication();t&&t.addTweenManager()}();var Background=pc.createScript("background");Background.attributes.add("startPosX",{type:"number",default:1}),Background.attributes.add("endPosX",{type:"number",default:1}),Background.attributes.add("durationTime",{type:"number",default:1}),Background.prototype.initialize=function(){this.entity.setLocalPosition(this.startPosX,0,0),this.tween=this.entity.tween(this.entity.getLocalPosition()).to(new pc.Vec3(this.endPosX,0,0),this.durationTime,pc.Linear).loop(!0).yoyo(!0),this.tween.start()};var UserBalance=pc.createScript("userBalance");UserBalance.attributes.add("userBalanceText",{type:"entity"}),UserBalance.attributes.add("userName",{type:"entity"}),UserBalance.prototype.initialize=function(){UserBalance.instance=this,this.userBalance=0},UserBalance.prototype.setUserName=function(e){this.userName.element.text=e},UserBalance.prototype.getUserBalance=function(){return this.userBalance},UserBalance.prototype.setBalance=function(e){this.userBalance=e;let t={value:Number(this.userBalanceText.element.text)},a=this.userBalanceText.element,n=this.entity.tween(t).to({value:e},.3,pc.Linear);n.on("update",(function(e){let n=parseFloat(t.value.toFixed(0));a.text=`${n}`})),n.start()},UserBalance.prototype.update=function(e){};var DummyServer=pc.createScript("dummyServer");DummyServer.prototype.initialize=function(){DummyServer.instance=this,this.betAmount=-1,this.userBalance=0,this.openCard=null,this.hiddenCard=null},DummyServer.prototype.login=async function(){return this.userBalance=getRandomInt(1e3,5e3),{id:"UserName",balance:this.userBalance}},DummyServer.prototype.startGame=function(e){return this.betAmount=e,this.userBalance=this.userBalance-this.betAmount,{balance:this.userBalance,betAmount:this.betAmount}},DummyServer.prototype.betGame=function(e){let t=getRandomInt(0,10)<=4,n=t===e,r=0;return n?(this.userBalance=this.userBalance+2*this.betAmount,r=this.betAmount):r=-this.betAmount,{balance:this.userBalance,betAmount:this.betAmount,profit:r,result:t,isWin:n}},DummyServer.prototype.endGame=function(e,t){let n=0,r=0;0===e?(n=this.getMultiplier(),r=this.betAmount*n,this.userBalance=this.userBalance+r):1===e&&(r=this.betAmount,this.userBalance=this.userBalance+r);let a={isWin:e,lastNum:t,multiplier:n,balance:this.userBalance,profit:r};return GameController.instance.endGame(a),a},DummyServer.prototype.update=function(e){};var GlobalFunction=pc.createScript("globalFunction");function getRandomInt(e,r){return e=Math.ceil(e),r=Math.floor(r),Math.floor(Math.random()*(r-e))+e}var CardType={Bananas:0,Strawberries:1,Limes:2,Plums:3},CardNumber={One:1,Two:2,Three:3,Four:4,Five:5,Six:6};function shuffle(e){var r,o,t;for(t=e.length-1;t>0;t--)r=Math.floor(Math.random()*(t+1)),o=e[t],e[t]=e[r],e[r]=o;return e}function getDeck(){let e=[],r=Object.values(JSON.parse(JSON.stringify(CardType))),o=Object.values(JSON.parse(JSON.stringify(CardNumber)));for(const t of r)for(const r of o){let o={type:t,number:r};e.push(o)}return e}function getDeck(){let e=[],r=Object.values(JSON.parse(JSON.stringify(CardType))),o=Object.values(JSON.parse(JSON.stringify(CardNumber)));for(const t of r)for(const r of o){let o={type:t,number:r};e.push(o)}return e}function getSelectedColor(){return rgbToColor(154,117,244,255)}function getOColor(){return new pc.Color(1,1,1,1)}function getEColor(){return new pc.Color(1,1,1,1)}function getQColor(){return new pc.Color(1,1,1,1)}function setButton(e,r,o){e.element.on("touchend",r,o),e.element.on("mouseup",r,o)}function rgbToColor(e,r,o,t){return new pc.Color(e/255,r/255,o/255,t/255)}var CardFront=pc.createScript("cardFront");CardFront.attributes.add("numberImage",{type:"entity",array:!0}),CardFront.attributes.add("isRedDice",{type:"boolean"}),CardFront.prototype.initialize=function(){this.numPattern=[],this.numPattern.push([3]),this.numPattern.push([0,6]),this.numPattern.push([0,3,6]),this.numPattern.push([0,1,5,6]),this.numPattern.push([0,1,3,5,6]),this.numPattern.push([0,1,2,4,5,6])},CardFront.prototype.disableAllNumber=function(){this.numberImage.forEach((t=>t.enabled=!1))},CardFront.prototype.setCardNumber=function(t){this.disableAllNumber(),this.numPattern[t-1].forEach((t=>this.numberImage[t].enabled=!0))},CardFront.prototype.setCard=function(t){this.isRedDice?AudioController.instance.playSound("redDice"):AudioController.instance.playSound("blueDice"),this.setCardNumber(t)};async function loadJsonFromUrl(n){return new Promise((e=>{this.loadJsonFromRemote(n,(function(n){console.log(n);let o=JSON.stringify(n),s=JSON.parse(o);e(s)}))}))}async function loadJsonFromRemote(n,e){var o=new XMLHttpRequest;o.addEventListener("load",(function(){e(JSON.parse(this.response))})),o.open("GET",n),o.send()}async function delay(n){return new Promise((e=>setTimeout((()=>{e(n)}),n)))}var Middle=pc.createScript("middle");Middle.attributes.add("coinGroup",{type:"entity"}),Middle.attributes.add("tail",{type:"entity"}),Middle.prototype.initialize=function(){Middle.instance=this,this.idleTimer=null,this.rotTween=null,this.isRot=!1,this.needStop=!1,this.stopX=0,this.rot=0,this.rot2=10,this.du=.1,this.cal=0,this.isHead=!0},Middle.prototype.update=function(t){!1!==this.isRot&&(this.cal+=t,this.cal>this.du&&(this.cal=0,this.isHead=!this.isHead,this.tail.enabled=!this.isHead,this.playCoinSound()))},Middle.prototype.playCoinSound=function(){let t="coin"+getRandomInt(1,6);AudioController.instance.playSound(t)},Middle.prototype.startRotation=async function(t){this.cal=0,this.isRot=!0;let i=getRandomInt(1500,2e3);await delay(i),this.isRot=!1,this.tail.enabled===t&&(await delay(100),this.tail.enabled=!t,this.playCoinSound())},Middle.prototype.finishRotation=function(t){},Middle.prototype.doAction=function(t){},Middle.prototype.numberToText=function(t){},Middle.prototype.setIdle=function(){AudioController.instance.playSound("Open")},Middle.prototype.setReady=function(){clearTimeout(this.idleTimer)},Middle.prototype.setOpenCard=function(t){AudioController.instance.playSound("Open")},Middle.prototype.setHiddenCard=function(t){AudioController.instance.playSound("Open")},Middle.prototype.setResultText=function(t){AudioController.instance.playSound("Open")};var Card=pc.createScript("card");Card.attributes.add("cardRoot",{type:"entity"}),Card.attributes.add("cardFront",{type:"entity"}),Card.attributes.add("cardTypeText",{type:"entity"}),Card.prototype.initialize=function(){this.readyTimer=null,this.prevNumber=-1},Card.prototype.setCard=function(t){clearTimeout(this.readyTimer),this.cardRoot.setLocalEulerAngles(0,0,0),this.cardTypeText.element.text=t,this.cardFront.script.cardFront.setCard(t),this.prevNumber=t},Card.prototype.getNextNum=function(){let t=this.prevNumber;for(;this.prevNumber===t;)t=getRandomInt(1,7);return t},Card.prototype.setReady=function(){clearTimeout(this.readyTimer),this.cardTypeText.element.text="?",this.readyTimer=setTimeout((()=>{let t=this.getNextNum();this.cardFront.script.cardFront.setCard(t),this.setReady()}),100)};var GameController=pc.createScript("gameController");GameController.prototype.initialize=function(){GameController.instance=this},GameController.prototype.postInitialize=function(){this.init(),this.setIdle()},GameController.prototype.init=async function(){let e=await DummyServer.instance.login();console.log(e),UserBalance.instance.setBalance(e.balance),UserBalance.instance.setUserName(e.id)},GameController.prototype.betStart=function(){BetController.instance.reset(),Middle.instance.setReady(),Bottom.instance.setBet()},GameController.prototype.startGame=async function(e,t){Middle.instance.setReady(),Bottom.instance.setStartGame();let n=DummyServer.instance.startGame(e,t);UserBalance.instance.setBalance(n.balance);let a=DummyServer.instance.betGame(t);await Middle.instance.startRotation(a.result),await delay(500),Bottom.instance.setResultGame(a.isWin),await delay(1500),UserBalance.instance.setBalance(a.balance),await delay(500),Bottom.instance.setProfit(a.profit),Bottom.instance.setIdle()},GameController.prototype.betGame=function(e){console.log("betGame",result),setTimeout((()=>{Middle.instance.setOpenCard(result.openCard.number),setTimeout((()=>{Middle.instance.setHiddenCard(result.hiddenCard.number),setTimeout((()=>{result.hiddenCard.number,result.openCard.number;Middle.instance.setResultText(result.result),Bottom.instance.setResultGame(result.isWin),setTimeout((()=>{UserBalance.instance.setBalance(result.balance),setTimeout((()=>{Middle.instance.setReady(),this.setIdle()}),3e3)}),1e3)}),700)}),1e3)}),1e3)},GameController.prototype.setIdle=function(){Middle.instance.setIdle(),Bottom.instance.setIdle()};var Bottom=pc.createScript("bottom");Bottom.attributes.add("winResult",{type:"entity"}),Bottom.attributes.add("loseResult",{type:"entity"}),Bottom.attributes.add("startButton",{type:"entity"}),Bottom.attributes.add("stopButton",{type:"entity"}),Bottom.attributes.add("headButton",{type:"entity"}),Bottom.attributes.add("tailButton",{type:"entity"}),Bottom.attributes.add("betUi",{type:"entity"}),Bottom.attributes.add("autoPlayStat",{type:"entity"}),Bottom.prototype.initialize=function(){Bottom.instance=this,this.setButton(this.startButton,this.onClickStart),this.setButton(this.stopButton,this.onClickStop),this.setButton(this.headButton,this.onClickHead),this.setButton(this.tailButton,this.onClickTail),this.disableAll(),this.isHeadBet=null,this.isAutoPlay=!1,this.gameCount=0,this.limitGameCount=0,this.profit=0,this.prevBetAmount=0},Bottom.prototype.setBet=function(){this.disableAll(),this.betUi.enabled=!0},Bottom.prototype.setButton=function(t,e){t.element.on("touchend",e,this),t.element.on("mouseup",e,this)},Bottom.prototype.onClickStart=function(){AudioController.instance.playSound("Click"),this.gameCount=0,this.profit=0;let t=BetTypeController.instance.getBetType();this.isAutoPlay=!t.isManualBet,this.limitGameCount=t.gameCount,this.setPlayStat(0,0),this.startGame()},Bottom.prototype.onClickStop=function(){AudioController.instance.playSound("Click"),this.isAutoPlay=!1,this.stopButton.enabled=!1},Bottom.prototype.startGame=function(){let t=BetTypeController.instance.getBetType(),e=this.isHeadBet;if(null===e)return;let o=BetController.instance.betAmount;if(o<=0)return;if(this.prevBetAmount=o,o>UserBalance.instance.getUserBalance())return;let i=t.isManualBet;this.autoPlayStat.enabled=!1,!1===i&&(this.autoPlayStat.enabled=!0,this.stopButton.enabled=!0),BetTypeController.instance.entity.enabled=!1,this.headButton.button.active=!1,this.tailButton.button.active=!1,this.betUi.enabled=!1,GameController.instance.startGame(o,e)},Bottom.prototype.changeHeadTail=function(){null!==this.isHeadBet&&(this.headButton.children[1].enabled=this.isHeadBet,this.tailButton.children[1].enabled=!this.isHeadBet)},Bottom.prototype.onClickHead=function(){AudioController.instance.playSound("Click"),!1!==this.headButton.button.active&&(this.isHeadBet=!0,this.changeHeadTail())},Bottom.prototype.onClickTail=function(){AudioController.instance.playSound("Click"),!1!==this.tailButton.button.active&&(this.isHeadBet=!1,this.changeHeadTail())},Bottom.prototype.setDisableColor=function(t){},Bottom.prototype.disableAll=function(){clearTimeout(this.winEffectTimer),this.startButton.enabled=!1,this.winResult.enabled=!1,this.loseResult.enabled=!1},Bottom.prototype.setProfit=function(t){this.profit=this.profit+t,this.gameCount++,this.setPlayStat(this.gameCount,this.profit)},Bottom.prototype.setIdle=function(){this.disableAll(),this.gameCount<this.limitGameCount&&!0===this.isAutoPlay&&this.prevBetAmount<=UserBalance.instance.getUserBalance()?this.startGame():(this.stopButton.enabled=!1,setTimeout((()=>{this.betUi.enabled=!0,this.startButton.enabled=!0,this.headButton.button.active=!0,this.tailButton.button.active=!0,this.autoPlayStat.enabled=!1,BetTypeController.instance.entity.enabled=!0}),1e3))},Bottom.prototype.setStartGame=function(){this.disableAll()},Bottom.prototype.playWinEffect=function(){},Bottom.prototype.setPlayStat=function(t,e){this.autoPlayStat.children[0].element.text=`Autoplay stats\n\nPlay Count : ${t}\nProfit : ${e}`},Bottom.prototype.setResultGame=function(t){this.disableAll(),t?(AudioController.instance.playSound("Win"),this.playWinEffect()):AudioController.instance.playSound("Lose"),this.winResult.enabled=t,this.loseResult.enabled=!t};var AudioController=pc.createScript("audioController");AudioController.attributes.add("soundSource",{type:"entity"}),AudioController.prototype.initialize=function(){AudioController.instance=this,this.isMute=!0,this.soundSource.sound.volume=0},AudioController.prototype.setMute=function(o){this.isMute=o,this.isMute?this.soundSource.sound.volume=0:this.soundSource.sound.volume=.55},AudioController.prototype.playSound=function(o){!0!==this.isMute&&this.soundSource.sound.play(o)};var BetController=pc.createScript("betController");BetController.attributes.add("betButton",{type:"entity",array:!0}),BetController.prototype.initialize=function(){BetController.instance=this,this.betAmount=0},BetController.prototype.reset=function(){this.betAmount=0,this.resetAllButton()},BetController.prototype.resetAllButton=function(){this.betButton.forEach((t=>t.element.color=new pc.Color(.5,.5,.5,1)))},BetController.prototype.betChange=function(t){return!(t>UserBalance.instance.getUserBalance())&&(this.betAmount=t,this.resetAllButton(),!0)},BetController.prototype.onBetOk=function(){AudioController.instance.playSound("Click"),0!==this.betAmount&&GameController.instance.startGame(this.betAmount)},BetController.prototype.onBetCancel=function(){AudioController.instance.playSound("Click"),GameController.instance.setIdle()};var SoundButton=pc.createScript("soundButton");SoundButton.attributes.add("onImg",{type:"entity"}),SoundButton.attributes.add("offImg",{type:"entity"}),SoundButton.prototype.initialize=function(){SoundButton.instance=this,this.isMute=!0,this.setButton(this.entity,this.onClick)},SoundButton.prototype.onClick=function(){this.isMute=!this.isMute,this.onImg.enabled=!1,this.offImg.enabled=!1,this.isMute?this.offImg.enabled=!0:this.onImg.enabled=!0,AudioController.instance.setMute(this.isMute)},SoundButton.prototype.setButton=function(t,n){t.element.on("touchend",n,this),t.element.on("mouseup",n,this)};var NumButton=pc.createScript("numButton");NumButton.attributes.add("betAmount",{type:"number"}),NumButton.prototype.initialize=function(){this.entity.children[0].element.text=`${this.betAmount}`,setButton(this.entity,this.onClick,this)},NumButton.prototype.onClick=function(){AudioController.instance.playSound("Click"),!1!==BetController.instance.betChange(this.betAmount)&&(this.entity.element.color=getSelectedColor())};var BetTypeController=pc.createScript("betTypeController");BetTypeController.attributes.add("manualBtn",{type:"entity"}),BetTypeController.attributes.add("autoBtn",{type:"entity"}),BetTypeController.attributes.add("incBtn",{type:"entity"}),BetTypeController.attributes.add("decBtn",{type:"entity"}),BetTypeController.attributes.add("autoCountGroup",{type:"entity"}),BetTypeController.attributes.add("autoCount",{type:"entity"}),BetTypeController.prototype.initialize=function(){BetTypeController.instance=this,setButton(this.manualBtn,this.onClickManual,this),setButton(this.autoBtn,this.onClickAuto,this),setButton(this.incBtn,this.onClickInc,this),setButton(this.decBtn,this.onClickDec,this),this.isManualBet=!0,this.autoGameCount=100,this.sizeTween=null,this.initCount=10,this.countVar=10,this.maxCount=100,this.minCount=10},BetTypeController.prototype.update=function(t){},BetTypeController.prototype.getBetType=function(){return{isManualBet:this.isManualBet,gameCount:this.autoGameCount}},BetTypeController.prototype.resetCount=function(){this.autoGameCount=this.initCount,this.autoCount.element.text=`${this.autoGameCount}`},BetTypeController.prototype.onClickManual=function(){AudioController.instance.playSound("Click"),this.manualBtn.element.color=getSelectedColor(),this.autoBtn.element.color=new pc.Color(1,1,1),this.isManualBet=!0,this.autoCountGroup.enabled=!1,this.doSizeAction(250,(function(){}))},BetTypeController.prototype.onClickAuto=function(){AudioController.instance.playSound("Click"),this.autoBtn.element.color=getSelectedColor(),this.manualBtn.element.color=new pc.Color(1,1,1),this.isManualBet=!1,this.doSizeAction(300,(function(){this.entity.script.betTypeController.resetCount(),this.entity.script.betTypeController.autoCountGroup.enabled=!0}))},BetTypeController.prototype.doSizeAction=function(t,e){null!==this.sizeTween&&this.sizeTween.stop();let o={value:this.entity.element.height};this.sizeTween=this.entity.tween(o).to({value:t},.3,pc.BackOut).on("complete",e).on("update",(function(t){this.entity.element.height=o.value})),this.sizeTween.start()},BetTypeController.prototype.updateCount=function(){this.autoCount.element.text=`${this.autoGameCount}`},BetTypeController.prototype.onClickInc=function(){AudioController.instance.playSound("Click");let t=this.autoGameCount;t>=this.maxCount||(this.autoGameCount=t+this.countVar,this.updateCount())},BetTypeController.prototype.onClickDec=function(){AudioController.instance.playSound("Click");let t=this.autoGameCount;t<=this.minCount||(this.autoGameCount=t-this.countVar,this.updateCount())};