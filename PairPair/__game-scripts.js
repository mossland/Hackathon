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

    this.gameDeck = null;
};

DummyServer.prototype.login = async function() {
    this.userBalance = getRandomInt(1000, 5000);
    //let json = await loadJsonFromUrl(`https://randomuser.me/api/`);
    
    return {
        id : 'userName',
        balance : this.userBalance,
    };
};

DummyServer.prototype.initGame = function() {
    this.gameDeck = getDeck();
    this.gameDeck = shuffle(this.gameDeck);

    let banker = [];
    let player1 = [];
    let player2 = [];
    let player3 = [];
    let player4 = [];

    banker.push(this.gameDeck[0]);
    player1.push(this.gameDeck[1]);
    player2.push(this.gameDeck[2]);
    player3.push(this.gameDeck[3]);
    player4.push(this.gameDeck[4]);

    let result = {
        banker : banker,
        player1 : player1,
        player2 : player2,
        player3 : player3,
        player4 : player4,
    };

    return result;
};

DummyServer.prototype.playerResult = function() {
    let cards = [];
    return {
        cards : cards,
        number : 0, 
        multiply  : 0, 
        isPair : false, 
        isWin : 0, // 0 : win, 1 : draw, 2 : lose
    };
};

DummyServer.prototype.setCards = function(player) {
    if (player.cards[0].number == player.cards[1].number){
        player.isPair = true;
        player.number = player.cards[0].number;
    }
    else{
        player.isPair = false;
        player.number = (player.cards[0].number + player.cards[1].number)%10;
    }
    player.multiply = player.cards[0].number * player.cards[1].number;
};

DummyServer.prototype.compairCards = function(banker, player) {
    if (banker.isPair == true && player.isPair === true){
        if (banker.number > player.number)        player.isWin = 2;
        else if (banker.number === player.number) player.isWin = 1;
        else if (banker.number < player.number)   player.isWin = 0;

        return;
    }

    if (banker.isPair == true && player.isPair === false){
        player.isWin = 2;

        return;
    }

    if (banker.isPair == false && player.isPair === false){
        if (banker.number > player.number)        player.isWin = 2;
        else if (banker.number === player.number) {
            if (banker.multiply > player.multiply)         player.isWin = 2;
            else if (banker.multiply ===  player.multiply) player.isWin = 1;
            else if (banker.multiply < player.multiply)    player.isWin = 0;
        }
        else                                      player.isWin = 0;

        return;
    }
};

DummyServer.prototype.startGame = function(betAmount, playerNumber) {
    //0 : banker, 1~4 : player
    let players = [];
    for(let i = 0; i < 5; ++i){
        let temp = this.playerResult();
        temp.cards.push(this.gameDeck[i]);
        temp.cards.push(this.gameDeck[i+5]);

        this.setCards(temp);
        players.push(temp);
    }

    for(let i = 1; i < 5; ++i){
        this.compairCards(players[0], players[i]);
    }

    console.log(players);

    this.userBalance = this.userBalance - betAmount;
    this.betAmount = betAmount;

    let isWin = players[playerNumber].isWin;

    let profit = 0;
    if (isWin === 0) profit = betAmount * 2;
    else if (isWin === 1)  profit = betAmount;
    else profit = 0;
    
    this.userBalance = this.userBalance + profit;

    let betReturn = {
        balance : this.userBalance,
        betAmount : this.betAmount,
        profit : profit,
        banker : players[0],
        player1 : players[1],
        player2 : players[2],
        player3 : players[3],
        player4 : players[4],
        isWin : isWin
    };
    
    return betReturn;
};

// Function.js
var GlobalFunction = pc.createScript('globalFunction');

function getRandomInt (min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; 
}



var CardType = {
    Clubs:      0,
    Spades:     1,
    Diamonds:   2,
    Hearts:     3,
};

var CardNumber = {
    Ace:   1,
    Two:   2,
    Three: 3,
    Four:  4,
    Five:  5,
    Six:   6,
    Seven: 7,
    Eight: 8,
    Nine:  9,
    Ten:   10,
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
    return new pc.Color(255/255, 136/255, 116/255, 1);
}

function getEColor() {
    return new pc.Color(86/255, 98/255, 181/255, 1);
}

function getQColor() {
    return new pc.Color(168/255, 216/255, 131/255, 1);
}

function getRedColor() {
    return rgbToColor(221, 42, 63, 255);
}

function getGreenColor() {
    return rgbToColor(0, 148, 68, 255);
}

function getBlueColor() {
    return rgbToColor(0, 169, 215, 255);
}

function getBlackColor() {
    return rgbToColor(0, 0, 0, 255);
}

