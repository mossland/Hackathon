// EnvController.js
var EnvController = pc.createScript('envController');



// initialize code called once per entity
EnvController.prototype.initialize = async function() {
    EnvController.instance = this;

    this.envKey = 'development';
    this._env = {
        development: {
            serverBase: 'https://dev-metaverse-game.moss.land',
        },
        production: {
            serverBase: '',
        },
    };

    try {
        const { data } = await window.axios.get('/env');
        this.envKey = data;
    } catch (e) {}
};

EnvController.prototype.env = function() {
    return this._env[this.envKey];
};

// NumberController.js
var NumberController = pc.createScript('numberController');

NumberController.attributes.add('allNumber', {type: 'entity', array: true});
NumberController.attributes.add('one', {type: 'entity', array: true});
NumberController.attributes.add('two', {type: 'entity', array: true});
NumberController.attributes.add('four', {type: 'entity', array: true});
NumberController.attributes.add('seven', {type: 'entity', array: true});
NumberController.attributes.add('ten', {type: 'entity', array: true});

NumberController.prototype.initialize = function() {
    NumberController.instance = this;

    this.idleTimer = null;
    this.idleIndex = 0;

    this.resultTimer = null;
};

NumberController.prototype.update = function(dt) {

};

NumberController.prototype.disableAll = function() {
    this.allNumber.forEach(element => element.enabled = false);
};


NumberController.prototype.turnOnMultiplier = function(mul) {
    this.disableAll();
    
    let target = null;
    if (mul === 1)       target = this.one;
    else if (mul === 2)  target = this.two;
    else if (mul === 4)  target = this.four;
    else if (mul === 7)  target = this.seven;
    else                 target = this.ten;

    let random = getRandomInt(0, target.length);

    target[random].enabled = true;
    AudioController.instance.playSound('num');
};

NumberController.prototype.turnOn = function(index) {
    this.disableAll();
    if (index < this.allNumber.length){
        this.allNumber[index].enabled = true;
        AudioController.instance.playSound('num');
    }
};


NumberController.prototype.setResult = function(mul) {
    this.disableAll();

    this.playResultEffect();
    setTimeout(() => {
        clearTimeout(this.resultTimer);
        this.turnOnMultiplier(mul);
    }, 2000);

};
NumberController.prototype.playResultEffect = function() {
    this.resultTimer = setTimeout(() => {
        let target = getRandomInt(0, this.allNumber.length);
        this.turnOn(target);
        this.playResultEffect();
    }, 200);
};

NumberController.prototype.startIdle = function() {
    this.idleIndex = getRandomInt(0, this.allNumber.length);
    this.setIdle();
};

NumberController.prototype.setIdle = function() {
    this.idleIndex = (this.idleIndex + 1) % this.allNumber.length;
    this.turnOn(this.idleIndex);
    this.idleTimer = setTimeout(() => {
        this.setIdle();
    }, 2000);
};

NumberController.prototype.stopIdle = function() {
    clearTimeout(this.idleTimer);
    this.idleTimer = null;
    this.disableAll();
};

// RpsController.js
var RpsController = pc.createScript('rpsController');

RpsController.attributes.add('rps', {type: 'entity', array: true});

RpsController.prototype.initialize = function() {
    RpsController.instance = this;
    this.idleTimer = null;
    this.idleIndex = 0;

    this.inGameTimer = null;
};

RpsController.prototype.update = function(dt) {

};

RpsController.prototype.disableAll = function() {
    this.rps.forEach(element => element.enabled = false);
};


RpsController.prototype.turnOn = function(index) {
    this.disableAll();
    if (index < this.rps.length){
        AudioController.instance.playSound('rps');
        this.rps[index].enabled = true;
    }
};


RpsController.prototype.startIdle = function() {
    this.idleIndex = getRandomInt(0, this.rps.length);
    this.setIdle();
};

RpsController.prototype.startGame = function() {
    this.inGameTimer = setTimeout(() => {
        this.idleIndex = this.getNextRps();
        this.turnOn(this.idleIndex);
        this.startGame();
    }, 200);
};

RpsController.prototype.endGame = function(result) {
    clearTimeout(this.inGameTimer);
    this.inGameTimer = null;
    this.disableAll();

    this.turnOn(result);
};


RpsController.prototype.getNextRps = function() {
    let temp = this.idleIndex; 
    while( temp === this.idleIndex) {
        temp = getRandomInt(0, this.rps.length);
    }

    this.idleIndex = temp;

    return temp;
};

RpsController.prototype.setIdle = function() {
    
    this.idleIndex = this.getNextRps();
    this.turnOn(this.idleIndex);
    this.idleTimer = setTimeout(() => {
        this.setIdle();
    }, 1000);
};

RpsController.prototype.stopIdle = function() {
    clearTimeout(this.idleTimer);
    this.idleTimer = null;
    this.disableAll();
};

// GameController.js
var GameController = pc.createScript('gameController');


GameController.prototype.initialize = function() {
    GameController.instance = this;  
    this.resultTimer = null;
    window.addEventListener('message', ({ data }) => {
        if (!data || !data.type) {
            return;
        }
        if (data.type === 'setToken') {
            window.token = data.data;
            this.init();
            this.setIdle();
        }
    });
    setTimeout( () => {
        window.token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlyaW5nIjoiNjM0N2IxMDc0MDExYWQ5MGI4OWRiYTkxIiwicm9sZSI6InVzZXIiLCJzdGF0dXMiOiJhY3RpdmUiLCJpYXQiOjE2NjU2NDY0ODl9.adQi3ptjMI4xRi3tdN4mhA5q4OsCVqgweqgekcgbEMw';
    this.init();
    this.setIdle();
    }, 1000);
    
};

