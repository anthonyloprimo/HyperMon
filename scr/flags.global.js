/* 
    flags.global.js
    Persistent key-value flag store for gameplay state, events, and object self-switches.

    Goals:
    - Provide a tiny, dependency-free, IIFE module that attaches to window as `Flags`.
    - Work in file:// and http(s) contexts; degrade safely if localStorage is unavailable.
    - Namespacing helpers for global, per-map, and per-object ("self-switch") flags.
    - Generous comments to explain usage and behavior.

    API (summary):
        Flags.get(key, defaultValue)
        Flags.set(key, value)
        Flags.has(key)                  // boolean convenience; true iff value === true
        Flags.del(key)
        Flags.keys(prefix?)             // returns array of keys (optionally filtered by prefix)
        Flags.all()                     // shallow copy of the internal store (for debugging/UIs)
        Flags.clear()                   // wipes all flags in this store
        Flags.ns(prefix)                // returns namespaced { get, set, has, del, keys }
        Flags.self(mapId, objId)        // returns ns("self:<mapId>:<objId>") helpers

        Flags.save() / Flags.load()     // exposed primarily for debugging; writes are auto-debounced
*/

(function (g) {
    "use strict";

    // Storage key and in-memory state. Versioned in case the format evolves.
    var STORAGE_KEY = "hypermon.flags.v1";
    var _state = Object.create(null);
    var _dirty = false;
    var _saveTimer = null;

    // Try to determine if localStorage is available (may fail in some embedded contexts).
    function _storageAvailable() {
        try {
            var testKey = "__flags_test__";
            window.localStorage.setItem(testKey, "1");
            window.localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            return false;
        }
    }
    var _canPersist = _storageAvailable();

    // Load flags from storage (if available). Fallback to empty object on any failure.
    function load() {
        if (!_canPersist) {
            _state = Object.create(null);
            _dirty = false;
            return;
        }
        try {
            var raw = window.localStorage.getItem(STORAGE_KEY);
            if (!raw) {
                _state = Object.create(null);
            } else {
                var parsed = JSON.parse(raw);
                // Ensure we always keep a clean, null-prototype record
                _state = Object.assign(Object.create(null), parsed || {});
            }
            _dirty = false;
        } catch (e) {
            // Corrupt or inaccessible storage; degrade gracefully
            _state = Object.create(null);
            _dirty = false;
        }
    }

    // Persist state to storage immediately (no debounce). Safe no-op if disabled.
    function save() {
        if (!_canPersist) return;
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(_state));
            _dirty = false;
        } catch (e) {
            // Ignore quota or serialization errors; keep working in-memory
        }
    }

    // Debounced save to reduce write churn when many flags flip in a short window.
    function _scheduleSave() {
        if (_saveTimer) clearTimeout(_saveTimer);
        _dirty = true;
        _saveTimer = setTimeout(function () {
            _saveTimer = null;
            if (_dirty) save();
        }, 100); // 100ms debounce window
    }

    // Core helpers

    // Returns value if present, otherwise defaultValue (undefined if not provided).
    function get(key, defaultValue) {
        var k = String(key);
        return (_state.hasOwnProperty(k)) ? _state[k] : defaultValue;
    }

    // Sets a key to a JSON-serializable value (boolean, number, string, object).
    function set(key, value) {
        var k = String(key);
        _state[k] = value;
        _scheduleSave();
        return value;
    }

    // Boolean convenience: true only if the value is strictly true (use get() for other types).
    function has(key) {
        var k = String(key);
        return _state[k] === true;
    }

    // Delete a key from the store.
    function del(key) {
        var k = String(key);
        if (_state.hasOwnProperty(k)) {
            delete _state[k];
            _scheduleSave();
            return true;
        }
        return false;
    }

    // Returns a shallow copy of state for inspection or UI.
    function all() {
        return Object.assign({}, _state);
    }

    // Returns keys, optionally filtered by a prefix (e.g., "map:viridian").
    function keys(prefix) {
        var out = [];
        var p = (prefix == null) ? null : String(prefix);
        for (var k in _state) {
            if (!_state.hasOwnProperty(k)) continue;
            if (p == null || k.indexOf(p) === 0) out.push(k);
        }
        return out;
    }

    // Clears all flags in this store (use with caution).
    function clear() {
        _state = Object.create(null);
        _scheduleSave();
    }

    // Namespacing: prepends "<prefix>:" automatically for get/set/has/del/keys.
    function ns(prefix) {
        var base = String(prefix);
        var make = function (suffix) { return base + ":" + String(suffix); };

        return {
            get: function (suffix, def) { return get(make(suffix), def); },
            set: function (suffix, value) { return set(make(suffix), value); },
            has: function (suffix) { return has(make(suffix)); },
            del: function (suffix) { return del(make(suffix)); },
            keys: function () { return keys(base + ":"); },
            // Expose the computed key builder for advanced cases
            makeKey: make
        };
    }

    // Self-switch helper: standardizes per-object keys like "self:<mapId>:<objId>:A"
    // Usage:
    //     const ff = Flags.self(mapId, objId);
    //     ff.set("A", true);     // turn on self-switch A
    //     ff.has("A");           // check if self-switch A is ON
    function self(mapId, objId) {
        var m = String(mapId || "");
        var o = String(objId || "");
        return ns("self:" + m + ":" + o);
    }

    // Initialize state on first load.
    load();

    // Public API
    var Flags = {
        // core
        get: get,
        set: set,
        has: has,
        del: del,
        keys: keys,
        all: all,
        clear: clear,

        // namespacing
        ns: ns,
        self: self,

        // persistence
        load: load,
        save: save
    };

    // Expose globally
    g.Flags = Flags;

})(window);
