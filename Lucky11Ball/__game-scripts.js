// BallResource.js
var BallResource = pc.createScript('ballResource');

BallResource.attributes.add('balls', {type: 'asset', assetType: 'texture', array: true});

BallResource.prototype.initialize = function() {
    BallResource.instance = this;
};

BallResource.prototype.getBall = function(ballNumber) {
    if (ballNumber >= 1 && ballNumber <= 11)
        return this.balls[ballNumber];
    else
        return this.balls[0];
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

// InGameButton.js
var InGameButton = pc.createScript('inGameButton');

InGameButton.attributes.add('deleteButton', {type: 'entity'});
InGameButton.attributes.add('confirmButton', {type: 'entity'});
InGameButton.attributes.add('cancelButton', {type: 'entity'});
InGameButton.attributes.add('randomNumberButton', {type: 'entity'});

InGameButton.attributes.add('numberImage', {type: 'entity', array: true});

InGameButton.prototype.initialize = function() {
    InGameButton.instance = this;

    setButton(this.deleteButton, this.onClickDeleteButton, this);
    //setButton(this.selectButton, this.onClickSelectButton, this);
    setButton(this.confirmButton, this.onClickConfirmButton, this);
    setButton(this.randomNumberButton, this.onClickRandomNumberButton, this);
    setButton(this.cancelButton, this.onClickCancelButton, this);
};


InGameButton.prototype.reset = function() {
    //this.moveNumberPos();
};

InGameButton.prototype.resetAllNumber = function() {
    this.numberImage.forEach( (ball) => {
        ball.script.numberButton.activeButton(true);
    });
};

InGameButton.prototype.activeButton = function(isActive) {

    this.deleteButton.button.active = isActive;
    this.confirmButton.button.active = isActive;
    this.randomNumberButton.button.active = isActive;
    this.cancelButton.button.active = isActive;

    this.numberImage.forEach( (ball) => {
        ball.script.numberButton.activeButton(isActive);
    });
};





InGameButton.prototype.moveNumberPos = function() {
};

InGameButton.prototype.onClickDeleteButton = function() {
    AudioController.instance.playSound('Click');
    Bottom.instance.userNumberDelete();
};

InGameButton.prototype.onClickSelectButton = function(number) {
    AudioController.instance.playSound('Click');
    Bottom.instance.userNumberSet(number);  
};

InGameButton.prototype.onClickConfirmButton = function() {
    AudioController.instance.playSound('Click');
    Bottom.instance.confirmNumber();
};

InGameButton.prototype.onClickRandomNumberButton = function() {
    AudioController.instance.playSound('Click');
    Bottom.instance.setRandom();
};

InGameButton.prototype.onClickCancelButton = function() {
    AudioController.instance.playSound('Click');
    GameController.instance.betStart();
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
    this.userBalance = this.userBalance - betAmount;
    this.betAmount = betAmount;

    let betReturn = {
        balance : this.userBalance,
        betAmount : this.betAmount,
        openCard : this.openCard,
    };
    
    return betReturn;
};

DummyServer.prototype.betGame = function(betAmount, betNumber) {
    let deck = getDeck();
    deck = shuffle(deck);

    let ball = deck.splice(0, 3);
    let beforeResult = this.userBalance - betAmount;

    let matchedBall = [];
    for(let i = 0; i < ball.length; ++i){
        for(let j = 0; j < betNumber.length; ++j){
            if (ball[i] === betNumber[j])
                matchedBall.push(betNumber[j]);
        }
    }
    
    let multiplier = 0;
    let profit = 0;
    if (matchedBall.length === 1)   multiplier = 2;
    else if (matchedBall.length === 2)   multiplier = 7;
    else if (matchedBall.length === 3)   multiplier = 165;
    profit = betAmount * multiplier;
    this.userBalance = beforeResult + profit;

    let betReturn = {
        beforeResultBalance : beforeResult,
        balance : this.userBalance,
        betAmount : this.betAmount,
        ball : ball,
        winMultiplier : multiplier,
        profit : profit,
        result : matchedBall,
        isWin : multiplier !== 0,
    };
    console.log('betGame', betReturn);
    
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

    for(let i = 1; i < 12; ++i){
        deck.push(i);
    }
    
    return deck;
}


function getTypeColor(type) {
    let color = null;
    
    if (type === 0)        color = new pc.Color(1, 1, 1, 1);
    
    else if (type === 1)   color = new pc.Color(43/255, 226/255, 232/255, 1);
    
    else if (type === 2)   color = new pc.Color(62/255, 175/255, 94/255, 1);
    
    else                   color = new pc.Color(240/255, 83/255, 38/255, 1);

    return color;
    
}

function getNumberColor(number) {
    let color = null;

    //console.log('getNumberColor', number);
    switch (number){
        //yellow
        case 1:
        case 2:
            color = rgbToColor(241, 194, 50, 255);
            break;
        //blue
        case 3:
        case 4:
            color = rgbToColor(60, 120, 216, 255);
            break;
        //red
        case 5:
        case 6:
            color = rgbToColor(204, 0, 0, 255);
            break;
        //grey
        case 7:
        case 8:
            color = rgbToColor(102, 102, 102, 255);
            break;
        //green
        case 9:
        case 10:
        case 11:
            color = rgbToColor(106, 169, 79, 255);
            break;
        //white
        default :
            color = new pc.Color(1, 1, 1, 1);
            break;
    }
    
    return color;
}

function getReadyColor(type) {
    return new pc.Color(100/255, 100/255, 100/255, 1);
}

function getRankOrder(cards){
    let clone = cards.slice(0, cards.length);
    clone.sort(function(a, b) {
        let result = b.number - a.number;
        if (result != 0)
            return result;

        return b.type - a.type;
    });

    //console.log(clone);
    let returnStr = '';

    clone.forEach(e => returnStr += e.color);

    return returnStr;
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

function changeTexture(target, texture) {
    target.element.texture = texture.resource;
};

// async.js
/*jshint esversion:8*/
async function loadJsonFromUrl(url){
    return new Promise( resolve =>{
        this.loadJsonFromRemote(url, function (data) {
            //console.log(data);
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
};

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

Middle.attributes.add('resultBall', {type: 'entity', array : true});

Middle.prototype.initialize = function() {
    Middle.instance = this;
    this.idleTimer = null;

    this.isIdleState = false;
    this.isInGameState = false;
};

Middle.prototype.update = function(dt) {
    
};


Middle.prototype.setIdle = function() {
    this.isIdleState = true;
    this.doIdle();
    
};


Middle.prototype.setNumerSequence = function(resultArray) {

};

Middle.prototype.resetResultBall = function() {
    this.resultBall.forEach( (ball) => {
        ball.script.numberBall.setBallNumber(0);
    });
};

Middle.prototype.stateCheck = function(){
    return this.isIdleState;
};


Middle.prototype.setResult = async function(resultNumbers) {
    this.resetResultBall();
    AudioController.instance.playSound('IdleOpen');

    //shffle ball
    for(let i = 0; i < 3; ++i){
        this.resultBall[i].script.numberBall.startShuffle(resultNumbers.slice(i, resultNumbers.lenth));
        await delay(500);
        this.resultBall[i].script.numberBall.stopShuffle();
        this.resultBall[i].script.numberBall.setBallNumber(resultNumbers[i]);
        this.resultBall[i].script.numberBall.setBallNumber(resultNumbers[i]);
        Bottom.instance.checkMatched(resultNumbers[i]);
        await delay(300);
    }
};



Middle.prototype.doIdle = async function() {
    AudioController.instance.playSound('IdleOpen');
    let ball = shuffle(getDeck());
    let selectedCard = ball.slice(0, 3);
    //result ball reset
    this.resetResultBall();

    for(let i = 0; i < 3; ++i){
        this.resultBall[i].script.numberBall.startShuffle(ball.slice(i, ball.lenth));
        await delay(500);
        if (this.stateCheck() === false)  return;
        this.resultBall[i].script.numberBall.stopShuffle();
        this.resultBall[i].script.numberBall.setBallNumber(selectedCard[i]);
        this.resultBall[i].script.numberBall.setBallNumber(selectedCard[i]);
        AudioController.instance.playSound('ShowBall');
        await delay(300);
        if (this.stateCheck() === false)  return;
    }

    this.idleTimer = setTimeout(() => {
        this.doIdle();
    }, 4000);  
};

Middle.prototype.stopIdle = function() {
    clearTimeout(this.idleTimer);
    this.isIdleState = false;
};

Middle.prototype.setReady = function() {
    this.isIdleState = false;
    clearTimeout(this.idleTimer);

    let ball = shuffle(getDeck());
    //this.shuffleBall.script.numberBall.startShuffle(ball.slice(0, ball.lenth));
    this.resetResultBall();
    
    this.resultBall.forEach( (rBall) => {
        rBall.script.numberBall.startShuffle(ball.slice(0, ball.lenth));
    });
    
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
    //console.log(loginInfo);

    UserBalance.instance.setBalance(loginInfo.balance);
    UserBalance.instance.setUserName(loginInfo.id);
};

GameController.prototype.betStart = function() {
    BetController.instance.reset();
    Middle.instance.setReady();
    Bottom.instance.setBet();
};

GameController.prototype.startGame = function() {
    Middle.instance.setReady();
    Bottom.instance.setStartGame();
};


GameController.prototype.betGame = async function(betAmount, numbers) {
    let result = DummyServer.instance.betGame(betAmount, numbers);

    UserBalance.instance.setBalance(result.beforeResultBalance);


    let arr = [];

    let arr2 = result.ball.slice(0, 3);

    for(let i = 1; i < 12; ++i){
    arr.push(i);
    }

    for(let i = 0; i < arr2.length; ++i){
    arr = arr.filter(e => e !== arr2[i]);
    }
    arr = arr2.concat(arr);

    Middle.instance.setResult(arr);
    await delay(2500);

    Bottom.instance.setResultGame(result.isWin, result.winMultiplier, result.profit);
    UserBalance.instance.setBalance(result.balance);

    await delay(6000);

    Middle.instance.setReady();
    this.setIdle();
};


GameController.prototype.setIdle = function() {
    Middle.instance.setIdle();
    Bottom.instance.setIdle();
};


// Bottom.js
var Bottom = pc.createScript('bottom');

Bottom.attributes.add('userSelectionBall', {type: 'entity', array : true});
Bottom.attributes.add('matchedBG', {type: 'entity', array : true});

Bottom.attributes.add('sign', {type: 'entity'});

Bottom.attributes.add('startButton', {type: 'entity'});

Bottom.attributes.add('ballSelectUi', {type: 'entity'});

Bottom.attributes.add('winResult', {type: 'entity'});
Bottom.attributes.add('multiplier', {type: 'entity'});
Bottom.attributes.add('profit', {type: 'entity'});
Bottom.attributes.add('loseResult', {type: 'entity'});

Bottom.attributes.add('betUi', {type:'entity'});

Bottom.prototype.initialize = function() {
    Bottom.instance = this;

    this.setButton(this.startButton, this.onClickStart);

    this.betButtons = [];
    //this.disableAll();

    this.winEffectTimer = null;
    this.bellToggle = false;

    this.inGame = false;

    this.userSelectionNumber = [];
};

Bottom.prototype.postInitialize = function() {
    this.disableAll();
};

Bottom.prototype.setBet = function() {
    this.disableAll();
    this.betUi.enabled = true;
};


Bottom.prototype.setButton = function(btn, clickHandler){
    btn.element.on('touchend', clickHandler, this);
    btn.element.on('mouseup', clickHandler, this);
};

Bottom.prototype.onClickStart = function(){
    AudioController.instance.playSound('Click');
    GameController.instance.betStart();
};


Bottom.prototype.onClickBet = function(betType){
    if (this.inGame === false)
        return;
    this.disableAll();
    
    AudioController.instance.playSound('Click');
    GameController.instance.betGame(betType);
    this.inGame = false;
};


Bottom.prototype.setEnableColor = function(target) {
    //target.element.color = new pc.Color(1, 1, 1, 1);
    //target.element.texture = this.winColor.resource;
};

Bottom.prototype.setDisableColor = function(target) {
    //target.element.color = new pc.Color(0.5, 0.5, 0.5, 1);
    //target.element.texture = this.winGrey.resource;
};

Bottom.prototype.disableAll = function() {
    clearTimeout(this.winEffectTimer);

    //this.setDisableColor(this.lBell);
    //this.setDisableColor(this.rBell);

    this.startButton.enabled = false;

    this.betButtons.forEach(e => e.enabled = false);

    this.winResult.enabled = false;
    this.loseResult.enabled = false;

    this.sign.enabled = false;
    //this.ballSelectUi.enabled = false;
    InGameButton.instance.activeButton(false);

    this.betUi.enabled = false;
};


Bottom.prototype.setIdle = function() {
    this.disableAll();
    this.resetUserSelectionBall();
    this.moveSign.enabled = false;
    this.matchedBG.forEach( (ball) => {
        ball.enabled = false;
    });

    setTimeout( () => {
        this.startButton.enabled = true;
    }, 1000);
};

Bottom.prototype.resetUserSelectionBall = function() {
    this.userSelectionBall.forEach( (ball) => {
        ball.script.numberBall.setBallNumber(0);
    });
};

Bottom.prototype.userNumberDelete = function() {
    if (this.inGame === false)
        return;

    let idx = this.userSelectionNumber.length;

    if (idx <= 0)
        return;
    this.moveSign(idx - 1);
    this.userSelectionBall[idx - 1].script.numberBall.setBallNumber(0);

    this.userSelectionNumber.pop();
};


Bottom.prototype.setRandom = function(number) {
    if (this.userSelectionNumber.length >= 3)
        return;

    this.sign.enabled = false;

    let arr2 = this.userSelectionNumber.slice(0, this.userSelectionNumber.length);

    let ball = shuffle(getDeck());

    for(let i = 0; i < arr2.length; ++i){
        ball = ball.filter(e => e !== arr2[i]);
    }
    arr2 = arr2.concat(ball);
    this.userSelectionNumber = arr2.slice(0, 3);

    for(let i = 0; i < this.userSelectionNumber.length; ++i){
        let num = this.userSelectionNumber[i];
        this.userSelectionBall[i].script.numberBall.setBallNumber(num);
    }
};

Bottom.prototype.userNumberSet = function(number) {
    if (this.inGame === false)
        return;

    if (this.userSelectionNumber.includes(number) === true)
        return;

    let idx = this.userSelectionNumber.length;

    if (idx >= 3)
        return;
    this.moveSign(idx + 1);
    this.userSelectionNumber.push(number);
    this.userSelectionBall[idx].script.numberBall.setBallNumber(number);
};

Bottom.prototype.confirmNumber = function(){
    if (this.userSelectionNumber.length < 3)
        return;

    this.moveSign.enabled = false;

    this.disableAll();
    GameController.instance.betGame(BetController.instance.betAmount, this.userSelectionNumber);
};

Bottom.prototype.checkMatched = function(number){
    let isGreen = false;
    for(let i = 0 ; i < 3; ++i){
        if (this.userSelectionBall[i].script.numberBall.getBallNumber() === number){
            this.matchedBG[i].enabled = true;
            //ball.parent.element.color = new pc.Color(0, 1, 0, 1);
            isGreen = true;
        }       
    }
    

    if (isGreen) AudioController.instance.playSound('Green');
    else AudioController.instance.playSound('NonGreen');
};

Bottom.prototype.moveSign = function(idx) {
    if (idx > 2){
        this.sign.enabled = false;
        return;
    }   
    this.sign.enabled = true;
    let pos = this.sign.getLocalPosition();
    pos.x = this.userSelectionBall[idx].getLocalPosition().x;

    this.sign.setLocalPosition(pos);
};



Bottom.prototype.setStartGame = function() {
    this.disableAll();
    this.userSelectionNumber = [];
    this.resetUserSelectionBall();
    this.userSelectionBall.forEach( (ball) => {
        ball.parent.element.color = new pc.Color(0.4, 0.4, 0.4, 1);
    });

    setTimeout( () => {
        this.inGame = true;
        //this.ballSelectUi.enabled = true;
        InGameButton.instance.activeButton(true);
        InGameButton.instance.reset();
        this.sign.enabled = true;
        this.moveSign(0);
    }, 1000);
};

Bottom.prototype.playWinEffect = function() {
    return;
};

Bottom.prototype.setResultGame = function(isWin, multiplier, profit) {
    //this.disableAll();

    setTimeout( () => {
        if (isWin){
            AudioController.instance.playSound('Win');
            this.multiplier.element.text = `${multiplier}x`;
            this.profit.element.text = `+${profit}`;
            this.playWinEffect();
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
    
    console.log('AudioController.prototype.playSound', type);
    this.soundSource.sound.play(type);
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

// NumberBall.js
var NumberBall = pc.createScript('numberBall');

NumberBall.attributes.add('defaultNum', {type: 'number', default: 0});
NumberBall.attributes.add('numberText', {type: 'entity'});

NumberBall.prototype.initialize = function() {
    this.shuffleTween = null;
    
    this.ballNumber = this.defaultNum;

    this.isStartShuffle = false;
    this.delta = 0;

    this.shuffleTarget = [];
    
    this.sizeTween = null;
    this.scaleTween = null;
};

NumberBall.prototype.postInitialize = function(){
    this.setNumber(this.defaultNum);
};

NumberBall.prototype.stopAllTween = function(){
    if (this.sizeTween !== null) this.sizeTween.stop();
    if (this.scaleTween !== null) this.scaleTween.stop();
};

NumberBall.prototype.selectBall = function() {
    let duration = 0.2;
    this.stopAllTween();
    
    let element = this.entity.element;
    let sizeData = {
        value: element.width,
    };
    
    this.sizeTween = this.entity.tween(sizeData).to({value:200}, duration, pc.Linear);
    this.sizeTween.on('update', function (dt) {
        let newSize = parseFloat(sizeData.value.toFixed(0));
        element.width = newSize;
        element.height = newSize;
    });
    this.sizeTween.start();


    
    let child = this.entity.children[0];
    let scaleData = {
        value: child.getLocalScale().x,
    };
    this.scaleTween = child.tween(scaleData).to({value:2}, duration, pc.Linear);
    this.sizeTween.on('update', function (dt) {
        let newScale = parseFloat(scaleData.value.toFixed(0));
        child.setLocalScale(newScale, newScale, newScale);
    });
    this.scaleTween.start();
};

NumberBall.prototype.resetSize = function() {
    return;
    let duration = 0.1;
    this.stopAllTween();

    if ( this.entity.element.width !== 100){
        let element = this.entity.element;

        let sizeData = {
            value: element.width,
        };
        this.sizeTween = this.entity.tween(sizeData).to({value:100}, duration, pc.Linear);
        this.sizeTween.on('update', function (dt) {
            let newSize = parseFloat(sizeData.value.toFixed(0));
            element.width = newSize;
            element.height = newSize;
        });
        this.sizeTween.start();
    }

    let child = this.entity.children[0];
    if (child.getLocalScale().x !== 1){
        let scaleData = {
        value: child.getLocalScale().x,
    };
    this.scaleTween = child.tween(scaleData).to({value:1}, duration, pc.Linear);
    this.sizeTween.on('update', function (dt) {
        let newScale = parseFloat(scaleData.value.toFixed(0));
        child.setLocalScale(newScale, newScale, newScale);
    });
    this.scaleTween.start();
    }

};

NumberBall.prototype.setBallNumber = function(number) {
    this.stopShuffle();
    this.setNumber(number);
    this.ballNumber = number;
};

NumberBall.prototype.getBallNumber = function() {
    return this.ballNumber;
};

NumberBall.prototype.setNumber = function(number) {
    changeTexture(this.entity, BallResource.instance.getBall(number));
    /*
    if (number >= 1 && number <= 11)
        this.numberText.element.text = `${number}`;
    else
        this.numberText.element.text = `?`;
    
    let color = getNumberColor(number);
    //console.log('NumberBall.prototype.setNumber', color);
    this.entity.element.color = getNumberColor(number);
    */
};

NumberBall.prototype.update = function(dt) {
    if (this.isStartShuffle === false)
        return;
    //console.log('NumberBall.prototype.update', dt);
    this.delta += dt;

    if (this.delta > 0.04){
        this.delta = 0;
        let max = this.shuffleTarget.length;
        let selectNum = getRandomInt(1, max);
        this.setNumber(this.shuffleTarget[selectNum]);
    }
};

NumberBall.prototype.startShuffle = function(array) {
    this.isStartShuffle = true;
    this.delta = 0;

    this.shuffleTarget = array.slice(0, array.length);
};

NumberBall.prototype.stopShuffle = function() {
    this.isStartShuffle = false;
};

// NumberButton.js
var NumberButton = pc.createScript('numberButton');

NumberButton.attributes.add('defaultNum', {type: 'number', default: 0});
NumberButton.attributes.add('select', {type: 'asset', assetType: 'texture'});
NumberButton.attributes.add('deselect', {type: 'asset', assetType: 'texture'});

// initialize code called once per entity
NumberButton.prototype.initialize = function() {
    this.entity.children[0].element.text = `${this.defaultNum}`;

    setButton(this.entity, this.onClick, this);
};

NumberButton.prototype.onClick = function() {
    this.activeButton(false);
    InGameButton.instance.onClickSelectButton(this.defaultNum);
};

NumberButton.prototype.activeButton = function(isActive) {
    this.entity.button.active = isActive;

    changeTexture(this.entity, isActive? this.select : this.deselect);
};