// GameController.prototype.postInitialize = function() {
//     this.init();
//     this.setIdle();
// };

GameController.prototype.init = async function() {
    let loginInfo = await DummyServer.instance.login();
    UserBalance.instance.setBalance(loginInfo.balance);
    UserBalance.instance.setUserName(loginInfo.id);
};


GameController.prototype.setIdle = function() {
    NumberController.instance.setIdle();
    RpsController.instance.setIdle();
    ResultController.instance.setIdle();
    ButtonController.instance.setIdle();
};

GameController.prototype.stopIdle = function() {
};


//r : 0, p : 1, s : 2
GameController.prototype.startGame = async function(rps) {
    let betAmount = BetController.instance.getBetAmount();
    if (betAmount <= 0)
        return;

    const { result, point } = await DummyServer.instance.startGame(betAmount, rps);

    let temp = UserBalance.instance.getUserBalance() - betAmount;

    UserBalance.instance.setBalance(temp);
    NumberController.instance.stopIdle();
    RpsController.instance.stopIdle();
    RpsController.instance.startGame();
};


GameController.prototype.setIdleAction = function(balance){
    UserBalance.instance.setBalance(balance);

    BetController.instance.betCheck();
    setTimeout( () => {
        this.setIdle();
    }, 3000);
};
//r : 0, p : 1, s : 2
GameController.prototype.endGame = function(result) {
    console.log(result);
    RpsController.instance.endGame(result.lastNum);
    ResultController.instance.setResult(result.isWin);

    if (result.isWin === 0){
        NumberController.instance.setResult(result.multiplier);   
        setTimeout( () => {
            UserBalance.instance.setBalance(result.balance); 
            this.setIdleAction(result.balance);
        }, 2500);
    }
    else{
        this.setIdleAction(result.balance);
    }
};



// DummyServer.js
var DummyServer = pc.createScript('dummyServer');


DummyServer.prototype.initialize = function() {
    DummyServer.instance = this;

    this.betAmount = -1;
    this.userBalance = 0;
};

DummyServer.prototype.getAxiosInstance = function() {
    const inst =  window.axios.create({
        headers: {
            Authorization: window.token,
        }
    });
    return inst;
};

DummyServer.prototype.login = async function() {
    try {
        const env = EnvController.instance.envKey;
        if (env === 'production') {
            
        } else {
            const { data: userInfo } = await this.getAxiosInstance().get(`${EnvController.instance.env().serverBase}/user/info`);
            const { data: userPoint } = await this.getAxiosInstance().get(`${EnvController.instance.env().serverBase}/user/point`);

            return {
                id : userInfo.user.nickname,
                balance : userPoint.point,
            };
        }
    } catch (e) {
        console.error(e);
        alert('Login fail');
        return {
            id : '',
            balance : 0,
        };
    }
};

DummyServer.prototype.startGame = async function(betAmount, userRps) {
    /** server response **/

    // interface IRPSResultResponse {
    //     success: boolean;
    //     ticket: IGameTicket;
    // }

    // interface IGameTicket {
    //     gameId: number;
    //     hashId: number;
    //     hashIdx: number;
    //     hashString: string;
    //     ticketId: string;
    //     betAmount: number;
    //     payout: number;
    //     meta: {
    //         hash: string;
    //         userPick: number;
    //         computerPick: number;
    //         multiplier: number;
    //     }
    // }

    const axios = this.getAxiosInstance();
    const { data: result } = await axios.post(
        `${EnvController.instance.env().serverBase}/rsp/result`,
        {
            pick: userRps,
            betAmount,
        }
    );

    const {data: pointInfo} = await axios.get(`${EnvController.instance.env().serverBase}/user/point`);
    const point = pointInfo.point;


    // 0 win, 1 draw, 2 lose
    const resultMapByUserPick = {
        '0': {
            0: 1,
            1: 2,
            2: 0,
        },
        '1': {
            0: 0,
            1: 1,
            2: 2,
        },
        '2': {
            0: 2,
            1: 0,
            2: 1,
        }
    };

    const isWin = resultMapByUserPick[result.ticket.meta.userPick][result.ticket.meta.computerPick];

    setTimeout( () => {
        this.endGame({
            isWin,
            multiplier: isWin === 0 ? result.ticket.meta.multiplier : 0,
            lastNum: result.ticket.meta.computerPick,
            balance: point,
            profit: result.ticket.betAmount * result.ticket.payout,
        });
    }, 1000);

    console.log(result);

    return {
        result,
        point,
    };
};

DummyServer.prototype.endGame = function ({isWin, multiplier, lastNum, balance, profit}) {
    let result = {
            isWin, 
            lastNum, 
            multiplier,
            balance,
            profit,
        };

    GameController.instance.endGame(result);

    return result;
};


// GlobalFunction.js
var GlobalFunction = pc.createScript('globalFunction');

function getRandomInt (min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; 
}

function setButton(btn, handler, entity) {
    btn.element.on('touchend', handler, entity);
    btn.element.on('mouseup', handler, entity);
}

function rgbToColor(r, g, b, a) {
    return new pc.Color(r/255, g/255, b/255, a/255);
}

