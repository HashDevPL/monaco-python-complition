<template>
  <div id="app">
    <pre>req:{{ code }}</pre>
    <div id="monaco" ref="monacoEditor"></div>
  </div>
</template>

<script>
import * as monaco from "monaco-editor";
// eslint-disable-next-line
import skulpt from "skulpt/dist/skulpt.min";
// eslint-disable-next-line
import stdLib from "skulpt/dist/skulpt-stdlib";

export default {
  name: "App",
  data() {
    return {
      code: {
        aProperty: {
          aSetting1: 1,
          aSetting2: 2,
          aSetting3: 3,
          aSetting4: 4,
          aSetting5: 5,
        },
        bProperty: {
          bSetting1: {
            bPropertySubSetting: "true",
          },
          bSetting2: "bString",
        },
        cProperty: {
          cSetting: "cString",
        },
        dProperty: {
          dSetting1: "dString",
          dSetting2: ["a", "b"],
        },
        eProperty: {
          eSetting1: {
            eSubsetting1: 1,
            eSubsetting2: "eSubsetting2",
            eSubsetting3: [{ eArray1: { eArrProp1: 1, eArrProp2: 2 } }],
            eSubsetting4: {
              eSubsetting4Sub: { eSubsetting4Sub1: "1", eSubsetting4Sub2: 2 },
            },
          },
        },
      },
    };
  },
  methods: {
    eval() {
      // console.log(this.editor.getModel().getValue());
      const model = this.editor.getModel();
      const value = model.getValue();
      const base = `req=${JSON.stringify(this.code)} \n`;
      console.log(base);
      /*eslint-disable*/
      function builtinRead(x) {
        if (
          Sk.builtinFiles === undefined ||
          Sk.builtinFiles["files"][x] === undefined
        )
          throw "File not found: '" + x + "'";
        return Sk.builtinFiles["files"][x];
      }
      Sk.configure({
        output: (x) => console.log("a", x),
        read: (x) => builtinRead(x),
      });
      // console.log(Sk.builtinFiles);
      // Sk.importModule("skulpt/src/builtin/sys");
      // console.log("asd", Sk.importMainWithBody("<stdin>", false, value, true));
      Sk.misceval
        .asyncToPromise(function() {
          return Sk.importMainWithBody("<stdin>", false, base + value, true);
        })
        .then(
          function() {
            var markers = [];
            monaco.editor.setModelMarkers(model, "python", markers);
          },
          function(err) {
            console.log(err.toString(), err);
            // if (err.args.v[0].v != "No module named sys") {
            let markers = [];
            if (err.traceback[0].lineno && err.traceback[0].colno) {
              markers.push({
                severity: monaco.MarkerSeverity.Error,
                startLineNumber: err.traceback[0].lineno,
                startColumn: err.traceback[0].colno + 1,
                endLineNumber: err.traceback[0].lineno,
                endColumn: err.traceback[0].colno + 1,
                message: err.args.v[0].v,
              });
            } else {
              markers.push({
                severity: monaco.MarkerSeverity.Error,
                startLineNumber: err.traceback[0].lineno,
                startColumn: 0,
                endLineNumber: err.traceback[0].lineno,
                endColumn: 1000,
                message: err.args.v[0].v,
              });
            }
            monaco.editor.setModelMarkers(model, "python", markers);
            // }
          }
        );
    },
  },
  mounted() {
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
    /*eslint-disable*/
    function ShowAutocompletion(obj) {
      // Register object that will return autocomplete items
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
          const words = last_chars.replace("\t", "").split(" ");
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
    ShowAutocompletion({ req: this.code });

    this.editor = monaco.editor.create(this.$refs.monacoEditor, {
      value: "",
      language: "python",
      theme: "vs-dark",
      roundedSelection: false,
      scrollBeyondLastLine: false,
    });
    this.editor.onDidChangeCursorPosition((e) => {
      if (e.source == "snippet") {
        const value = this.editor.getModel().getValueInRange({
          startLineNumber: e.position.lineNumber,
          startColumn: 0,
          endLineNumber: e.position.lineNumber,
          endColumn: e.position.column + 1,
        });
        if (value.match(/"]$/)) {
          this.editor.setPosition({
            lineNumber: e.position.lineNumber,
            column: e.position.column + 1,
          });
        }
      }
    });
    let handle = null;
    this.editor.getModel().onDidChangeContent(() => {
      clearTimeout(handle);
      handle = setTimeout(() => this.eval(), 500);
      console.log("change");
    });
  },
};
</script>

<style lang="scss">
body {
  margin: 0;
  padding: 0;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  display: flex;
  height: 100vh;
  background: #1e1e1e;
}

pre {
  margin: 0;
  color: #fff;
}

#monaco {
  height: 100%;
  width: 100%;
  overflow: hidden;
}
</style>
