const Parser = require("tree-sitter");
const Rust = require("tree-sitter-rust");

async function findFunctionAtLine(rustSourceCode, lineNumber) {
  const parser = new Parser();
  await parser.setLanguage(Rust);

  const rootNode = parser.parse(rustSourceCode);

  for (const node of rootNode.descendants()) {
    if (
      node.type === "function_item" &&
      node.startPosition.row <= lineNumber &&
      node.endPosition.row >= lineNumber
    ) {
      // Found the function that includes the specified line number
      let functionName = node.firstChild.text;

      // Traverse up the syntax tree to find the parent module or element
      let parent = node.parent;
      while (
        parent &&
        parent.type !== "module_item" &&
        parent.type !== "source_file"
      ) {
        parent = parent.parent;
      }
      if (parent && parent.type === "module_item") {
        let moduleName = parent.firstChild.text;
        return `${moduleName}::${functionName}`;
      } else {
        return functionName;
      }
    }
  }

  // No function found at the specified line number
  return null;
}

const rustSourceCode = `
  #[derive(Debug)]
  struct Point {
    x: i32,
    y: i32,
  }

  impl Point {
    fn new(x: i32, y: i32) -> Point {
      Point { x, y }
    }

    fn distance_from_origin(&self) -> f64 {
      ((self.x * self.x + self.y * self.y) as f64).sqrt()
    }
  }
`;

const functionName = await findFunctionAtLine(rustSourceCode, 8);
console.log(functionName); // Output: Point::new