function setButton(btn, handler, entity) {
    btn.button.on('touchend', handler, entity);
    btn.button.on('mouseup', handler, entity);
}

function rgbToColor(r, g, b, a) {
    return new pc.Color(r/255, g/255, b/255, a/255);
}


function getCommaText(number) {
    let num = number;
    let commas = num.toLocaleString("en-US");

    return commas;
}


function changeTexture(target, texture) {
    target.element.texture = texture.resource;
}

// CardFront.js
var CardFront = pc.createScript('cardFront');

CardFront.attributes.add('numberText', {type: 'entity'});
CardFront.attributes.add('typeImage', {type: 'entity'});
CardFront.attributes.add('fruitImage', { type: 'asset', assetType: 'texture', array: true });

CardFront.prototype.initialize = function() {
};

// 0~3
CardFront.prototype.setCardType = function(cardType) {
    let target = this.fruitImage[cardType].resource;
    this.typeImage.element.texture = target;

    if (cardType <2)    this.numberText.element.color = getBlackColor();
    else                this.numberText.element.color = getRedColor();
};

CardFront.prototype.setCardNumber = function(number) {
    let text = number;
    if (number === 1)   text = 'A';
    else if (number === 11)   text = 'J';
    else if (number === 12)   text = 'Q';
    else if (number === 13)   text = 'K';

    this.numberText.element.text = `${text}`;
};