function getCommaText(number) {
    let num = number;
    let commas = num.toLocaleString("en-US");

    return commas;
}

// ButtonController.js
var ButtonController = pc.createScript('buttonController');

//r p s
ButtonController.attributes.add('rpsButton', {type: 'entity', array: true});
ButtonController.attributes.add('rpsNormalImage', {type: 'entity', array: true});
ButtonController.attributes.add('rpsPushImage', {type: 'entity', array: true});

ButtonController.prototype.initialize = function() {
    ButtonController.instance = this;

    this.hoverColor = 1;
    this.normalColor = 0.784;

    this.isInGame = false;

    this.setButton(this.rpsButton[0], this.onRBtnClick, this.onRBtnHoverStart, this.onRBtnHoverEnd);  
    this.setButton(this.rpsButton[1], this.onPBtnClick, this.onPBtnHoverStart, this.onPBtnHoverEnd);  
    this.setButton(this.rpsButton[2], this.onSBtnClick, this.onSBtnHoverStart, this.onSBtnHoverEnd);  
};

ButtonController.prototype.setIdle = function(){
    this.isInGame = false;

    this.rpsNormalImage.forEach((element) => 
        {
            element.enabled = true;
            element.element.color = this.getColor(this.normalColor);
        });

    this.rpsPushImage.forEach((element) => 
        {
            element.enabled = false;
        });
};

ButtonController.prototype.getColor = function(color) {
    return new pc.Color(color, color, color, 1);
};

ButtonController.prototype.onRBtnClick = function() {
    this.onClick(0);
};
ButtonController.prototype.onRBtnHoverStart = function() {
    this.onHoverStart(0);
};
ButtonController.prototype.onRBtnHoverEnd = function() {
    this.onHoverEnd(0);
};

ButtonController.prototype.onPBtnClick = function() {
    this.onClick(1);
};
ButtonController.prototype.onPBtnHoverStart = function() {
    this.onHoverStart(1);
};
ButtonController.prototype.onPBtnHoverEnd = function() {
    this.onHoverEnd(1);
};

ButtonController.prototype.onSBtnClick = function() {
    this.onClick(2);
};
ButtonController.prototype.onSBtnHoverStart = function() {
    
    this.onHoverStart(2);
};
ButtonController.prototype.onSBtnHoverEnd = function() {
    this.onHoverEnd(2);
};

ButtonController.prototype.onHoverStart = function(index) {
    if (this.isInGame === true)
        return;

    AudioController.instance.playSound('btn');
    this.rpsNormalImage[index].element.color = this.getColor(this.hoverColor);
};

ButtonController.prototype.onHoverEnd = function(index) {
    if (this.isInGame === true)
        return;

    this.rpsNormalImage[index].element.color = this.getColor(this.normalColor);
};

ButtonController.prototype.onClick = function(index) {
    if (BetController.instance.getBetAmount() <= 0)
        return;
        
    if (this.isInGame === true)
        return;

    AudioController.instance.playSound('btn');
    this.rpsNormalImage[index].enabled = false;
    this.rpsPushImage[index].enabled = true;

    this.isInGame = true;

    GameController.instance.startGame(index);
};

ButtonController.prototype.setButton = function(btn, clickHandler, hoverStartHandler, hoverEndHandler) {
    btn.element.on('touchend', clickHandler, this);
    btn.element.on('mouseup', clickHandler, this);

    btn.button.on('hoverstart', hoverStartHandler, this);
    btn.button.on('hoverend', hoverEndHandler, this);
};



// ResultController.js
var ResultController = pc.createScript('resultController');

ResultController.attributes.add('win', {type: 'entity'});
ResultController.attributes.add('lose', {type: 'entity'});
ResultController.attributes.add('draw', {type: 'entity'});

ResultController.prototype.initialize = function() {
    ResultController.instance = this;

    this.resultTimer = null;

    this.disableAll();
};


ResultController.prototype.setIdle = function() {
    this.disableAll();
    clearTimeout(this.resultTimer);
    this.resultTimer = null;
};


ResultController.prototype.disableAll = function() {
    this.win.enabled = false;
    this.lose.enabled = false;
    this.draw.enabled = false;
};

ResultController.prototype.setResult = function(isWin) {
    this.disableAll();
    AudioController.instance.playSound('wld');
    if (isWin === 0)
        this.setResultWin();
    else if (isWin === 1)
        this.setResultDraw();
    else
        this.setResultLose();
};


ResultController.prototype.setResultWin = function() {
    this.win.enabled = false;

    this.resultTimer = setTimeout ( () => {
        AudioController.instance.playSound('wld');
        this.win.enabled = true;
        this.resultTimer = setTimeout ( () => {
            
            this.setResultWin();
        }, 150);
    }, 150);
};

ResultController.prototype.setResultLose = function() {
    this.disableAll();
    this.lose.enabled = true;
};

ResultController.prototype.setResultDraw = function() {
    this.disableAll();
    this.draw.enabled = true;
};


// AudioController.js
var AudioController = pc.createScript('audioController');

AudioController.attributes.add('soundSource', {'type':'entity'});

AudioController.prototype.initialize = function() {
    AudioController.instance = this;

    this.isMute = true;
    this.soundSource.sound.volume = 0;
};

AudioController.prototype.update = function(dt) {

};

AudioController.prototype.setMute = function(isMute) {
    this.isMute = isMute;

    if (this.isMute)    this.soundSource.sound.volume = 0;
    else                this.soundSource.sound.volume = 0.55;
};

