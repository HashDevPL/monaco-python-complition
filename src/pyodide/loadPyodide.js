import pyodide from "./pyodide";

export default function loadPyodide() {
  pyodide();
  return new Promise((resolve) => {
    const checkPyodide = setInterval(() => {
      if (window.pyodide) {
        clearInterval(checkPyodide);
        resolve();
      } else {
        console.log("not loaded");
      }
    }, 1000);
  });
}
