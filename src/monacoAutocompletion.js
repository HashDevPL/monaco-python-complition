/*eslint-disable */
export default function monacoAutocompletion(monaco, obj) {
  const keywords = [
    "and",
    "as",
    "assert",
    "break",
    "class",
    "continue",
    "def",
    "del",
    "elif",
    "else",
    "except",
    "exec",
    "finally",
    "for",
    "from",
    "global",
    "if",
    "import",
    "in",
    "is",
    "lambda",
    "None",
    "not",
    "or",
    "pass",
    "print",
    "raise",
    "return",
    "self",
    "try",
    "while",
    "with",
    "yield",
    "int",
    "float",
    "long",
    "complex",
    "hex",
    "abs",
    "all",
    "any",
    "apply",
    "basestring",
    "bin",
    "bool",
    "buffer",
    "bytearray",
    "callable",
    "chr",
    "classmethod",
    "cmp",
    "coerce",
    "compile",
    "complex",
    "delattr",
    "dict",
    "dir",
    "divmod",
    "enumerate",
    "eval",
    "execfile",
    "file",
    "filter",
    "format",
    "frozenset",
    "getattr",
    "globals",
    "hasattr",
    "hash",
    "help",
    "id",
    "input",
    "intern",
    "isinstance",
    "issubclass",
    "iter",
    "len",
    "locals",
    "list",
    "map",
    "max",
    "memoryview",
    "min",
    "next",
    "object",
    "oct",
    "open",
    "ord",
    "pow",
    "print",
    "property",
    "reversed",
    "range",
    "raw_input",
    "reduce",
    "reload",
    "repr",
    "reversed",
    "round",
    "set",
    "setattr",
    "slice",
    "sorted",
    "staticmethod",
    "str",
    "sum",
    "super",
    "tuple",
    "type",
    "unichr",
    "unicode",
    "vars",
    "xrange",
    "zip",
    "True",
    "False",
    "__dict__",
    "__methods__",
    "__members__",
    "__class__",
    "__bases__",
    "__name__",
    "__mro__",
    "__subclasses__",
    "__init__",
    "__import__",
  ];
  monaco.languages.registerCompletionItemProvider("python", {
    provideCompletionItems: function() {
      return {
        suggestions: keywords.map((val) => {
          return { label: val, insertText: val };
        }),
      };
    },
  });
  monaco.languages.registerCompletionItemProvider("python", {
    // Run this function when the period or open parenthesis is typed (and anything after a space)
    triggerCharacters: [".", "["],

    // Function to generate autocompletion results
    provideCompletionItems: function(model, position) {
      // Split everything the user has typed on the current line up at each space, and only look at the last word
      const last_chars = model.getValueInRange({
        startLineNumber: position.lineNumber,
        startColumn: 0,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      });

      const words = last_chars.replace("\t", "").split(/\s|\(|:/);
      let active_typing = words[words.length - 1]; // What the user is currently typing (everything after the last space)

      // If the last character typed is a period then we need to look at member objects of the obj object
      const is_member = active_typing
        .charAt(active_typing.length - 1)
        .match(/\.|\[/);

      // Array of autocompletion results
      const result = [];

      // Used for generic handling between member and non-member objects
      let last_token = obj;
      let prefix = "";

      if (is_member) {
        const anotation = active_typing.substr(-1) == "[" ? "[" : ".";
        active_typing = active_typing
          .replaceAll('"', "")
          .replaceAll("[", ".")
          .replaceAll("]", "");
        // Is a member, get a list of all members, and the prefix
        const parents = active_typing
          .substring(0, active_typing.length - 1)
          .split(/\.|\[/);
        last_token = obj[parents[0]];
        prefix = parents[0];

        parents.map((item) => {
          if (last_token.hasOwnProperty(item)) {
            prefix += anotation + item;
            last_token = last_token[item];
          } else {
            // Not valid
            return result;
          }
        });

        prefix += anotation;
      }

      // Get all the child properties of the last token
      for (const prop in last_token) {
        // Do not show properites that begin with "__"
        if (
          last_token.hasOwnProperty(prop) &&
          !prop.startsWith("__") &&
          last_token.constructor != String &&
          last_token.constructor != Array
        ) {
          result.push({
            label: prefix + prop,
            kind: monaco.languages.CompletionItemKind.Text,
            insertText: prefix.includes("[") ? `"${prop}"` : prop,
          });
        }
      }

      return {
        suggestions: result,
      };
    },
  });
}
/*eslint-enable */
