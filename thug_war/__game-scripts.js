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


Background.prototype.update = function(dt) {

};

// Prefab.js
var Prefab = pc.createScript('prefab');

Prefab.PoolMaxSizePerItem = 30;

Prefab.attributes.add('card', {'type':'entity'});
Prefab.attributes.add('winEffectProfile', {'type':'entity'});

function safeDestroy(obj) {
    if (obj.prefabName === undefined)  
        obj.destroy();
    else
        Prefab.return(obj);
};

Prefab.prototype.initialize = function() {
    Prefab.instance = this;
    Prefab.cache = {};
    
    Prefab.preload();
};

Prefab.preload = function() {
};

Prefab.create = function(name) {
    //console.log('Prefab.create ' + name);
    prefab = Prefab.instance[name];

    if (Prefab.cache[name] === undefined ||
        Prefab.cache[name].length === 0) {
        
        let clone = prefab.clone();  
        clone.enabled = true;
        prefab.parent.addChild(clone);     
        
        Prefab.recycle(clone);
        clone.prefabName = name;
        
        return clone;
    }
    else {
        let cache = Prefab.cache[name][0];
        Prefab.cache[name].splice(0, 1);
        cache.prefabName = name;
        cache.enabled = true;
        
        Prefab.recycle(cache);
        
        return cache;
    }
};

Prefab.return = function(obj) {
    let name = obj.prefabName;
    
    obj.enabled = false;
    
    if (Prefab.cache[name] === undefined)
        Prefab.cache[name] = [obj];
    else {
        if (Prefab.cache[name].length >= Prefab.PoolMaxSizePerItem)
            obj.destroy();
        else
            Prefab.cache[name].push(obj);
    }
};