AudioController.prototype.playSound = function(type) {
    if (this.isMute === true)
        return;
    this.soundSource.sound.play(type);
};


// Tween.js
pc.extend(pc, function () {

    /**
     * @name pc.TweenManager
     * @description Handles updating tweens
     * @param {pc.Application} app - The application
     */
    var TweenManager = function (app) {
        this._app = app;
        this._tweens = [];
        this._add = []; // to be added
    };

    TweenManager.prototype = {
        add: function (tween) {
            this._add.push(tween);
            return tween;
        },

        update: function (dt) {
            var i = 0;
            var n = this._tweens.length;
            while (i < n) {
                if (this._tweens[i].update(dt)) {
                    i++;
                } else {
                    this._tweens.splice(i, 1);
                    n--;
                }
            }

            // add any tweens that were added mid-update
            if (this._add.length) {
                for (let i = 0; i < this._add.length; i++) {
                    if (this._tweens.indexOf(this._add[i]) > -1) continue;
                    this._tweens.push(this._add[i]);
                }
                this._add.length = 0;
            }
        }
    };

    /**
     * @name  pc.Tween
     * @param {object} target - The target property that will be tweened
     * @param {pc.TweenManager} manager - The tween manager
     * @param {pc.Entity} entity - The pc.Entity whose property we are tweening
     */
    var Tween = function (target, manager, entity) {
        pc.events.attach(this);

        this.manager = manager;

        if (entity) {
            this.entity = null; // if present the tween will dirty the transforms after modify the target
        }

        this.time = 0;

        this.complete = false;
        this.playing = false;
        this.stopped = true;
        this.pending = false;

        this.target = target;

        this.duration = 0;
        this._currentDelay = 0;
        this.timeScale = 1;
        this._reverse = false;

        this._delay = 0;
        this._yoyo = false;

        this._count = 0;
        this._numRepeats = 0;
        this._repeatDelay = 0;

        this._from = false; // indicates a "from" tween

        // for rotation tween
        this._slerp = false; // indicates a rotation tween
        this._fromQuat = new pc.Quat();
        this._toQuat = new pc.Quat();
        this._quat = new pc.Quat();

        this.easing = pc.Linear;

        this._sv = {}; // start values
        this._ev = {}; // end values
    };

    var _parseProperties = function (properties) {
        var _properties;
        if (properties instanceof pc.Vec2) {
            _properties = {
                x: properties.x,
                y: properties.y
            };
        } else if (properties instanceof pc.Vec3) {
            _properties = {
                x: properties.x,
                y: properties.y,
                z: properties.z
            };
        } else if (properties instanceof pc.Vec4) {
            _properties = {
                x: properties.x,
                y: properties.y,
                z: properties.z,
                w: properties.w
            };
        } else if (properties instanceof pc.Quat) {
            _properties = {
                x: properties.x,
                y: properties.y,
                z: properties.z,
                w: properties.w
            };
        } else if (properties instanceof pc.Color) {
            _properties = {
                r: properties.r,
                g: properties.g,
                b: properties.b
            };
            if (properties.a !== undefined) {
                _properties.a = properties.a;
            }
        } else {
            _properties = properties;
        }
        return _properties;
    };
    Tween.prototype = {
        // properties - js obj of values to update in target
        to: function (properties, duration, easing, delay, repeat, yoyo) {
            this._properties = _parseProperties(properties);
            this.duration = duration;

            if (easing) this.easing = easing;
            if (delay) {
                this.delay(delay);
            }
            if (repeat) {
                this.repeat(repeat);
            }

            if (yoyo) {
                this.yoyo(yoyo);
            }

            return this;
        },

        from: function (properties, duration, easing, delay, repeat, yoyo) {
            this._properties = _parseProperties(properties);
            this.duration = duration;

            if (easing) this.easing = easing;
            if (delay) {
                this.delay(delay);
            }
            if (repeat) {
                this.repeat(repeat);
            }

            if (yoyo) {
                this.yoyo(yoyo);
            }

            this._from = true;

            return this;
        },

        rotate: function (properties, duration, easing, delay, repeat, yoyo) {
            this._properties = _parseProperties(properties);

            this.duration = duration;

            if (easing) this.easing = easing;
            if (delay) {
                this.delay(delay);
            }
            if (repeat) {
                this.repeat(repeat);
            }

            if (yoyo) {
                this.yoyo(yoyo);
            }

            this._slerp = true;

            return this;
        },

        start: function () {
            var prop, _x, _y, _z;

            this.playing = true;
            this.complete = false;
            this.stopped = false;
            this._count = 0;
            this.pending = (this._delay > 0);

            if (this._reverse && !this.pending) {
                this.time = this.duration;
            } else {
                this.time = 0;
            }

            if (this._from) {
                for (prop in this._properties) {
                    if (this._properties.hasOwnProperty(prop)) {
                        this._sv[prop] = this._properties[prop];
                        this._ev[prop] = this.target[prop];
                    }
                }

                if (this._slerp) {
                    this._toQuat.setFromEulerAngles(this.target.x, this.target.y, this.target.z);

                    _x = this._properties.x !== undefined ? this._properties.x : this.target.x;
                    _y = this._properties.y !== undefined ? this._properties.y : this.target.y;
                    _z = this._properties.z !== undefined ? this._properties.z : this.target.z;
                    this._fromQuat.setFromEulerAngles(_x, _y, _z);
                }
            } else {
                for (prop in this._properties) {
                    if (this._properties.hasOwnProperty(prop)) {
                        this._sv[prop] = this.target[prop];
                        this._ev[prop] = this._properties[prop];
                    }
                }

                if (this._slerp) {
                    _x = this._properties.x !== undefined ? this._properties.x : this.target.x;
                    _y = this._properties.y !== undefined ? this._properties.y : this.target.y;
                    _z = this._properties.z !== undefined ? this._properties.z : this.target.z;

                    if (this._properties.w !== undefined) {
                        this._fromQuat.copy(this.target);
                        this._toQuat.set(_x, _y, _z, this._properties.w);
                    } else {
                        this._fromQuat.setFromEulerAngles(this.target.x, this.target.y, this.target.z);
                        this._toQuat.setFromEulerAngles(_x, _y, _z);
                    }
                }
            }

            // set delay
            this._currentDelay = this._delay;

            // add to manager when started
            this.manager.add(this);

            return this;
        },

        pause: function () {
            this.playing = false;
        },

        resume: function () {
            this.playing = true;
        },

        stop: function () {
            this.playing = false;
            this.stopped = true;
        },

        delay: function (delay) {
            this._delay = delay;
            this.pending = true;

            return this;
        },

        repeat: function (num, delay) {
            this._count = 0;
            this._numRepeats = num;
            if (delay) {
                this._repeatDelay = delay;
            } else {
                this._repeatDelay = 0;
            }

            return this;
        },

        loop: function (loop) {
            if (loop) {
                this._count = 0;
                this._numRepeats = Infinity;
            } else {
                this._numRepeats = 0;
            }

            return this;
        },

        yoyo: function (yoyo) {
            this._yoyo = yoyo;
            return this;
        },

        reverse: function () {
            this._reverse = !this._reverse;

            return this;
        },

        chain: function () {
            var n = arguments.length;

            while (n--) {
                if (n > 0) {
                    arguments[n - 1]._chained = arguments[n];
                } else {
                    this._chained = arguments[n];
                }
            }

            return this;
        },

        update: function (dt) {
            if (this.stopped) return false;

            if (!this.playing) return true;

            if (!this._reverse || this.pending) {
                this.time += dt * this.timeScale;
            } else {
                this.time -= dt * this.timeScale;
            }

            // delay start if required
            if (this.pending) {
                if (this.time > this._currentDelay) {
                    if (this._reverse) {
                        this.time = this.duration - (this.time - this._currentDelay);
                    } else {
                        this.time -= this._currentDelay;
                    }
                    this.pending = false;
                } else {
                    return true;
                }
            }

            var _extra = 0;
            if ((!this._reverse && this.time > this.duration) || (this._reverse && this.time < 0)) {
                this._count++;
                this.complete = true;
                this.playing = false;
                if (this._reverse) {
                    _extra = this.duration - this.time;
                    this.time = 0;
                } else {
                    _extra = this.time - this.duration;
                    this.time = this.duration;
                }
            }

            var elapsed = (this.duration === 0) ? 1 : (this.time / this.duration);

            // run easing
            var a = this.easing(elapsed);

            // increment property
            var s, e;
            for (var prop in this._properties) {
                if (this._properties.hasOwnProperty(prop)) {
                    s = this._sv[prop];
                    e = this._ev[prop];
                    this.target[prop] = s + (e - s) * a;
                }
            }

            if (this._slerp) {
                this._quat.slerp(this._fromQuat, this._toQuat, a);
            }

            // if this is a entity property then we should dirty the transform
            if (this.entity) {
                this.entity._dirtifyLocal();

                // apply element property changes
                if (this.element && this.entity.element) {
                    this.entity.element[this.element] = this.target;
                }

                if (this._slerp) {
                    this.entity.setLocalRotation(this._quat);
                }
            }

            this.fire("update", dt);

            if (this.complete) {
                var repeat = this._repeat(_extra);
                if (!repeat) {
                    this.fire("complete", _extra);
                    if (this.entity)
                        this.entity.off('destroy', this.stop, this);
                    if (this._chained) this._chained.start();
                } else {
                    this.fire("loop");
                }

                return repeat;
            }

            return true;
        },

        _repeat: function (extra) {
            // test for repeat conditions
            if (this._count < this._numRepeats) {
                // do a repeat
                if (this._reverse) {
                    this.time = this.duration - extra;
                } else {
                    this.time = extra; // include overspill time
                }
                this.complete = false;
                this.playing = true;

                this._currentDelay = this._repeatDelay;
                this.pending = true;

                if (this._yoyo) {
                    // swap start/end properties
                    for (var prop in this._properties) {
                        var tmp = this._sv[prop];
                        this._sv[prop] = this._ev[prop];
                        this._ev[prop] = tmp;
                    }

                    if (this._slerp) {
                        this._quat.copy(this._fromQuat);
                        this._fromQuat.copy(this._toQuat);
                        this._toQuat.copy(this._quat);
                    }
                }

                return true;
            }
            return false;
        }

    };


    /**
     * Easing methods
     */

    var Linear = function (k) {
        return k;
    };

    var QuadraticIn = function (k) {
        return k * k;
    };

    var QuadraticOut = function (k) {
        return k * (2 - k);
    };

    var QuadraticInOut = function (k) {
        if ((k *= 2) < 1) {
            return 0.5 * k * k;
        }
        return -0.5 * (--k * (k - 2) - 1);
    };

    var CubicIn = function (k) {
        return k * k * k;
    };

    var CubicOut = function (k) {
        return --k * k * k + 1;
    };

    var CubicInOut = function (k) {
        if ((k *= 2) < 1) return 0.5 * k * k * k;
        return 0.5 * ((k -= 2) * k * k + 2);
    };

    var QuarticIn = function (k) {
        return k * k * k * k;
    };

    var QuarticOut = function (k) {
        return 1 - (--k * k * k * k);
    };

    var QuarticInOut = function (k) {
        if ((k *= 2) < 1) return 0.5 * k * k * k * k;
        return -0.5 * ((k -= 2) * k * k * k - 2);
    };

    var QuinticIn = function (k) {
        return k * k * k * k * k;
    };

    var QuinticOut = function (k) {
        return --k * k * k * k * k + 1;
    };

    var QuinticInOut = function (k) {
        if ((k *= 2) < 1) return 0.5 * k * k * k * k * k;
        return 0.5 * ((k -= 2) * k * k * k * k + 2);
    };

    var SineIn = function (k) {
        if (k === 0) return 0;
        if (k === 1) return 1;
        return 1 - Math.cos(k * Math.PI / 2);
    };

    var SineOut = function (k) {
        if (k === 0) return 0;
        if (k === 1) return 1;
        return Math.sin(k * Math.PI / 2);
    };

    var SineInOut = function (k) {
        if (k === 0) return 0;
        if (k === 1) return 1;
        return 0.5 * (1 - Math.cos(Math.PI * k));
    };

    var ExponentialIn = function (k) {
        return k === 0 ? 0 : Math.pow(1024, k - 1);
    };

    var ExponentialOut = function (k) {
        return k === 1 ? 1 : 1 - Math.pow(2, -10 * k);
    };

    var ExponentialInOut = function (k) {
        if (k === 0) return 0;
        if (k === 1) return 1;
        if ((k *= 2) < 1) return 0.5 * Math.pow(1024, k - 1);
        return 0.5 * (-Math.pow(2, -10 * (k - 1)) + 2);
    };

    var CircularIn = function (k) {
        return 1 - Math.sqrt(1 - k * k);
    };

    var CircularOut = function (k) {
        return Math.sqrt(1 - (--k * k));
    };

    var CircularInOut = function (k) {
        if ((k *= 2) < 1) return -0.5 * (Math.sqrt(1 - k * k) - 1);
        return 0.5 * (Math.sqrt(1 - (k -= 2) * k) + 1);
    };

    var ElasticIn = function (k) {
        var s, a = 0.1, p = 0.4;
        if (k === 0) return 0;
        if (k === 1) return 1;
        if (!a || a < 1) {
            a = 1; s = p / 4;
        } else s = p * Math.asin(1 / a) / (2 * Math.PI);
        return -(a * Math.pow(2, 10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p));
    };

    var ElasticOut = function (k) {
        var s, a = 0.1, p = 0.4;
        if (k === 0) return 0;
        if (k === 1) return 1;
        if (!a || a < 1) {
            a = 1; s = p / 4;
        } else s = p * Math.asin(1 / a) / (2 * Math.PI);
        return (a * Math.pow(2, -10 * k) * Math.sin((k - s) * (2 * Math.PI) / p) + 1);
    };

    var ElasticInOut = function (k) {
        var s, a = 0.1, p = 0.4;
        if (k === 0) return 0;
        if (k === 1) return 1;
        if (!a || a < 1) {
            a = 1; s = p / 4;
        } else s = p * Math.asin(1 / a) / (2 * Math.PI);
        if ((k *= 2) < 1) return -0.5 * (a * Math.pow(2, 10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p));
        return a * Math.pow(2, -10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p) * 0.5 + 1;
    };

    var BackIn = function (k) {
        var s = 1.70158;
        return k * k * ((s + 1) * k - s);
    };

    var BackOut = function (k) {
        var s = 1.70158;
        return --k * k * ((s + 1) * k + s) + 1;
    };

    var BackInOut = function (k) {
        var s = 1.70158 * 1.525;
        if ((k *= 2) < 1) return 0.5 * (k * k * ((s + 1) * k - s));
        return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);
    };

    var BounceOut = function (k) {
        if (k < (1 / 2.75)) {
            return 7.5625 * k * k;
        } else if (k < (2 / 2.75)) {
            return 7.5625 * (k -= (1.5 / 2.75)) * k + 0.75;
        } else if (k < (2.5 / 2.75)) {
            return 7.5625 * (k -= (2.25 / 2.75)) * k + 0.9375;
        }
        return 7.5625 * (k -= (2.625 / 2.75)) * k + 0.984375;

    };

    var BounceIn = function (k) {
        return 1 - BounceOut(1 - k);
    };

    var BounceInOut = function (k) {
        if (k < 0.5) return BounceIn(k * 2) * 0.5;
        return BounceOut(k * 2 - 1) * 0.5 + 0.5;
    };

    return {
        TweenManager: TweenManager,
        Tween: Tween,
        Linear: Linear,
        QuadraticIn: QuadraticIn,
        QuadraticOut: QuadraticOut,
        QuadraticInOut: QuadraticInOut,
        CubicIn: CubicIn,
        CubicOut: CubicOut,
        CubicInOut: CubicInOut,
        QuarticIn: QuarticIn,
        QuarticOut: QuarticOut,
        QuarticInOut: QuarticInOut,
        QuinticIn: QuinticIn,
        QuinticOut: QuinticOut,
        QuinticInOut: QuinticInOut,
        SineIn: SineIn,
        SineOut: SineOut,
        SineInOut: SineInOut,
        ExponentialIn: ExponentialIn,
        ExponentialOut: ExponentialOut,
        ExponentialInOut: ExponentialInOut,
        CircularIn: CircularIn,
        CircularOut: CircularOut,
        CircularInOut: CircularInOut,
        BackIn: BackIn,
        BackOut: BackOut,
        BackInOut: BackInOut,
        BounceIn: BounceIn,
        BounceOut: BounceOut,
        BounceInOut: BounceInOut,
        ElasticIn: ElasticIn,
        ElasticOut: ElasticOut,
        ElasticInOut: ElasticInOut
    };
}());

