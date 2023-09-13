# Cassouscript (csc)

## Basic operations

#### Make operations

> This example shows the way to make operations in cassouscript.

```
Addition: 1 + 1 >> 2
Subtraction: 2 - 1 >> 1
Multiplication: 2 * 3 >> 6
Divisions: 3 / 2 >> 1.5
Power: 6 ^ 5 >> 7776
```

## List

#### Create a List

> This example shows the way to create a list using _list literal notation_.

```
>> 'fruits' list created using list literal notation.
set fruits = ["banana", "pineapple"];
log(fruits);
>> [ 'banana', 'pineapple' ]
```

#### Create a String from a List

> This exemple shows the way to create a string from a list using the _'join' built-in function_.

```
set fruits = ["banana", "pineapple"];
set fruitString = join(", ", fruits);
log(fruitString);
>> "banana, pineapple"
```

#### Access a List item by its index

> This exemple shows the way to access an item in a list with its index.

```
set fruits = ["banana", "pineapple"];

>> The index of a list's first element is always 0.
log(fruits / 0); >> banana

>> The index of a list's second element is always 1.
log(fruits / 1); >> pineapple

>> The index of a list's last element is always one
>> less than the length of the list.
log(fruits / (size(fruits) - 1)); >> pineapple
```

#### Check if a List contains a certain item

> This exemple shows the way to check if an item is in the list using the _keyword 'in'_.

```
set fruits = ["banana", "pineapple"];

log("banana" in fruits) >> true
log("apple" in fruits) >> false
```

#### Add an item to a List

> This exemple shows the way to add an item to a list using the _'+' operator_.

```
set fruits = ["banana", "pineapple"];

>> To add an item to a list for this statement.
log(fruits + "apple"); >> [ 'banana', 'pineapple', 'apple' ]
log(fruits); >> [ 'banana', 'pineapple' ]

>> To add an item to a list forever.
fruits += "apple";
log(fruits); >> [ 'banana', 'pineapple', 'apple' ]
```

#### Remove an item to from a List

> This exemple shows the way to remove an item from a list using the _'-' operator_.

```
set fruits = ["banana", "pineapple", "apple"];

>> To remove an item to from list for this statement.
log(fruits - 1); >> [ 'banana', 'apple' ]
log(fruits); >> [ 'banana', 'pineapple', 'apple' ]

>> To remove an item from a list forever.
fruits -= 0;
log(fruits); >> [ 'pineapple', 'apple' ]
```

## Object

#### Create an object

> This example shows the way to create an object using _object literal notation_.

```
>> 'car' object created using object literal notation.
set car = {
    "color": "red",
    "pri" + "ce": 25000
}
log(car);
>> { color: 'red', price: 25000 }

log(car."color");
>> 'red'
```

#### Add an entry

> This example shows the way to add an entry to an object using _object literal notation_.

```
>> 'car' object created using object literal notation.
set car = {
    "color": "red",
    "pri" + "ce": 25000
}
log(car);
>> { color: 'red', price: 25000 }

car."doors" = 5;
>> { color: 'red', price: 25000, doors: 5 }
```

## Functions

#### Make a function

> This example shows the different ways to create basic functions.

```
func add(a, b) {
    return a + b;
}

set sub = func(a, b) {
    return a - b;
}

func mul(a, b) -> a * b;

log(add(1, 2)) >> 3
log(sub(1, 2)) >> -1
log(mul(1, 2)) >> 2
```

#### Make a type function

> This example shows the different ways to create a type functions.

```
func prefix<String>(this, prefix) {
    return prefix + "-" + this;
}

log("World"@prefix("Hello")) >> "Hello-World"
```

## Statements

#### If statement

> Basic 'if' syntax.

```
set var = 5;

if var < 1 {
    log("Less than 1");
} elif var < 2 {
    log("Less than 2 but more than 1");
} else {
    log("More than 2");
}

>> More than 2
```

#### For loop

> Basic 'for loop' syntax.

```
for i = 0 to 10 inc 2 {
    log(i);
}
>> 0
>> 2
>> 4
>> 6
>> 8

for i = each [5, 1, 2] {
    log(i);
}
>> 5
>> 1
>> 2
```

#### While loop

> Basic 'while loop' syntax.

```
set acc = 0;

while e < 5 {
    acc += 1;
    log("Loop");
}

>> Loop
>> Loop
>> Loop
>> Loop
>> Loop
```

#### Switch

> Basic 'switch' syntax.

```
set var = 3;

switch var {
    case 1 {
        log("ONE");
    }

    default {
        log("OTHER THAN ONE")
    }
}

>> OTHER THAN ONE
```