Prefab.recycle = function(obj) {
    setTimeout(() => {
        Prefab.recycleParticle(obj);    
    }, 1);
};
Prefab.recycleParticle = function(obj) {
    if (obj.particlesystem !== undefined) {
        obj.particlesystem.reset();
        obj.particlesystem.play();
    }
    for (let i=0;i<obj.children.length;i++)
        Prefab.recycleParticle(obj.children[i]);
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

UserBalance.prototype.update = function(dt) {

};

// ThugItem.js
var ThugItem = pc.createScript('thugItem');

ThugItem.attributes.add('thugImage', {type: 'entity'});
ThugItem.attributes.add('thugId', {type: 'entity'});
ThugItem.attributes.add('cover', {type: 'entity'});

ThugItem.prototype.initialize = function() {
    this.thugInfo = null;
};

ThugItem.prototype.setThug = function(thugInfo) {
    if (this.cover)
        this.cover.enabled = false;

    if (this.thugInfo != null){
        if (this.thugInfo.id === thugInfo.id)
            return;
    }

    this.thugInfo = thugInfo;
    
    this.thugImage.setTextureFromURL(thugInfo.url);
    this.thugId.element.text = `# ${thugInfo.id}`;
};

ThugItem.prototype.getImageResource = function() {
    return this.thugImage.element.texture;
};

ThugItem.prototype.update = function(dt) {

};

ThugItem.prototype.setReady = function() {
    if (!this.cover)
        return;
    this.cover.enabled = true;
    this.thugId.element.text = '?';
};

// GameController.js
var GameController = pc.createScript('gameController');

GameController.prototype.initialize = function() {
    GameController.instance = this;  

    this.idleTimer = null;
    this.prevIdleNum = 0;

    this.resultTimer = null;
};

GameController.prototype.postInitialize = function() {
    this.init();
    this.setIdle();
};

GameController.prototype.init = async function() {
    let loginInfo = await DummyServer.instance.login();
    console.log(loginInfo);

    this.setThugList(loginInfo.thugId);

    UserBalance.instance.setBalance(loginInfo.balance);
    UserBalance.instance.setUserName(loginInfo.id);
};

GameController.prototype.setThugList = function(thugList) {
    let thugInfos = [];
    for(let i = 0; i < 10; ++i){
        let id = thugList[i];
        let info = {
            url : `https://asset.thecyberthug.com/cyberthug-genesis-club/tokens/${id}/asset/asset.png`,
            number : i,
            id : id
        };

        thugInfos.push(info);
    }
    ThugList.instance.setThug(thugInfos);
};

GameController.prototype.betStart = function(){
    GameController.instance.stopIdle();
    BetController.instance.reset();
    Bottom.instance.setBet();

    Center.instance.enableFirst();
    Top.instance.setReady();
};


//C      S 

//C  bet/betAmount->    S 
//C  <- thugInfo/startNum    S 

//C  hi/lo->    S 
//C  <- secondNum, profit, amount, winLose    S 

GameController.prototype.startGame = async function(betAmount) {
    this.stopIdle();
    Center.instance.enableFirst();
    let thudInfo = await DummyServer.instance.startGame(betAmount);
    this.setThugList(thudInfo.thugId);
    let startNum = thudInfo.startNum;

    console.log(thudInfo);
    Top.instance.setStartNum(startNum);
    Bottom.instance.setPlay(startNum);
    UserBalance.instance.setBalance(thudInfo.balance);
    Center.instance.enableLast();
};

GameController.prototype.endGame = async function(isHi) {
    let result = await DummyServer.instance.betHiLo(isHi);
    console.log(result);

    Center.instance.enableLast();
    let lastNum = getRandomInt(0, 10);
    Top.instance.setLastNum(result.lastNum);
    await delay(1500);
    
    Bottom.instance.setResult(result);
    UserBalance.instance.setBalance(result.balance);
};

GameController.prototype.genThugInfo = function() {


};

GameController.prototype.update = function(dt) {

};


GameController.prototype.setIdle = function() {
    Bottom.instance.setIdle();
    let startNum = this.prevIdleNum;
    while (startNum == this.prevIdleNum){
        startNum = getRandomInt(0, 10);
    }

    this.prevIdleNum = startNum;
    Top.instance.setStartNum(startNum);
    Center.instance.disableLast();

    this.idleTimer = setTimeout(() => {
        this.setIdle();
    }, 3000);
};

GameController.prototype.stopIdle = function() {
    clearTimeout(this.idleTimer);
    clearTimeout(this.resultTimer);

    this.idleTimer = null;
    this.resultTimer = null;

    console.log(this.idleTimer);
    console.log(this.resultTimer);
};

// ThugList.js
var ThugList = pc.createScript('thugList');

ThugList.prototype.initialize = function() {
    ThugList.instance = this;  

    this.thugInfo = [];
};

ThugList.prototype.setThug = function(infoArr) {
    this.thugInfo = [];
    for(let i = 0; i < infoArr.length; ++i){
        let info = {
            url : infoArr[i].url,
            number : infoArr[i].number,
            id : infoArr[i].id, 
            imgAsset : null,
            isLoaded : false,
        };
        this.loadImage(info);

        this.thugInfo.push(info);
    }

    Top.instance.setThug(this.thugInfo);
};


ThugList.prototype.getThugInfo = function(number) {
    if (this.thugInfo.length === 0)
        return null;

    return this.thugInfo[number];
};

ThugList.prototype.isLoadedImage = function(){
    for(let i = 0; i < this.thugInfo.length; ++i){
        if (this.thugInfo[i].isLoaded === false)
            return false;
    }

    return true;
};

ThugList.prototype.loadImage = function(info){

    return;

    var self = this;
    var asset = this.app.assets.loadFromUrl(info.url, 'texture', function (error, asset) {
        if (error) {
            console.log(error);
            return;
        }
        info.imgAsset = asset.resource;
        info.isLoaded = true;
    });
};

ThugList.prototype.update = function(dt) {
    
};

// Top.js
var Top = pc.createScript('top');

Top.attributes.add('thugList', {type: 'entity', array: true});

Top.attributes.add('redArrow', {type: 'entity'});
Top.attributes.add('blueArrow', {type: 'entity'});

//first num : redArrow
//last num : blueArrow
Top.prototype.initialize = function() {
    Top.instance = this;
    this.blueArrowtween = null;
    this.redArrowtween = null;
};

Top.prototype.setReady = function() {
    this.redArrow.enabled = false;
};


Top.prototype.setThug = function(thugInfo) {
    for(let i = 0; i < 10; ++i){
        this.thugList[i].script.thugItem.setThug(thugInfo[i]);
    }
};

Top.prototype.getImage = function(number) {
    return this.thugList[number].script.thugItem.getImageResource();
};

Top.prototype.update = function(dt) {

};

Top.prototype.setStartNum = function(number) {
    this.blueArrow.enabled = false;
    this.setRedArrow(number);
};

Top.prototype.setLastNum = function(number) {
    this.blueArrow.enabled = true;
    this.blueArrow.setLocalPosition(this.redArrow.getLocalPosition());
    this.setBlueArrow(number);
};

Top.prototype.setRedArrow = function(number) {
    this.redArrow.enabled = true;
    AudioController.instance.playSound('RedArrow');
    this.redArrowtween = this.setArrow(number, this.redArrow, 0, function () {
        Center.instance.setStartNum(number);
    });
};

Top.prototype.setBlueArrow = function(number) {
    AudioController.instance.playSound('BlueArrow');
    this.blueArrowtween = this.setArrow(number, this.blueArrow, 0,  function () {
        Center.instance.setLastNum(number);
    });
};

Top.prototype.setArrow = function(number, target, offset, callback) {
    let posX = this.thugList[number].getLocalPosition().x;
    let tween = target.tween(target.getLocalPosition())
        .to(new pc.Vec3(posX, 0, 0), 0.2, pc.Linear)
        .on('complete', callback);
    tween.start();

    return tween;
};

// Center.js
var Center = pc.createScript('center');

Center.attributes.add('thugImage1', {type: 'entity'});
Center.attributes.add('thugImage2', {type: 'entity'});
Center.attributes.add('vsImage', {type: 'entity'});

Center.prototype.initialize = function() {
    Center.instance = this;
};


Center.prototype.enableFirst = function(){
    this.thugImage1.script.thugItem.setReady();
};

Center.prototype.setStartNum = function(startNum){
    //this.vsImage.enabled = false;
    //this.thugImage2.enabled = false;
    this.setImage(this.thugImage1, startNum);
};

Center.prototype.disableLast = function(){
    this.vsImage.enabled = false;
    this.thugImage2.enabled = false;
};

Center.prototype.enableLast = function(){
    this.vsImage.enabled = true;
    this.thugImage2.enabled = true;
    this.thugImage2.script.thugItem.setReady();
};

Center.prototype.setLastNum = function(lastNum){
    this.setImage(this.thugImage2, lastNum);
};

Center.prototype.setImage = function(target, number){
    let imageTarget = target;

    let thugInfo = ThugList.instance.getThugInfo(number);
    if (thugInfo === null)
        return;

    target.script.thugItem.setThug(thugInfo);
};

Center.prototype.update = function(dt) {

};

// Bottom.js
var Bottom = pc.createScript('bottom');

Bottom.attributes.add('startButton', {type:'entity'});
Bottom.attributes.add('hiButton', {type:'entity'});
Bottom.attributes.add('loButton', {type:'entity'});

Bottom.attributes.add('resultWin', {type:'entity'});
Bottom.attributes.add('resultWinMultiplier', {type:'entity'});
Bottom.attributes.add('resultWinProfit', {type:'entity'});

Bottom.attributes.add('resultLose', {type:'entity'});

Bottom.attributes.add('betUi', {type:'entity'});

Bottom.attributes.add('low_enabled', {type: 'asset', assetType: 'texture'});
Bottom.attributes.add('low_disabled', {type: 'asset', assetType: 'texture'});

Bottom.attributes.add('start_enabled', {type: 'asset', assetType: 'texture'});
Bottom.attributes.add('start_disabled', {type: 'asset', assetType: 'texture'});

Bottom.attributes.add('high_enabled', {type: 'asset', assetType: 'texture'});
Bottom.attributes.add('high_disabled', {type: 'asset', assetType: 'texture'});

Bottom.prototype.initialize = function() {
    Bottom.instance = this;

    setButton(this.startButton, this.onClickStart, this);
    setButton(this.hiButton, this.onClickHi, this);
    setButton(this.loButton, this.onClickLo, this);

    setButton(this.resultWin, this.onClickResult, this);
    setButton(this.resultLose, this.onClickResult, this);
};

Bottom.prototype.update = function(dt) {

};

Bottom.prototype.onClickStart = function() {
    AudioController.instance.playSound('Click');
    

    this.disableUI();
    this.startEnabled(true);

    GameController.instance.betStart();
};

Bottom.prototype.onClickHi = function() {
    AudioController.instance.playSound('Click');
    this.disableUI();
    this.highEnabled(true);
    GameController.instance.endGame(true);
};

Bottom.prototype.onClickLo = function() {
    AudioController.instance.playSound('Click');
    this.disableUI();
    this.lowEnabled(true);
    GameController.instance.endGame(false);
};

Bottom.prototype.onClickResult = function() {
    AudioController.instance.playSound('Click');
    this.disableUI();
    setTimeout(() => {
        GameController.instance.setIdle();
    }, 800);
    
};

Bottom.prototype.disableUI = function() {
    //this.startEnabled(false);
    //this.lowEnabled(false);
    //this.highEnabled(false);

    this.startButton.button.active = false;
    this.hiButton.button.active = false;
    this.loButton.button.active = false;

    this.resultWin.enabled = false;
    this.resultLose.enabled = false;
    this.betUi.enabled = false;
};

Bottom.prototype.setIdle = function() {
    this.disableUI();
    this.startButton.button.active = true;
    this.startEnabled(false);
    this.highEnabled(false);
    this.lowEnabled(false);

    this.hiButton.script.betButton.setIdle(true);
    this.loButton.script.betButton.setIdle(true);
};

Bottom.prototype.setBet = function() {
    this.disableUI();
    this.betUi.enabled = true;
};

Bottom.prototype.setPlay = function(startNum) {
    this.disableUI();
    this.setHiLo(startNum);
    this.hiButton.button.active = true;
    this.loButton.button.active = true;
};

Bottom.prototype.setResult = function(result) {
    this.disableUI();
    if (result.isWin === true){
        AudioController.instance.playSound('Win');
        this.resultWin.enabled = true;
        this.resultWinMultiplier.element.text = `${result.multiplier}x`;
        this.resultWinProfit.element.text = `+${parseFloat(result.profit.toFixed(2))}`;
    }
    else{
        AudioController.instance.playSound('Lose');
        this.resultLose.enabled = true;
    }
};

Bottom.prototype.lowEnabled = function(isEnabled){
    let child = this.loButton.children[0];
    this.changeTexture(child, isEnabled ? this.low_enabled : this.low_disabled);
};

Bottom.prototype.highEnabled = function(isEnabled){
    let child = this.hiButton.children[0];
    this.changeTexture(child, isEnabled ? this.high_enabled : this.high_disabled);
};

Bottom.prototype.startEnabled = function(isEnabled){
    let child = this.startButton.children[0];
    this.changeTexture(child, isEnabled ? this.start_enabled : this.start_disabled);
};

Bottom.prototype.changeTexture = function(target, texture){
    target.element.texture = texture.resource;
};

// current 0 - 9
Bottom.prototype.setHiLo = function(startNum) {
    let hiText = "";
    let loText = "";

    let hiProbability = 0;
    let loProbability = 0;

    let hiMultiplier = 0;
    let loMultiplier = 0;

    if (startNum === 0) {
        hiText = "Higher";
        loText = "Same";

        hiProbability = (9 / 10);
        loProbability = (1 / 10);
    }
    else if ( startNum === 9) {
        hiText = "Same";
        loText = "Lower";

        hiProbability = (1 / 10);
        loProbability = (9 / 10);
    }
    else {
        hiText = "Higher or Same";
        loText = "Lower or Same";

        hiProbability = ((10 - startNum) / 10);
        loProbability = (startNum + 1) / 10;
    }
    console.log(hiProbability);
    console.log(loProbability);

    hiMultiplier = (1 / hiProbability);
    loMultiplier = (1 / loProbability);

    hiProbability = (hiProbability * 100 ).toFixed(2);
    loProbability = (loProbability * 100 ).toFixed(2);

    hiMultiplier = (hiMultiplier).toFixed(2);
    loMultiplier = (loMultiplier).toFixed(2);

    this.hiButton.script.betButton.setText(hiText, hiProbability, hiMultiplier);
    this.loButton.script.betButton.setText(loText, loProbability, loMultiplier);
};

// DummyServer.js
var DummyServer = pc.createScript('dummyServer');


DummyServer.prototype.initialize = function() {
    DummyServer.instance = this;

    this.prevStartNum = -1;
    this.betAmount = -1;
    this.thugIdList = [];
    this.userBalance = 0;
};

DummyServer.prototype.login = async function() {
    this.userBalance = getRandomInt(1000, 5000);
    let thugInfo = await this.getThugList();

    //let json = await loadJsonFromUrl(`https://randomuser.me/api/`);
    
    return {
        id : 'UserName',
        balance : this.userBalance,
        thugId : thugInfo
    };
};


DummyServer.prototype.bet = function(amount) {
    let thugInfo = [];
    let info = {
            //url : `https://asset.thecyberthug.com/cyberthug-genesis-club/tokens/${i+56}/asset/asset.png`,
            number : 0,
            id : 0
    };

    return thugInfo;
};

DummyServer.prototype.startGame = async function(betAmount) {
    this.thugIdList = await this.getThugList();
    let startNum = getRandomInt(0, 10);
    
    this.prevStartNum = startNum;
    this.userBalance = this.userBalance - betAmount;
    this.betAmount = betAmount;

    let betReturn = {
        thugId : this.thugIdList,
        startNum : startNum, 
        balance : this.userBalance,
        betAmount : this.betAmount
    };

    return betReturn;
};

DummyServer.prototype.getThugList = async function() {
    let thugId = [];
    while(thugId.length !== 10){
        let id = getRandomInt(1, 10001);
        let result = await loadJson(id);
        if (result === true)
            thugId.push(id);
    }

    thugId.sort((a, b) => a - b);

    return thugId;
};



DummyServer.prototype.betHiLo = function (isHi) {
    let lastNum = getRandomInt(0, 10);

    let hiWin = false;
    let loWin = false;

    let hiProbability = 0;
    let loProbability = 0;

    let hiMultiplier = 0;
    let loMultiplier = 0;

    let result = this.prevStartNum - lastNum;

    if (result < 0 ){
        hiWin = true;
    }
    else if (result > 0 ){
        loWin = true;
        
    }
    else if (result === 0) {
        hiWin = true;
        loWin = true;

        if (this.prevStartNum === 0)
            hiWin = false;

        if (this.prevStartNum === 9)
            loWin = false;
    }
    else{
    }

    

    let startNum = this.prevStartNum;
    if (startNum === 0) {
        hiProbability = (9 / 10);
        loProbability = (1 / 10);
    }
    else if ( startNum === 9) {
        hiProbability = (1 / 10);
        loProbability = (9 / 10);
    }
    else {
        hiProbability = ((10 - startNum) / 10);
        loProbability = (startNum + 1) / 10;
    }

    hiMultiplier = (1 / hiProbability).toFixed(2);
    loMultiplier = (1 / loProbability).toFixed(2);

    console.log('betHiLo', hiMultiplier, loMultiplier, hiProbability, loProbability);


    let isWin = false;
    let multiplier = 0;
    if ( (isHi === true) && (hiWin === true)){
        isWin = true;
        multiplier = hiMultiplier;
        console.log('hiWin');
    }

    if ( (isHi === false) && (loWin === true)){
        isWin = true;
        multiplier = loMultiplier;
        console.log('loWin');
    }

    console.log('betHiLo2', isHi, hiWin, loWin, multiplier);

    let profit = 0;
    if (isWin === true){
        profit = this.betAmount * multiplier;
        this.userBalance = this.userBalance + profit;
    }

    return {isWin : isWin, 
            lastNum : lastNum, 
            multiplier : multiplier,
            balance : this.userBalance,
            profit : profit,
            };
};

DummyServer.prototype.update = function(dt) {
    
};

// async.js
/*jshint esversion:8*/

function resolveAfter2Seconds(){
    return new Promise( resolve =>{
        setTimeout(() => {
            resolve('resolved');
        }, 2000);
    });
}

async function ayncCall(){
    const result = await resolveAfter2Seconds();
    return result;
}

async function delay(ms){
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve(ms);
    }, ms)
  );
}