// Expose prototype methods and create a default tween manager on the application
(function () {
    // Add pc.Application#addTweenManager method
    pc.Application.prototype.addTweenManager = function () {
        this._tweenManager = new pc.TweenManager(this);

        this.on("update", function (dt) {
            this._tweenManager.update(dt);
        });
    };

    // Add pc.Application#tween method
    pc.Application.prototype.tween = function (target) {
        return new pc.Tween(target, this._tweenManager);
    };

    // Add pc.Entity#tween method
    pc.Entity.prototype.tween = function (target, options) {
        var tween = this._app.tween(target);
        tween.entity = this;

        this.once('destroy', tween.stop, tween);

        if (options && options.element) {
            // specifiy a element property to be updated
            tween.element = options.element;
        }
        return tween;
    };
    
    pc.Entity.prototype.localMoveTo = function(position, duration, type = pc.QuadraticOut) {
        return this.tween(this.getLocalPosition())
            .to(position, duration, type)
            .start();
    };
    pc.Entity.prototype.localMoveBy = function(position, duration, type = pc.SineOut) {
        return this.tween(this.getLocalPosition())
            .by(position, duration, type)
            .start();
    };
    pc.Entity.prototype.moveTo = function(position, duration) {
        return this.tween(this.getPosition())
            .to(position, duration, pc.SineOut)
            .start();
    };
    pc.Entity.prototype.moveBy = function(position, duration) {
        return this.tween(this.getPosition())
            .by(position, duration, pc.SineOut)
            .start();
    };
    pc.Entity.prototype.rotateTo = function(rot, duration, type = pc.CircularOut) {
        return this.tween(this.getLocalEulerAngles())
            .rotate(rot, duration, type)
            .start();
    };
    
    pc.Entity.prototype.setOpacity = function(v) {
        if (!this.element) return;
        
        /*
        if (!this.element.material.cloned) {
            this.element.material = this.element.material.clone();
            this.element.material.cloned = true;
        }
        this.element.material.opacity = v;
        this.element.material.update();
        */
        
        if (this.element.material && false) {
            if (!this.element.material.cloned) {
                const c = this.element.color;
                
                this.element.material = this.element.material.clone();
                this.element.material.emissive = c;
                this.element.material.cloned = true;
            }
            this.element.material.opacity = v;
            this.element.material.update();   
        }
        else {
            this.element.opacity = v;
        }
    };
    pc.Entity.prototype.setOpacityCascade = function(v) {
        this.setOpacity(v);
        for (let i=0;i<this.children.length; i++) {
            if (!this.children[i].setOpacityCascade)
                continue;
            this.children[i].setOpacityCascade(v);
        }
    };
    
    pc.Entity.prototype.opacityToCascade = function(from, to, duration) {
        let o = {v: from};
        this.setOpacityCascade(from);
        
        return this.tween(o)
            .to({v: to}, duration, pc.SineOut)
            .on('update', () => {
                this.setOpacityCascade(o.v);
            })
            .start();
    };

    pc.Entity.prototype.opacityTo = function(from, to, duration) {
        if (!this.element.material) return;
        
        let o = {v: from};
        this.setOpacity(from);
        return this.tween(o)
            .to({v: to}, duration, pc.SineOut)
            .on('update', () => {
                this.setOpacity(o.v);
            })
            .start();
    };
    
    pc.Entity.prototype.setTextureFromURL = function(url) {
        let assetName = "t_" + url;
        
        let asset2 = pc.app.assets.find(assetName, "texture");
        if (asset2 !== null){
            this.element.texture = asset2.resource;
            return;
        }

        pc.app.loader.getHandler("texture").crossOrigin = "anonymous";
        var asset = new pc.Asset(assetName, "texture", {
            url: url
        });
        pc.app.assets.add(asset);
        asset.on("load", (asset) => {
            this.element.texture = asset.resource;
        });
        pc.app.assets.load(asset);  
    };
    pc.Entity.prototype.blink = function(min, max, interval, loop) {
        for (let i=0;i<loop;i++) {
            setTimeout(() => {
                this.setOpacity(min);
            }, interval * i * 2);
            setTimeout(() => {
                this.setOpacity(max);
            }, interval * (i * 2 + 1));
        }  
    };
    

    // Create a default tween manager on the application
    var application = pc.Application.getApplication();
    if (application) {
        application.addTweenManager();
    }
})();

