"use strict";
/**
 * my-triples.ts
 * @description an in memory rdf graph database in the form of a triple store
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Graph = exports.TurtleIterator = exports.GraphIndex = void 0;
class GraphIndex extends Map {
}
exports.GraphIndex = GraphIndex;
/**
 * The TurtleIterator class
 */
class TurtleIterator {
    constructor(source) {
        this.source = source;
    }
    next() {
        let turtle;
        const nextTriple = this.source.next();
        if (this._lastTriple === undefined || this._lastTriple[0] !== nextTriple.value[0]) {
            turtle = [nextTriple.value[0], nextTriple.value[1], nextTriple.value[2]];
        }
        else if (this._lastTriple[1] !== nextTriple.value[1]) {
            turtle = [nextTriple.value[1], nextTriple.value[2]];
        }
        else {
            turtle = [nextTriple.value[2]];
        }
        this._lastTriple = nextTriple.value;
        return { done: nextTriple.done, value: turtle };
    }
    [Symbol.iterator]() {
        return this;
    }
    ToArray() {
        return Array.from(this);
    }
}
exports.TurtleIterator = TurtleIterator;
/**
 * The Graph class
 * @description provides a graph database in the form of a triple store.
 */
class Graph {
    /**
     * Creates a new Graph
     * @param turtles : an optional array of string tuples with length = 3|2|1 (turtles), entries[0] must have length = 3, a complete triple
     */
    constructor(turtles) {
        this._spo = new GraphIndex();
        this._pos = new GraphIndex();
        this._osp = new GraphIndex();
        if (turtles)
            this.assert(turtles); // initialize
    }
    /**
     * @returns the number of assertions
     */
    get size() {
        return Math.max(this._spo.size, this._pos.size, this._osp.size);
    }
    /**
     * Assert statements.
     * @param turtles : an array of string tuples with length = 3|2|1, turtles[0] must have length = 3
     */
    assert(turtles) {
        if (turtles.length < 1) {
            console.warn('Graph.assert(turtles) - turtles.length is 0, nothing is asserted.');
            return this;
        }
        if (turtles[0].length !== 3) {
            console.error('Graph.assert(turtles) - turtles[0].length is not 3, nothing is asserted.');
            return this;
        }
        let triple = ['', '', ''];
        for (let turtle of turtles) {
            triple.splice(triple.length - turtle.length, turtle.length, ...turtle);
            this._add(this._spo, triple[0], triple[1], triple[2]);
            this._add(this._pos, triple[1], triple[2], triple[0]);
            this._add(this._osp, triple[2], triple[0], triple[1]);
        }
        return this;
    }
    /**
     * Retract statements.
     * @param turtles : statements to retract, wildcards in the form of undefined are allowed
     */
    retract(turtles) {
        if (turtles.length < 1) {
            console.warn('Graph.retract(turtles) - turtles.length is 0, nothing retracted.');
            return this;
        }
        if (turtles[0].length !== 3) {
            console.error('Graph.retract(turtles) - turtles[0].length is not 3, nothing retracted');
            return this;
        }
        let triple = [undefined, undefined, undefined];
        for (let turtle of turtles) {
            triple.splice(triple.length - turtle.length, turtle.length, ...turtle);
            this._delete(this._spo, triple[0], triple[1], triple[2]);
            this._delete(this._pos, triple[1], triple[2], triple[0]);
            this._delete(this._osp, triple[2], triple[0], triple[1]);
        }
        return this;
    }
    /**
     * Tests a statement (or assertion).
     * @param s : subject
     * @param p : predicate
     * @param o : object
     */
    has(s, p, o) {
        if (!this._spo.has(s))
            return false;
        if (!this._pos.has(p))
            return false;
        if (!this._osp.has(o))
            return false;
        return true;
    }
    /**
     * Primitive query of the graph db
     * @param s : subject | undefined, undefined equals 'match all'
     * @param p : predicate | undefined, undefined equals 'match all'
     * @param o : object | undefined, undefined equals 'match all'
     */
    *query(s, p, o) {
        // Iterate all of ( s, p, o ) - ( 'nothing' ) is specific
        if (s === undefined && p === undefined && o === undefined) {
            for (let s of this._spo) {
                for (let p of s[1]) {
                    for (let o of p[1]) {
                        yield [s[0], p[0], o];
                    }
                }
            }
            return;
        }
        // Iterate all of ( s, p ) - ( o ) is specific
        if (s === undefined && p === undefined && o !== undefined) {
            const map = this._osp.get(o);
            if (map) {
                for (let s of map) {
                    for (let p of s[1]) {
                        yield [s[0], p, o];
                    }
                }
            }
            return;
        }
        // Iterate all of ( p, o ) - ( s ) is specific
        if (p === undefined && o === undefined && s !== undefined) {
            const map = this._spo.get(s);
            if (map) {
                for (let p of map) {
                    for (let o of p[1]) {
                        yield [s, p[0], o];
                    }
                }
            }
            return;
        }
        // Iterate all of ( s, o ) - ( p ) is specific
        if (s === undefined && o === undefined && p !== undefined) {
            const map = this._pos.get(p);
            if (map) {
                for (let o of map) {
                    for (let s of o[1]) {
                        yield [s, p, o[0]];
                    }
                }
            }
            return;
        }
        // Iterate all of ( s ) - ( p, o ) is specific        
        if (s === undefined && p !== undefined && o !== undefined) {
            const pMap = this._pos.get(p);
            if (pMap) {
                const oMap = pMap.get(o);
                if (oMap) {
                    for (let s of oMap) {
                        yield [s, p, o];
                    }
                }
            }
            return;
        }
        // Iterate all of ( p ) - ( s, o ) is specific                
        if (p === undefined && s !== undefined && o !== undefined) {
            const oMap = this._osp.get(o);
            if (oMap) {
                const sMap = oMap.get(s);
                if (sMap) {
                    for (let p of sMap) {
                        yield [s, p, o];
                    }
                }
            }
            return;
        }
        // Iterate all of ( o ) - ( s, p ) is specific                
        if (o === undefined && s !== undefined && p !== undefined) {
            const sMap = this._spo.get(s);
            if (sMap) {
                const pMap = sMap.get(p);
                if (pMap) {
                    for (let o of pMap) {
                        yield [s, p, o];
                    }
                }
            }
            return;
        }
    }
    /**
     * Primitive turtle  query of the graph db, redundant subjects and predicates are filtered out.
     * @param s : subject | undefined, undefined equals 'match all'
     * @param p : predicate | undefined, undefined equals 'match all'
     * @param o : object | undefined, undefined equals 'match all'
     */
    *turtle(s, p, o) {
        let last_s, last_p;
        for (let triple of this.query(s, p, o)) {
            if (last_s !== triple[0]) {
                last_s = triple[0];
                yield [last_s, triple[1], triple[0]];
            }
            if (last_p !== triple[1]) {
                last_p = triple[1];
                yield [last_p, triple[2]];
            }
            yield [triple[2]];
        }
    }
    // Add operation applied to a specific index
    _add(index, primary, secondary, ternary) {
        let pst_st = index.get(primary);
        if (pst_st === undefined) {
            pst_st = new Map();
            index.set(primary, pst_st);
        }
        let pst_st_t = pst_st.get(secondary);
        if (pst_st_t === undefined) {
            pst_st_t = new Set();
            pst_st.set(secondary, pst_st_t);
        }
        pst_st_t.add(ternary);
    }
    // Delete operation applied to a specific index
    _delete(index, primary, secondary, ternary) {
        const primaries = primary === undefined ? index.keys : [primary];
        for (const p in primaries) {
            let pst_st = index.get(p);
            if (pst_st === undefined) {
                pst_st = new Map();
                index.set(p, pst_st);
            }
            const secondaries = secondary === undefined ? pst_st.keys : [secondary];
            for (const s in secondaries) {
                let pst_st_t = pst_st.get(s);
                if (pst_st_t === undefined) {
                    pst_st_t = new Set();
                }
                const ternaries = ternary === undefined ? pst_st_t.values : [ternary];
                for (const t in ternaries) {
                    pst_st_t.delete(t);
                    if (pst_st_t.size < 1) {
                        pst_st.delete(s);
                        if (pst_st.size < 1) {
                            index.delete(p);
                        }
                    }
                }
            }
        }
    }
}
exports.Graph = Graph;
//# sourceMappingURL=my-triples.js.map