async function loadJson(id){
    let url = `https://asset.thecyberthug.com/cyberthug-genesis-club/tokens/${id}/asset/meta.json`

    return new Promise( resolve =>{
        this.loadJsonFromRemote(url, function (data) {
            let meta = JSON.stringify(data);

            let meta2 = JSON.parse(meta);
            if (meta2.description == "CyberTHUG Genesis Club")
                resolve(true);
            else
                resolve(false);
        });
    });
}

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

// Common.js
var Common = pc.createScript('common');

function getRandomInt (min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; 
}

function setButton(btn, handler, entity) {
    //btn.element.on('touchend', handler, entity);
    //btn.element.on('mouseup', handler, entity);
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

// BetButton.js
var BetButton = pc.createScript('betButton');

BetButton.attributes.add('descriptionText', {type:'entity'});
BetButton.attributes.add('probabilityText', {type:'entity'});
BetButton.attributes.add('multiplierText', {type:'entity'});
BetButton.attributes.add('idleText', {type:'entity'});

BetButton.prototype.initialize = function() {

};

BetButton.prototype.setIdle = function(isIdle) {
    this.idleText.enabled = isIdle;
    this.descriptionText.enabled = !isIdle;
    this.probabilityText.enabled = !isIdle;
    this.multiplierText.enabled = !isIdle;
};

BetButton.prototype.setText = function(d, p, m) {
    this.setIdle(false);
    this.descriptionText.element.text = d;
    this.probabilityText.element.text = `${p}%`;
    this.multiplierText.element.text = `(${m}x)`;
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

