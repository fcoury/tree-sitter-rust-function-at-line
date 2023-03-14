const Parser = require("tree-sitter");
const Rust = require("tree-sitter-rust");
const { Query } = Parser;

const rustCode = `
  #[derive(Debug)]
  struct Point {
      x: i32,
      y: i32,
  }

  impl Point {
      fn new(x: i32, y: i32) -> Self {
          Self { x, y }
      }

      #[test]
      #[tokio::io]
      fn distance(&self, other: &Point) -> f64 {
          fn inner() -> () {
          }

          let dx = (self.x - other.x) as f64;
          let dy = (self.y - other.y) as f64;
          (dx * dx + dy * dy).sqrt()
      }
  }

  #[test]
  fn play() -> () {
      let p1 = Point::new(1, 2);
  }
`;

const line = 15;
const parser = new Parser();
parser.setLanguage(Rust);

const tree = parser.parse(rustCode);
const fn = tree.rootNode.descendantsOfType("function_item").find((node) => {
  console.log(node.previousSibling);
  return node.startPosition.row <= line && node.endPosition.row >= line;
});
console.log(fn.text);

// console.log(
//   tree.rootNode
//     .descendantsOfType("function_item")
//     // .filter(
//     //   (node) => node.startPosition.row <= line && node.endPosition.row >= line
//     // )
//     // .map((node) => node.previousSibling)
//     .map((node) => node.text)
// );
