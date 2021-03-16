<template>
  <div id="app">
    <pre>reg:{{ code }}</pre>
    <div id="monaco" ref="monacoEditor"></div>
  </div>
</template>

<script>
import * as monaco from "monaco-editor";
import loadPyodide from "./pyodide/loadPyodide";
import monacoAutocompletion from "./monacoAutocompletion";
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
  mounted() {
    loadPyodide().then(() => alert("Python loaded"));

    this.editor = monaco.editor.create(this.$refs.monacoEditor, {
      value: "",
      language: "python",
      theme: "vs-dark",
      roundedSelection: false,
      scrollBeyondLastLine: false,
    });

    monacoAutocompletion(monaco, { reg: this.code });

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

    let debounce = null;
    this.editor.getModel().onDidChangeContent(() => {
      clearTimeout(debounce);
      debounce = setTimeout(() => this.evaluate(), 1000);
    });
  },
  methods: {
    evaluate() {
      const model = this.editor.getModel();
      const value = model.getValue();
      const base = `reg=${JSON.stringify(this.code)} \n`;
      const markers = [];
      try {
        window.pyodide.runPython(base + value);
      } catch (e) {
        const error = JSON.stringify(e.message).match(
          /(File \\"<\w*>\\".*)/
        )[0];
        const errorName = error
          .match(/(\\n\w*Error.*\\n)/)[0]
          .replaceAll("\\n", "");
        const errorLine =
          error
            .match(/(File \\"<.*>\\", line \d+)/)
            .join()
            .match(/\d+/)[0] - 1;
        let errorSyntax = null;
        if (errorName.includes("SyntaxError")) {
          errorSyntax = error.match(/(line \d*\\n)(.*\\n.*\^)/)[2].split("\\n");
        }

        if (errorSyntax) {
          markers.push({
            severity: monaco.MarkerSeverity.Error,
            startLineNumber: errorLine,
            startColumn: 0,
            endLineNumber: errorLine,
            endColumn: 1000,
            message: `${errorName}\n${errorSyntax[0]}\n${errorSyntax[1]}`,
          });
        } else {
          markers.push({
            severity: monaco.MarkerSeverity.Error,
            startLineNumber: errorLine,
            startColumn: 0,
            endLineNumber: errorLine,
            endColumn: 1000,
            message: `${errorName}`,
          });
        }
      }
      monaco.editor.setModelMarkers(model, "python", markers);
    },
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