// UserBalance.js
var UserBalance = pc.createScript('userBalance');

UserBalance.attributes.add('userBalanceText', {type: 'entity'});
UserBalance.attributes.add('userName', {type: 'entity'});

UserBalance.prototype.initialize = function() {
    UserBalance.instance = this;
    this.userBalance = 0;
};

UserBalance.prototype.setUserName = function(name) {
    this.userName.element.text = name;
};

UserBalance.prototype.getUserBalance = function() {
    return this.userBalance;
};

UserBalance.prototype.setBalance = function(balance) {
    this.userBalance = balance;
    
    let data = {
        value: Number(this.userBalanceText.element.text)
    };
    let element = this.userBalanceText.element;

    let tween = this.entity.tween(data).to({value:balance}, 0.3, pc.Linear);
    tween.on('update', function (dt) {
        let newbalance = parseFloat(data.value.toFixed(0));
        element.text = `${newbalance}`;
    });
    tween.start();
};


// async.js
/*jshint esversion:8*/
async function loadJsonFromUrl(url){
    return new Promise( resolve =>{
        this.loadJsonFromRemote(url, function (data) {
            console.log(data);
            let meta = JSON.stringify(data);

            let meta2 = JSON.parse(meta);
            resolve(meta2);
        });
    });
}

async function loadJsonFromRemote(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.addEventListener("load", function () {
        callback(JSON.parse(this.response));
    });
    xhr.open("GET", url);
    xhr.send();
}

