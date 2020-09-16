import { Turtles, Graph } from "../my-triples"

test('should have size after initialization with turtles', () => {
    let myTurtles: Turtles = [
        ['this', 'a', 'turtle'],
        ['statement']
    ];
    const myGraphDB = new Graph(myTurtles); 
    expect(myGraphDB.size).toBeGreaterThan(0);
})