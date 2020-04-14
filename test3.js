const items = ["horse", 1, 2, 1, 4, 3, "horse", "goat", "swone", 5, 9, 222, 222, 223];
console.log(items);

const unique = [...new Set(items)];

console.log(unique);