// NumButton.js
var NumButton = pc.createScript('numButton');

NumButton.attributes.add('betAmount', {type: 'number'});

NumButton.prototype.initialize = function() {
    let childText = this.entity.children[0];

    let num = this.betAmount;
    let commas = getCommaText(num);

    childText.element.text = `+${commas}`;
    setButton(this.entity, this.onClick, this);
};

NumButton.prototype.onClick = function() {
    AudioController.instance.playSound('Click');
    let ret = BetController.instance.betChange(this.betAmount);
    if (ret === false)
        return;

    //this.entity.element.color = rgbToColor(154, 117, 244, 255);
};

// BetController.js
var BetController = pc.createScript('betController');

BetController.attributes.add('betButton', {type: 'entity', array: true});
BetController.attributes.add('okButton', {type: 'entity'});
BetController.attributes.add('cancelButton', {type: 'entity'});
BetController.attributes.add('clearButton', {type: 'entity'});

BetController.attributes.add('betAmountText', {type: 'entity'});

BetController.attributes.add('errorText', {type: 'entity'});

BetController.prototype.initialize = function() {
    BetController.instance = this;

    this.timer = null;

    this.betAmount = 0;
    this.errorText.enabled = false;

    //setButton(this.cancelButton, this.onBetCancel, this);
    //setButton(this.okButton, this.onBetOk, this);
    setButton(this.clearButton, this.onBetClear, this);
};

