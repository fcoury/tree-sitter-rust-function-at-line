const fs = require('fs');
const Parser = require('tree-sitter');
const Rust = require('tree-sitter-rust');

function findFunctionInRustCode(rustCode, lineNumber) {
  const parser = new Parser();
  parser.setLanguage(Rust);
  const tree = parser.parse(rustCode);
  const rootNode = tree.rootNode;

  function walk(node, line) {
    if (node.type === 'function_item') {
      const startLine = node.startPosition.row;
      const endLine = node.endPosition.row;
      if (line >= startLine && line <= endLine) {
        return node;
      }
    }

    for (const child of node.children) {
      const result = walk(child, line);
      if (result) {
        return result;
      }
    }

    return null;
  }

  const targetNode = walk(rootNode, lineNumber - 1);
  if (!targetNode) {
    return null;
  }

  let functionName = '';
  let qualifiers = [];

  for (const child of targetNode.children) {
    if (child.type === 'identifier') {
      functionName = child.text;
    } else if (child.type === 'proc_macro_invocation') {
      qualifiers.push(child.text);
    }
  }

  let currentNode = targetNode.parent;
  let attributeNodes = [];
  let moduleNode = undefined;

  let attributeNode = targetNode.previousSibling;
  while (attributeNode && attributeNode.type === 'attribute_item') {
    attributeNodes.push(attributeNode);
    attributeNode = attributeNode.previousSibling;
  }

  while (currentNode) {
    if (currentNode.type === 'mod_item') {
      moduleNode = currentNode;
      for (const child of currentNode.children) {
        if (child.type === 'identifier') {
          parentElement = child.text;
          break;
        }
      }
      break;
    }
    currentNode = currentNode.parent;
  }

  const moduleIdentifier = moduleNode?.children?.find(c => c.type === 'identifier');
  const moduleName = moduleIdentifier?.text;

  const attrNames = attributeNodes.map(a => a.children.find(c => c.type === 'meta_item')?.text);

  return {
    moduleName,
    functionName,
    attrNames,
  };
}

// Example usage:
const fileName = process.argv[2];
const rustCode = fs.readFileSync(fileName, 'utf8');
const lineNumber = parseInt(process.argv[3], 10);

console.log(`Code: ${fileName}:${lineNumber}`);

const res = findFunctionInRustCode(rustCode, lineNumber);
console.log('res', res);

