(function () {
  const dataNode = document.getElementById("demo-data");
  if (!dataNode) return;

  const demo = JSON.parse(dataNode.textContent);
  const scenarioSelect = document.getElementById("scenario-select");
  const runButton = document.getElementById("run-demo");
  const nextButton = document.getElementById("next-step");
  const resetButton = document.getElementById("reset-demo");
  const stepsNode = document.getElementById("interactive-steps");
  const stateNode = document.getElementById("state-view");
  const logNode = document.getElementById("terminal-log");
  const outputNode = document.getElementById("output-view");

  let scenarioIndex = 0;
  let stepIndex = -1;
  let timer = null;

  function scenario() { return demo.scenarios[scenarioIndex]; }
  function scenarioLabel(item) { return item.label || item.name || "Scenario"; }
  function scenarioSummary(item) { return item.summary || item.headline || demo.subtitle || demo.title; }
  function scenarioSteps() { return scenario().steps || demo.steps || []; }
  function normalizeStep(step) {
    if (Array.isArray(step)) {
      return { name: step[0], pattern: step[1], output: step[2], log: step[2], state: { detail: step[2] } };
    }
    return step;
  }
  function finalOutput() {
    const item = scenario();
    if (item.final) return item.final;
    return {
      verdict: item.verdict || "DONE",
      headline: item.headline || scenarioSummary(item),
      cards: Object.entries(item.cards || {})
    };
  }
  function currentStep() {
    const steps = scenarioSteps();
    return normalizeStep(steps[Math.max(0, stepIndex)] || steps[0] || {});
  }
  function stopTimer() {
    if (timer) window.clearInterval(timer);
    timer = null;
  }
  function setStep(nextIndex) {
    stopTimer();
    const max = scenarioSteps().length - 1;
    stepIndex = Math.max(-1, Math.min(nextIndex, max));
    render();
  }
  function renderScenarioOptions() {
    scenarioSelect.innerHTML = demo.scenarios.map((item, idx) => {
      return `<option value="${idx}">${scenarioLabel(item)}</option>`;
    }).join("");
  }
  function renderSteps() {
    stepsNode.innerHTML = scenarioSteps().map((rawStep, idx) => {
      const step = normalizeStep(rawStep);
      const classes = ["interactive-step"];
      if (idx < stepIndex) classes.push("done");
      if (idx === stepIndex) classes.push("active");
      return `<button class="${classes.join(" ")}" type="button" data-step="${idx}">
        <span class="idx">${String(idx + 1).padStart(2, "0")}</span>
        <span class="name">${step.name || ""}</span>
        <span class="pattern">${step.pattern || ""}</span>
        <span class="mini">${step.output || ""}</span>
      </button>`;
    }).join("");
    stepsNode.querySelectorAll("[data-step]").forEach((node) => {
      node.addEventListener("click", () => setStep(Number(node.dataset.step)));
    });
  }
  function renderState() {
    if (stepIndex < 0) {
      stateNode.textContent = JSON.stringify({
        scenario: scenarioLabel(scenario()),
        status: "ready",
        instruction: "Click Run Demo or Next Step."
      }, null, 2);
      return;
    }
    const step = currentStep();
    stateNode.textContent = JSON.stringify({
      scenario: scenarioLabel(scenario()),
      step: step.name,
      pattern: step.pattern,
      state: step.state || { detail: step.output },
      verdict: scenario().verdict || finalOutput().verdict
    }, null, 2);
  }
  function renderLog() {
    if (stepIndex < 0) {
      logNode.innerHTML = `<div class="active-line">$ ${demo.title}</div><div>${scenarioSummary(scenario())}</div>`;
      return;
    }
    if (scenario().log && !scenario().steps) {
      const rows = scenario().log.slice(0, stepIndex + 1).map((line, idx) => {
        const cls = idx === stepIndex ? "active-line" : "";
        return `<div class="${cls}">$ ${line}</div>`;
      });
      logNode.innerHTML = rows.join("");
      return;
    }
    const rows = scenarioSteps().slice(0, stepIndex + 1).map((rawStep, idx) => {
      const step = normalizeStep(rawStep);
      const cls = idx === stepIndex ? "active-line" : "";
      return `<div class="${cls}">[${String(idx + 1).padStart(2, "0")}] ${step.log || step.output || step.name}</div>`;
    });
    logNode.innerHTML = rows.join("");
    logNode.scrollTop = logNode.scrollHeight;
  }
  function renderOutput() {
    const steps = scenarioSteps();
    const finalReached = stepIndex === steps.length - 1;
    if (stepIndex < 0) {
      outputNode.innerHTML = `<div class="output-headline">Ready to run</div><p>${scenarioSummary(scenario())}</p>`;
      return;
    }
    const step = currentStep();
    const final = finalOutput();
    const verdict = finalReached ? final.verdict : "RUNNING";
    const warn = /REVIEW|WARN|RUNNING|ESCALATE|PARTIAL|CONDITIONAL/.test(verdict) ? " warn" : "";
    const cardData = finalReached ? final.cards : [
      ["Active step", step.name],
      ["Pattern", step.pattern],
      ["Output", step.output],
      ["Next", stepIndex + 1 < steps.length ? normalizeStep(steps[stepIndex + 1]).name : "final"]
    ];
    const cards = cardData.map(([key, value]) => {
      return `<div class="output-card"><strong>${key}</strong><span>${value}</span></div>`;
    }).join("");
    outputNode.innerHTML = `
      <span class="verdict${warn}">${verdict}</span>
      <div class="output-headline">${finalReached ? final.headline : step.output}</div>
      <div class="output-cards">${cards}</div>
    `;
  }
  function render() {
    renderSteps();
    renderState();
    renderLog();
    renderOutput();
    nextButton.disabled = stepIndex >= scenarioSteps().length - 1;
  }
  function runDemo() {
    stopTimer();
    stepIndex = -1;
    render();
    timer = window.setInterval(() => {
      if (stepIndex >= scenarioSteps().length - 1) {
        stopTimer();
        return;
      }
      stepIndex += 1;
      render();
    }, 850);
  }
  scenarioSelect.addEventListener("change", () => {
    scenarioIndex = Number(scenarioSelect.value);
    stepIndex = -1;
    stopTimer();
    render();
  });
  runButton.addEventListener("click", runDemo);
  nextButton.addEventListener("click", () => setStep(stepIndex + 1));
  resetButton.addEventListener("click", () => setStep(-1));

  renderScenarioOptions();
  render();
})();