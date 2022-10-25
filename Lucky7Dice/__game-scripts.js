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

// Background.js
var Background = pc.createScript('background');

Background.attributes.add('startPosX', {type: 'number', default: 1});
Background.attributes.add('endPosX', {type: 'number', default: 1});
Background.attributes.add('durationTime', {type: 'number', default: 1});

Background.prototype.initialize = function() {
    this.entity.setLocalPosition(this.startPosX, 0, 0);
    this.tween = this.entity.tween(this.entity.getLocalPosition())
        .to(new pc.Vec3(this.endPosX, 0, 0), this.durationTime, pc.Linear)
        .loop(true)
        .yoyo(true);
    
    this.tween.start();
};

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

UserBalance.prototype.getUserBalance = function(){
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

UserBalance.prototype.update = function(dt) {

};

// DummyServer.js
var DummyServer = pc.createScript('dummyServer');


DummyServer.prototype.initialize = function() {
    DummyServer.instance = this;

    this.betAmount = -1;
    this.userBalance = 0;

    this.openCard = null;
    this.hiddenCard = null;
};

DummyServer.prototype.login = async function() {
    this.userBalance = getRandomInt(1000, 5000);
    //let json = await loadJsonFromUrl(`https://randomuser.me/api/`);
    
    return {
        id : 'UserName',
        balance : this.userBalance,
    };
};

DummyServer.prototype.startGame = function(betAmount) {
    let deck = getDeck();
    deck = shuffle(deck);
    this.openCard = deck[0];
    this.userBalance = this.userBalance - betAmount;
    this.betAmount = betAmount;

    let betReturn = {
        balance : this.userBalance,
        betAmount : this.betAmount,
        openCard : this.openCard,
    };
    
    return betReturn;
};

DummyServer.prototype.betGame = function(isSeven) {
    let deck = getDeck();
    deck = shuffle(deck);
    this.hiddenCard = deck[0];
    
    let diceSum = (this.openCard.number + this.hiddenCard.number);
    let sumResult = '';

    if (diceSum > 7)         sumResult='over';
    else if (diceSum === 7)  sumResult='seven';
    else                     sumResult='under';



    let isWin = (isSeven === sumResult);
    let profit = 0;
    if (isWin){
        if (sumResult === 'over' || sumResult === 'under')
            profit = this.betAmount * 2;
        else 
            profit = this.betAmount * 5;
        
        this.userBalance = this.userBalance + profit;    
    }

    let betReturn = {
        balance : this.userBalance,
        betAmount : this.betAmount,
        profit : profit,
        openCard : this.openCard,
        hiddenCard : this.hiddenCard,
        result : sumResult,
        isWin : isWin,
    };

    console.log(this.openCard.number, this.hiddenCard.number, diceSum, sumResult, isWin);

    this.openCard = null;
    this.hiddenCard = null;

    return betReturn;
};

DummyServer.prototype.endGame = function (isWin, resultRps) {
    let multiplier = 0;
    let profit = 0;

    if (isWin === 0) { // win
        multiplier = this.getMultiplier();
        profit = this.betAmount * multiplier;
        this.userBalance = this.userBalance + profit;
    }
    else if (isWin === 1) { // draw
        profit = this.betAmount;
        this.userBalance = this.userBalance + profit;
    }

    let result = {isWin : isWin, 
            lastNum : resultRps, 
            multiplier : multiplier,
            balance : this.userBalance,
            profit : profit,
            };

    GameController.instance.endGame(result);

    return result;
};

DummyServer.prototype.update = function(dt) {
    
};

// Function.js
var GlobalFunction = pc.createScript('globalFunction');

function getRandomInt (min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; 
}



var CardType = {
    Bananas:      0,
    Strawberries: 1,
    Limes :       2,
    Plums:        3,
};

var CardNumber = {
    One:   1,
    Two:   2,
    Three: 3,
    Four:  4,
    Five:  5,
    Six:   6,
};

function shuffle(a){
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

function getDeck() {
    let deck = [];
    
    let cardType   = Object.values(JSON.parse(JSON.stringify(CardType)));
    let cardNumber = Object.values(JSON.parse(JSON.stringify(CardNumber)));
    
    for (const type of cardType) {
        for (const number of cardNumber) {
            let card = {type : type, number : number};
            deck.push(card);
        }
    }
    
    return deck;
}

function getDeck() {
    let deck = [];
    
    let cardType   = Object.values(JSON.parse(JSON.stringify(CardType)));
    let cardNumber = Object.values(JSON.parse(JSON.stringify(CardNumber)));
    
    for (const type of cardType) {
        for (const number of cardNumber) {
            let card = {type : type, number : number};
            deck.push(card);
        }
    }
    
    return deck;
}


function getOColor() {
    return new pc.Color(1, 1, 1, 1);
    //return new pc.Color(255/255, 136/255, 116/255, 1);
}

function getEColor() {
    return new pc.Color(1, 1, 1, 1);
    //return new pc.Color(86/255, 98/255, 181/255, 1);
}

function getQColor() {
    return new pc.Color(1, 1, 1, 1);
    //return new pc.Color(168/255, 216/255, 131/255, 1);
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


// CardFront.js
var CardFront = pc.createScript('cardFront');

CardFront.attributes.add('numberImage', {type: 'entity', array: true});
CardFront.attributes.add('isRedDice', {type: 'boolean'});

CardFront.prototype.initialize = function() {
    this.numPattern = [];

    this.numPattern.push([3]); // 1
    this.numPattern.push([0, 6]); // 2
    this.numPattern.push([0, 3, 6]); // 3
    this.numPattern.push([0, 1, 5, 6]); // 4
    this.numPattern.push([0, 1, 3, 5, 6]); // 5
    this.numPattern.push([0, 1, 2, 4, 5, 6]); // 6
};

CardFront.prototype.disableAllNumber = function() {
    this.numberImage.forEach(e => e.enabled = false);
};

CardFront.prototype.setCardNumber = function(number) {
    //console.log('setCardNumber', number);
    this.disableAllNumber();

    let pattern = this.numPattern[number - 1];
    pattern.forEach(num => this.numberImage[num].enabled = true);
};

CardFront.prototype.setCard = function(number) {
    if (this.isRedDice) AudioController.instance.playSound('redDice');
    else                AudioController.instance.playSound('blueDice');
    this.setCardNumber(number);
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

async function delay(ms){
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve(ms);
    }, ms)
  );
}

async function loadJsonFromRemote(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.addEventListener("load", function () {
        callback(JSON.parse(this.response));
    });
    xhr.open("GET", url);
    xhr.send();
}

// Middle.js
var Middle = pc.createScript('middle');

Middle.attributes.add('openCard', {type: 'entity'});
Middle.attributes.add('hiddenCard', {type: 'entity'});
Middle.attributes.add('resultText', {type: 'entity'});

Middle.prototype.initialize = function() {
    Middle.instance = this;
    this.idleTimer = null;
};

Middle.prototype.update = function(dt) {
    
};

Middle.prototype.numberToText = function(number) {
    if (number === 7)     return 'seven';
    else if  (number < 7) return 'under';
    else                  return 'over';
};


Middle.prototype.setIdle = function() {
    AudioController.instance.playSound('Open');
    let card = shuffle(getDeck());
    this.setOpenCard(card[0].number);
    this.setHiddenCard(card[1].number);

    let sum = card[0].number + card[1].number;
    this.setResultText(this.numberToText(sum));
    this.idleTimer = setTimeout(() => {
        this.setIdle();
    }, 4000);  
};

Middle.prototype.setReady = function() {
    clearTimeout(this.idleTimer);
    
    this.openCard.script.card.setReady();
    this.hiddenCard.script.card.setReady();
    this.resultText.element.text = '?';
};


Middle.prototype.setOpenCard = function(number) {
    AudioController.instance.playSound('Open');
    this.openCard.script.card.setCard(number);
};

Middle.prototype.setHiddenCard = function(number) {
    AudioController.instance.playSound('Open');
    this.hiddenCard.script.card.setCard(number);
};

Middle.prototype.setResultText = function(result) {
    AudioController.instance.playSound('Open');
    
    let resultStr = '';
    if (result === 'over')        resultStr = 'OVER';
    else if (result === 'seven')  resultStr = '7';
    else                          resultStr = 'UNDER';

    this.resultText.element.text = resultStr;
};


// Card.js
var Card = pc.createScript('card');

Card.attributes.add('cardRoot', {type: 'entity'});
Card.attributes.add('cardFront', {type: 'entity'});
Card.attributes.add('cardTypeText', {type: 'entity'});

Card.prototype.initialize = function() {
    this.readyTimer = null;
    this.prevNumber = -1;
};

Card.prototype.setCard = function(number) {
    clearTimeout(this.readyTimer);
    this.cardRoot.setLocalEulerAngles(0, 0, 0);
    this.cardTypeText.element.text = number;
    this.cardFront.script.cardFront.setCard(number);  

    this.prevNumber = number;
};

Card.prototype.getNextNum = function() {
    let rdnNum = this.prevNumber;

    while(this.prevNumber === rdnNum){
        rdnNum = getRandomInt(1, 7);
    }

    return rdnNum;
};

Card.prototype.setReady = function() {
    clearTimeout(this.readyTimer);

    this.cardTypeText.element.text = '?';
    this.readyTimer = setTimeout( () => {
        let number = this.getNextNum();
        this.cardFront.script.cardFront.setCard(number);  
        this.setReady();
    }, 100);
};


// GameController.js
var GameController = pc.createScript('gameController');

GameController.prototype.initialize = function() {
    GameController.instance = this;
};

GameController.prototype.postInitialize = function() {
    this.init();

    this.setIdle();
};

GameController.prototype.init = async function() {
    let loginInfo = await DummyServer.instance.login();
    console.log(loginInfo);

    UserBalance.instance.setBalance(loginInfo.balance);
    UserBalance.instance.setUserName(loginInfo.id);
};

GameController.prototype.betStart = function() {
    BetController.instance.reset();
    Middle.instance.setReady();
    Bottom.instance.setBet();
};

GameController.prototype.startGame = function(betAmount) {
    Middle.instance.setReady();
    Bottom.instance.setStartGame();

    let gameInfo = DummyServer.instance.startGame(betAmount);

    UserBalance.instance.setBalance(gameInfo.balance);
};

GameController.prototype.betGame = async function(u7o) {
    let result = DummyServer.instance.betGame(u7o);
    
    
    console.log('betGame', result);
    console.log('betGame', result.profit);

    await delay(1000);
        Middle.instance.setOpenCard(result.openCard.number);
    await delay(1000);
        Middle.instance.setHiddenCard(result.hiddenCard.number);
    await delay(700);
        let sum = result.hiddenCard.number + result.openCard.number;
        Middle.instance.setResultText(result.result);
        Bottom.instance.setResultGame(result.isWin, result.profit);
    await delay(1000);
        UserBalance.instance.setBalance(result.balance);
    await delay(3000);
        Middle.instance.setReady();
        this.setIdle();
};


GameController.prototype.setIdle = function() {
    Middle.instance.setIdle();
    Bottom.instance.setIdle();
};


// Bottom.js
var Bottom = pc.createScript('bottom');

Bottom.attributes.add('startButton', {type: 'entity'});

Bottom.attributes.add('underButton', {type: 'entity'});
Bottom.attributes.add('sevenButton', {type: 'entity'});
Bottom.attributes.add('overButton', {type: 'entity'});

Bottom.attributes.add('winResult', {type: 'entity'});
Bottom.attributes.add('profit', {type: 'entity'});
Bottom.attributes.add('loseResult', {type: 'entity'});

Bottom.attributes.add('lBell', {type: 'entity'});
Bottom.attributes.add('rBell', {type: 'entity'});

Bottom.attributes.add('betUi', {type:'entity'});

Bottom.attributes.add('under_enable', {type: 'asset', assetType: 'texture'});
Bottom.attributes.add('under_disable', {type: 'asset', assetType: 'texture'});

Bottom.attributes.add('seven_enable', {type: 'asset', assetType: 'texture'});
Bottom.attributes.add('seven_disable', {type: 'asset', assetType: 'texture'});

Bottom.attributes.add('over_enable', {type: 'asset', assetType: 'texture'});
Bottom.attributes.add('over_disable', {type: 'asset', assetType: 'texture'});


Bottom.prototype.initialize = function() {
    Bottom.instance = this;

    this.setButton(this.startButton, this.onClickStart);

    this.setButton(this.underButton, this.onClickUnder);
    this.setButton(this.sevenButton, this.onClickSeven);
    this.setButton(this.overButton, this.onClickOver);

    this.disableAll();

    this.winEffectTimer = null;

    
    this.bellToggle = false;
};

Bottom.prototype.setBet = function() {
    this.disableAll();
    this.betUi.enabled = true;
};

Bottom.prototype.setButton = function(btn, clickHandler){
    btn.button.on('touchend', clickHandler, this);
    btn.button.on('mouseup', clickHandler, this);
};

Bottom.prototype.onClickStart = function(){
    AudioController.instance.playSound('Click');
    GameController.instance.betStart();
};

Bottom.prototype.buttonOff = function(){
    this.changeTexture(this.underButton, this.under_disable);
    this.changeTexture(this.sevenButton, this.seven_disable);
    this.changeTexture(this.overButton, this.over_disable);
};

Bottom.prototype.changeTexture = function(target, texture){
    target.element.texture = texture.resource;
};

Bottom.prototype.onClickUnder = function(){
    this.disableAll();
    
    AudioController.instance.playSound('Click');
    GameController.instance.betGame('under');

    this.changeTexture(this.underButton, this.under_enable);
};

Bottom.prototype.onClickSeven = function(){
    this.disableAll();

    AudioController.instance.playSound('Click');
    GameController.instance.betGame('seven');

    this.changeTexture(this.sevenButton, this.seven_enable);
};

Bottom.prototype.onClickOver = function(){
    this.disableAll();

    AudioController.instance.playSound('Click');
    GameController.instance.betGame('over');

    this.changeTexture(this.overButton, this.over_enable);
};

Bottom.prototype.setEnableColor = function(target) {
    target.enabled = true;
};

Bottom.prototype.setDisableColor = function(target) {
    target.enabled = false;
};

Bottom.prototype.disableAll = function() {
    clearTimeout(this.winEffectTimer);

    this.setDisableColor(this.lBell);
    this.setDisableColor(this.rBell);

    this.startButton.enabled = false;

    this.underButton.button.active = false;
    this.sevenButton.button.active = false;
    this.overButton.button.active = false;

    this.winResult.enabled = false;
    this.loseResult.enabled = false;

    this.betUi.enabled = false;
};


Bottom.prototype.setIdle = function() {
    this.disableAll();
    this.buttonOff();

    setTimeout( () => {
        this.startButton.enabled = true;
    }, 1000);
};

Bottom.prototype.setStartGame = function() {
    this.disableAll();

    setTimeout( () => {
        this.underButton.button.active = true;
        this.sevenButton.button.active = true;
        this.overButton.button.active = true;
    }, 1000);
};

Bottom.prototype.playWinEffect = function() {
    this.bellToggle = !this.bellToggle;
    this.setDisableColor(this.bellToggle ? this.lBell : this.rBell);
    this.setEnableColor(!this.bellToggle ? this.lBell : this.rBell);

    this.winEffectTimer = setTimeout( () => {
        this.playWinEffect();
    }, 150);
};

Bottom.prototype.setResultGame = function(isWin, profit) {
    console.log('setResultGame', isWin, profit);
    setTimeout( () => {
        this.disableAll();
        if (isWin){
            AudioController.instance.playSound('Win');
            this.playWinEffect();
            this.profit.element.text = `+${profit}`;
        }
        else{
            AudioController.instance.playSound('Lose');
        }
        this.winResult.enabled = isWin;
        this.loseResult.enabled = !isWin;
    }, 1000);
};

// AudioController.js
var AudioController = pc.createScript('audioController');

AudioController.attributes.add('soundSource', {'type':'entity'});

AudioController.prototype.initialize = function() {
    AudioController.instance = this;

    this.isMute = true;
    this.soundSource.sound.volume = 0;
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

    setButton(this.cancelButton, this.onBetCancel, this);
    setButton(this.okButton, this.onBetOk, this);
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

// SoundButton.js
var SoundButton = pc.createScript('soundButton');

SoundButton.attributes.add('onImg', {type:'entity'});
SoundButton.attributes.add('offImg', {type:'entity'});

SoundButton.prototype.initialize = function() {
    SoundButton.instance = this;
    this.isMute = true;
    this.setButton(this.entity, this.onClick);
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

