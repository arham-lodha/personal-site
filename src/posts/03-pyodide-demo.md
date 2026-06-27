---
layout: post.njk
title: "Python in the Browser: Symbolic Computation with Pyodide"
date: 2025-01-25
summary: "Run real Python (with SymPy) directly in a blog post using Pyodide. No server required."
tags: [posts, python, computation, sympy]
---

[Pyodide](https://pyodide.org/) is a WebAssembly port of CPython. It runs entirely in the browser — there is no server, no backend, no API call. This post shows how to embed a live Python computation environment in a blog post.

**Note:** Pyodide loads approximately 10 MB on first use. There will be a brief loading period. Subsequent visits use the browser cache.

## Live Symbolic Computation (SymPy)

Type a SymPy expression and click **Compute**. The result is rendered as LaTeX using KaTeX.

<div class="demo-container" id="pyodide-demo">
  <div id="pyodide-status" style="font-size:0.85rem; color:#6b7280; margin-bottom:0.75rem;">
    Python runs entirely in your browser via Pyodide (~10&nbsp;MB download). Click to begin.
  </div>
  <button class="btn" id="load-btn" onclick="loadPyodide_()" style="margin-bottom:0.75rem;">Load Python environment</button>
  <div style="display:flex; gap:0.5rem; flex-wrap:wrap; margin-bottom:0.75rem;">
    <input
      type="text"
      id="sympy-input"
      value="integrate(sin(x)**2, x)"
      placeholder="SymPy expression"
      style="flex:1; min-width:200px; padding:0.5rem 0.75rem; border:1px solid #e5e7eb; border-radius:5px; font-size:0.9rem; font-family:monospace;"
      disabled
    />
    <button class="btn" id="compute-btn" onclick="runSympy()" disabled>Compute</button>
  </div>
  <div id="sympy-output" style="font-size:1.1rem; min-height:2rem; padding:0.5rem 0;"></div>
  <details style="margin-top:0.75rem; font-size:0.85rem;">
    <summary style="cursor:pointer; color:#6b7280;">Example expressions to try</summary>
    <ul style="margin-top:0.5rem; color:#374151;">
      <li><code>diff(exp(x)*sin(x), x)</code></li>
      <li><code>limit(sin(x)/x, x, 0)</code></li>
      <li><code>factor(x**3 - x**2 - x + 1)</code></li>
      <li><code>series(cos(x), x, 0, 8)</code></li>
      <li><code>solve(x**2 - 2, x)</code></li>
      <li><code>Matrix([[1,2],[3,4]]).eigenvals()</code></li>
    </ul>
  </details>
</div>

<script>
let pyodide = null;
let pyodideLoading = false;

// Pyodide (~10 MB) is fetched only when the reader clicks "Load" — not on page load.
function injectPyodideScript() {
  return new Promise((resolve, reject) => {
    if (window.loadPyodide) return resolve();
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js";
    s.onload = resolve;
    s.onerror = () => reject(new Error("could not fetch Pyodide"));
    document.head.appendChild(s);
  });
}

async function loadPyodide_() {
  if (pyodideLoading) return;
  pyodideLoading = true;
  const status = document.getElementById("pyodide-status");
  const loadBtn = document.getElementById("load-btn");
  if (loadBtn) loadBtn.style.display = "none";
  try {
    status.textContent = "Loading Python environment… (this may take a moment)";
    await injectPyodideScript();
    pyodide = await loadPyodide();
    status.textContent = "Loading SymPy…";
    await pyodide.loadPackage("sympy");
    await pyodide.runPythonAsync("from sympy import *; x, y, z, n = symbols('x y z n')");
    status.textContent = "Python ready.";
    document.getElementById("sympy-input").disabled = false;
    document.getElementById("compute-btn").disabled = false;
    document.getElementById("compute-btn").textContent = "Compute";
  } catch (err) {
    status.textContent = "Failed to load Python: " + err.message;
    if (loadBtn) loadBtn.style.display = "";
    pyodideLoading = false;
  }
}

async function runSympy() {
  if (!pyodide) return;
  const expr = document.getElementById("sympy-input").value.trim();
  const output = document.getElementById("sympy-output");
  if (!expr) { output.textContent = ""; return; }
  try {
    const result = await pyodide.runPythonAsync(`
latex(${expr})
`);
    output.innerHTML = `\\[${result}\\]`;
    // Re-render KaTeX on the new content
    if (window.renderMathInElement) {
      renderMathInElement(output, {
        delimiters: [{ left: "\\[", right: "\\]", display: true }]
      });
    } else {
      output.innerHTML = `<code>${result}</code>`;
    }
  } catch (err) {
    output.innerHTML = `<span style="color:#dc2626; font-size:0.85rem;">Error: ${err.message}</span>`;
  }
}

document.getElementById("sympy-input").addEventListener("keydown", e => {
  if (e.key === "Enter") runSympy();
});
</script>

<!-- KaTeX auto-render for dynamically inserted math -->
<script defer
  src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js">
</script>
<script defer
  src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js"
  onload="renderMathInElement(document.body)">
</script>

## How It Works

Pyodide loads the full CPython 3.11 interpreter as a WebAssembly binary, then fetches SymPy's wheel file. All computation happens in the browser — the server only ever delivers static files.

The integration pattern for any post:

```html
<script src="https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js"></script>
<script>
async function main() {
  const pyodide = await loadPyodide();
  await pyodide.loadPackage(["numpy", "sympy"]); // add any pure-Python packages
  const result = await pyodide.runPythonAsync(`
    import numpy as np
    np.linalg.norm([3, 4])
  `);
  document.getElementById("output").textContent = result; // → 5.0
}
main();
</script>
```

Available packages include `numpy`, `scipy`, `sympy`, `matplotlib` (static output via `plt.savefig`), and most pure-Python packages via `pyodide.loadPackage("micropip")` → `micropip.install("packagename")`.