CardFront.prototype.setCard = function(cardType, number) {
    this.setCardType(cardType);
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

// 0 : banker, 1 ~ 4 : player
Middle.attributes.add('players', {type: 'entity', array : true});

Middle.prototype.initialize = function() {
    Middle.instance = this;
    this.idleTimer = null;

    this.setReady();
};

Middle.prototype.postInitialize = function() {

};

Middle.prototype.update = function(dt) {
    
};

Middle.prototype.selectPlayer = function(idx) {
    console.log(idx);
    this.players[idx].script.player.selectPlayer();

};


Middle.prototype.setIdle = function() {
    return;

    this.idleTimer = setTimeout(() => {
        AudioController.instance.playSound('Open');
        let card = shuffle(getDeck());
        this.setOpenCard(card[0].type, card[0].number);
        this.setHiddenCard(card[1].type, card[1].number);
        this.setResultText(card[0].number, card[1].number);
        this.setIdle();
    }, 4000);  
};

Middle.prototype.dispenseCard = async function (){
    for (let i = 0; i < 5; ++i){
        this.players[i].script.player.showCard(0);
        await delay(200);
    }

    for (let i = 0; i < 5; ++i){
        this.players[i].script.player.showCard(1);
        await delay(200);
    }
};

Middle.prototype.setCard = function(idx, cards) {
    this.players[idx].script.player.setCard(cards);
};

Middle.prototype.setResult = async function(idx, result) {
    await this.players[idx].script.player.setResult(result.number, result.isPair, result.multiply, idx === 0 ? null : result.isWin);
};

Middle.prototype.setReady = function() {
    this.players.forEach(player => {
            player.script.player.reset();  
        }
    );


};


// Card.js
var Card = pc.createScript('card');

Card.attributes.add('cardRoot', {type: 'entity'});
Card.attributes.add('cardFront', {type: 'entity'});

Card.prototype.initialize = function() {
    
};

Card.prototype.setCard = function(cardType, number) {
    this.cardRoot.enabled = true;
    this.cardRoot.setLocalEulerAngles(0, 0, 0);
    this.cardFront.script.cardFront.setCard(cardType, number);  
};

Card.prototype.setReady = function() {
    this.cardRoot.enabled = true;
    this.cardRoot.setLocalEulerAngles(0, 180, 0);
};

Card.prototype.setHide = function() {
    this.cardRoot.enabled = false;
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

GameController.prototype.update = function(dt) {
    
};

GameController.prototype.betStart = function() {
    BetController.instance.reset();
    Middle.instance.setReady();
    Bottom.instance.setBet();
};

GameController.prototype.startGame = async function(betAmount) {
    //Bottom.instance.disableAll();
    Bottom.instance.betUi.enabled = false;
    await Middle.instance.dispenseCard();

    

    let del = 300;

    let result = DummyServer.instance.initGame();

    let temp = [];
    temp.push(result.banker);
    temp.push(result.player1);
    temp.push(result.player2);
    temp.push(result.player3);
    temp.push(result.player4);

    for(let i = 0; i < temp.length; ++i){
        Middle.instance.setCard(i, temp[i]);
        await delay(del);
    }
    /*
    Middle.instance.setCard(0, result.banker);
    await delay(del);
    Middle.instance.setCard(1, result.player1);
    await delay(del);
    Middle.instance.setCard(2, result.player2);
    await delay(del);
    Middle.instance.setCard(3, result.player3);
    await delay(del);
    Middle.instance.setCard(4, result.player4);
    await delay(del);
    */

    Bottom.instance.setStartGame();
};

// rtb => 0 : red, 1 : tie, 2 : blue
GameController.prototype.betGame = async function(betAmount, playerNum) {
    let result = DummyServer.instance.startGame(betAmount, playerNum);
    
    let del = 300;
    let resultDeley = 200;

    Middle.instance.selectPlayer(playerNum);

    UserBalance.instance.setBalance(UserBalance.instance.getUserBalance() - betAmount);
    await delay(del);

    console.log(result);

    let temp = [];
    temp.push(result.banker);
    temp.push(result.player1);
    temp.push(result.player2);
    temp.push(result.player3);
    temp.push(result.player4);

    for(let i = 0; i < temp.length; ++i){
        Middle.instance.setCard(i, temp[i].cards);
        await delay(resultDeley);
        await Middle.instance.setResult(i, temp[i]);
        await delay(del);
    }
    /*
    
    Middle.instance.setCard(0, result.banker.cards);
    await Middle.instance.setResult(0, result.banker);
    await delay(del);

    Middle.instance.setCard(1, result.player1.cards);
    await delay(resultDeley);
    await Middle.instance.setResult(1, result.player1);
    await delay(del);

    Middle.instance.setCard(2, result.player2.cards);
    await delay(resultDeley);
    await Middle.instance.setResult(2, result.player2);
    await delay(del);

    Middle.instance.setCard(3, result.player3.cards);
    await delay(resultDeley);
    await Middle.instance.setResult(3, result.player3);
    await delay(del);

    Middle.instance.setCard(4, result.player4.cards);
    await delay(resultDeley);
    await Middle.instance.setResult(4, result.player4);
    await delay(del);
    */


    await delay(700);
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
Bottom.attributes.add('start_active', { type: 'asset', assetType: 'texture' });
Bottom.attributes.add('start_deactive', { type: 'asset', assetType: 'texture' });

Bottom.attributes.add('playerButtons', {type: 'entity', array : true});

Bottom.attributes.add('winResult', {type: 'entity'});
Bottom.attributes.add('winText', {type: 'entity'});
Bottom.attributes.add('profit', {type: 'entity'});
Bottom.attributes.add('loseResult', {type: 'entity'});

Bottom.attributes.add('betUi', {type:'entity'});

Bottom.prototype.initialize = function() {
    Bottom.instance = this;

    this.setButton(this.startButton, this.onClickStart);

    this.disableAll();

    this.winEffectTimer = null;

    
    this.bellToggle = false;
};

Bottom.prototype.setButton = function(btn, clickHandler){
    btn.button.on('touchend', clickHandler, this);
    btn.button.on('mouseup', clickHandler, this);
};

Bottom.prototype.onClickStart = function(){
    AudioController.instance.playSound('Click');
    GameController.instance.betStart();

    this.changeButtonState(this.startButton, false);
    this.changeTexture(this.startButton, this.start_active);
};

Bottom.prototype.onClickPlayer = function(playerNumber){
    //this.disableAll();
    this.activePlayerBtn(false);

    AudioController.instance.playSound('Click');
    GameController.instance.betGame(BetController.instance.betAmount, playerNumber);
};

Bottom.prototype.changeTexture = function(target, texture){
    target.element.texture = texture.resource;
};


Bottom.prototype.changeButtonState = function(target, isActive){
    target.button.active = isActive;
};

Bottom.prototype.disableAll = function() {
    clearTimeout(this.winEffectTimer);

    this.changeButtonState(this.startButton, false);
    this.changeTexture(this.startButton, this.start_deactive);

    this.playerButtons.forEach(e => e.script.betButton.activeButton(false));

    this.winResult.enabled = false;
    this.loseResult.enabled = false;

    this.betUi.enabled = false;
};

Bottom.prototype.setBet = function() {
    this.disableAll();
    this.betUi.enabled = true;

    this.changeButtonState(this.startButton, false);
    this.activePlayerBtn(false);
};

Bottom.prototype.setIdle = function() {
    this.disableAll();

    setTimeout( () => {
        this.changeButtonState(this.startButton, true);
        this.playerButtons.forEach(e => {
            e.script.betButton.changeButtonImage(false);
            e.script.betButton.activeButton(false);
        });
    }, 1000);
};

Bottom.prototype.setStartGame = async function() {
    //this.disableAll();

    this.activePlayerBtn(true);
};

Bottom.prototype.activePlayerBtn = function(isActive) {
    this.playerButtons.forEach(e => e.script.betButton.activeButton(isActive));
};

Bottom.prototype.setResultGame = function(isWin, profit) {
    console.log('setResultGame', isWin, profit);
    setTimeout( () => {
        this.disableAll();
        if (isWin === 0){
            AudioController.instance.playSound('Win');
            //this.playWinEffect();
            this.winText.element.text = `WIN`;
            this.profit.element.text = `+${profit}`;

            this.winResult.enabled = true;
        }
        else if (isWin === 1){
            AudioController.instance.playSound('Win');
            //this.playWinEffect();
            this.winText.element.text = `DRAW`;
            this.profit.element.text = `+${profit}`;

            this.winResult.enabled = true;
        }
        else{
            AudioController.instance.playSound('Lose');

            this.loseResult.enabled = true;
        }
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

    this.updateText();

    return true;
};

BetController.prototype.updateText = function() {
    let commaText = getCommaText(this.betAmount);
    this.betAmountText.element.text = `${commaText}`;
};


BetController.prototype.onBetClear = function() {
    AudioController.instance.playSound('Click');
    console.log('BetController.prototype.onBetClear');
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


// Player.js
var Player = pc.createScript('player');

Player.attributes.add('winLose', { type: 'entity' });
Player.attributes.add('pair', { type: 'entity' });
Player.attributes.add('cards', { type: 'entity', array : 'true' });

Player.attributes.add('nonSelImg', { type: 'asset', assetType: 'texture' });
Player.attributes.add('selImg', { type: 'asset', assetType: 'texture' });

Player.attributes.add('winImg', { type: 'asset', assetType: 'texture' });
Player.attributes.add('loseImg', { type: 'asset', assetType: 'texture' });
Player.attributes.add('draw', { type: 'asset', assetType: 'texture' });

Player.prototype.initialize = function() {
    
};

Player.prototype.reset = function() {
    this.winLose.enabled = false;
    this.pair.element.text = `?`;

    changeTexture(this.entity, this.nonSelImg);

    this.cards.forEach(card => {
            card.script.card.setHide();  
        }
    );    
};

Player.prototype.selectPlayer = function() {
    changeTexture(this.entity, this.selImg);
};

Player.prototype.showCard = function(cardNum) {
    AudioController.instance.playSound('moveCard');
    this.cards[cardNum].script.card.setReady();  
};

Player.prototype.setCard = function(cards) {
    let sum = 0;
    AudioController.instance.playSound('flipCard');
    for(let i = 0; i < cards.length; ++i){
        this.cards[i].script.card.setCard(cards[i].type, cards[i].number);  
        sum += cards[i].number;
    }
    if (cards.length == 1){
        this.pair.element.text = `${sum%10}`;    
    }
    /*
    if (cards.length >= 2){
        if (cards[0].number === cards[1].number){
            this.pair.element.text = `Pair\n${cards[1].number}`;
            return;
        }
    }
    console.log(sum);
    this.pair.element.text = `${sum%10}`;
    */
};

//0 : win, 1 : draw, 2 : lose
Player.prototype.setResult = async function(sum, isPair, multi, isWin) {
    await delay(100);
    if (isPair)
        this.pair.element.text = `Pair\n${sum}`;
    else
        this.pair.element.text = `${sum}\n(${multi})`;
    
    await delay(100);

    if (isWin === null)
        return;

    this.winLose.enabled = true;
    if      (isWin === 0 ){
        AudioController.instance.playSound('pWin');
        changeTexture(this.winLose, this.winImg);
    } 
    else if (isWin === 1 ){
        AudioController.instance.playSound('pDraw');
        changeTexture(this.winLose, this.draw);
    } 
    else {
        AudioController.instance.playSound('pLose');
        changeTexture(this.winLose, this.loseImg);
    }                   
};


// BetButton.js
var BetButton = pc.createScript('betButton');

BetButton.attributes.add('playerNumber', { type: 'number'});
BetButton.attributes.add('enableImage', { type: 'asset', assetType: 'texture' });
BetButton.attributes.add('disableImage', { type: 'asset', assetType: 'texture' });

BetButton.prototype.initialize = function() {
    this.entity.children[0].element.text = `Player\n${this.playerNumber}`;

    setButton(this.entity, this.onClick, this);
};

BetButton.prototype.onClick = function() {
    this.activeButton(false);
    
    this.changeButtonImage(true);

    Bottom.instance.onClickPlayer(this.playerNumber);
};

BetButton.prototype.activeButton = function(isActive) {
    this.entity.button.active = isActive;
};

BetButton.prototype.changeButtonImage = function(isEnabled) {
    changeTexture(this.entity, isEnabled ? this.enableImage : this.disableImage);
};

