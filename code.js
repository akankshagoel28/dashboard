const people = [
  { name: "Alice", age: 25, role: "dev" },
  { name: "Bob", age: 25, role: "designer" },
  { name: "Charlie", age: 30, role: "dev" },
];

const groupBy = (people, age) => {
  let s = {};
  for (let i = 0; i < people.length; i++) {
    if (!s.existsKey(people[i].age)) {
      s[age] = people;
    }
  }
};

// Write a function that flattens a nested array
const flatten = (arr) => {
  s = [];
  for (let i = 0; i < arr.length; i++) {
    if (typeof (arr[i] == "number")) s.push(arr[i]);
    else {
      returnflatten(arr[i]);
    }
  }
};

// Should work for:
flatten([1, [2, 3], [4, [5, 6]]]); // [1, 2, 3, 4, 5, 6]
