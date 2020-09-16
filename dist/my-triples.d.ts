/**
 * my-triples.ts
 * @description an in memory rdf graph database in the form of a triple store
 */
export declare type Turtles = readonly (readonly [string, string, string] | readonly [string, string] | readonly [string])[];
export declare type TurtlePatterns = readonly (readonly [string?, string?, string?] | readonly [string?, string?] | readonly [string?])[];
export declare class GraphIndex extends Map<string, Map<string, Set<string>>> {
}
/**
 * The TurtleIterator class
 */
export declare class TurtleIterator implements IterableIterator<readonly [string, string, string] | readonly [string, string] | readonly [string]> {
    protected source: IterableIterator<readonly [string, string, string]>;
    private _lastTriple;
    constructor(source: IterableIterator<readonly [string, string, string]>);
    next(): IteratorResult<readonly [string, string, string] | readonly [string, string] | readonly [string]>;
    [Symbol.iterator](): TurtleIterator;
    ToArray(): Array<readonly [string, string, string] | readonly [string, string] | readonly [string]>;
}
/**
 * The Graph class
 * @description provides a graph database in the form of a triple store.
 */
export declare class Graph {
    private _spo;
    private _pos;
    private _osp;
    /**
     * Creates a new Graph
     * @param turtles : an optional array of string tuples with length = 3|2|1 (turtles), entries[0] must have length = 3, a complete triple
     */
    constructor(turtles?: Turtles);
    /**
     * @returns the number of assertions
     */
    readonly size: number;
    /**
     * Assert statements.
     * @param turtles : an array of string tuples with length = 3|2|1, turtles[0] must have length = 3
     */
    assert(turtles: Turtles): Graph;
    /**
     * Retract statements.
     * @param turtles : statements to retract, wildcards in the form of undefined are allowed
     */
    retract(turtles: TurtlePatterns): Graph;
    /**
     * Tests a statement (or assertion).
     * @param s : subject
     * @param p : predicate
     * @param o : object
     */
    has(s: string, p: string, o: string): boolean;
    /**
     * Primitive query of the graph db
     * @param s : subject | undefined, undefined equals 'match all'
     * @param p : predicate | undefined, undefined equals 'match all'
     * @param o : object | undefined, undefined equals 'match all'
     */
    query(s: string | undefined, p: string | undefined, o: string | undefined): Generator<[string, string, string]>;
    /**
     * Primitive turtle  query of the graph db, redundant subjects and predicates are filtered out.
     * @param s : subject | undefined, undefined equals 'match all'
     * @param p : predicate | undefined, undefined equals 'match all'
     * @param o : object | undefined, undefined equals 'match all'
     */
    turtle(s: string | undefined, p: string | undefined, o: string | undefined): Generator<[string, string, string] | [string, string] | [string]>;
    private _add;
    private _delete;
}