BetController.prototype.reset = function() {
    this.betAmount = 0;
    this.updateText();
    this.resetAllButton();
};


BetController.prototype.resetAllButton = function() {
    this.betButton.forEach(e => e.element.color = new pc.Color(0.5, 0.5, 0.5, 1));    
};

BetController.prototype.betChange = function(betAmount) {

    let temp = this.betAmount + betAmount;
    let userBalance = UserBalance.instance.getUserBalance();
    if (temp > userBalance){
        this.showErrorMsg();
        return false;
    }

    this.errorText.enabled = false;

    this.betAmount = temp;
    //this.resetAllButton();

    this.updateText();

    return true;
};

BetController.prototype.updateText = function() {
    let commaText = getCommaText(this.betAmount);
    this.betAmountText.element.text = `${commaText}`;
};


BetController.prototype.onBetClear = function() {
    AudioController.instance.playSound('Click');
    console.log('BetController.prototype.betOk');
    this.betAmount = 0;
    this.updateText();
};

BetController.prototype.onBetOk = function() {
    AudioController.instance.playSound('Click');
    console.log('BetController.prototype.betOk');
    if (this.betAmount === 0)
        return;

    GameController.instance.startGame(this.betAmount);
};

BetController.prototype.onBetCancel = function() {
    AudioController.instance.playSound('Click');
    GameController.instance.setIdle();
};

BetController.prototype.showErrorMsg = function() {
    this.errorText.enabled = true;
    clearTimeout(this.timer);
    this.timer = setTimeout( () => {
        this.errorText.enabled = false;
    }, 1000);
};

BetController.prototype.getBetAmount = function() {
    return this.betAmount;
};

BetController.prototype.betCheck = function() {
    if (this.balanceCheck(this.betAmount) === true)
        return;

    this.betAmount = 0;
    //this.resetAllButton();
};

BetController.prototype.balanceCheck = function(betAmount) {
    let userBalance = UserBalance.instance.getUserBalance();
    console.log(userBalance, betAmount);
    if (betAmount > userBalance){
        return false;
    }

    return true;
};

// SoundButton.js
var SoundButton = pc.createScript('soundButton');

SoundButton.attributes.add('onImg', {type:'entity'});
SoundButton.attributes.add('offImg', {type:'entity'});

SoundButton.prototype.initialize = function() {
    SoundButton.instance = this;
    this.isMute = true;
    this.setButton(this.entity, this.onClick);

    this.offImg.enabled = true;
    this.onImg.enabled = false;
};

SoundButton.prototype.onClick = function() {
    this.isMute = !this.isMute;

    this.onImg.enabled = false;
    this.offImg.enabled = false;

    if (this.isMute) this.offImg.enabled = true;
    else             this.onImg.enabled = true;
    
    AudioController.instance.setMute(this.isMute);
};


SoundButton.prototype.setButton = function(btn, handler) {
    btn.element.on('touchend', handler, this);
    btn.element.on('mouseup', handler, this);
};


