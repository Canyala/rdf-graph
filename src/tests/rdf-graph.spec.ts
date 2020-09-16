import { Turtles, Graph } from "../rdf-graph"

test('should have size after initialization with turtles', () => {
    let myTurtles: Turtles = [
        ['this', 'a', 'turtle'],
        ['statement'],
        ['word']
    ];
    const myGraphDB = new Graph(myTurtles); 
    expect(myGraphDB.size).toBeGreaterThan(0);
})