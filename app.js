const variables = [
  {
    key: "E",
    name: "情感强度",
    description: "亲近、信任、依恋、思念和情绪牵动的程度。",
    low: "疏离",
    high: "强烈",
    defaultValue: 6,
    weight: 0.22,
    rubric: [
      "0-3：很少被对方情绪牵动，也很少期待对方回应。",
      "4-6：有亲近或在意，但不稳定，更多取决于具体情境。",
      "7-8：明显信任、想念或依赖，对方的态度会影响你的心情。",
      "9-10：强烈牵动，对方几乎成为重要情绪来源。",
    ],
  },
  {
    key: "I",
    name: "互动持续性",
    description: "互动频率、关系时长和稳定出现于生活中的程度。",
    low: "偶尔",
    high: "稳定",
    defaultValue: 5,
    weight: 0.12,
    rubric: [
      "0-3：很少联系，可能数周或数月才互动一次。",
      "4-6：偶尔联系，关系存在但不持续，常由某一方主动维持。",
      "7-8：较稳定联系，常在一周内多次出现或保持固定节奏。",
      "9-10：高度稳定，几乎进入日常生活或长期计划。",
    ],
  },
  {
    key: "M",
    name: "共同记忆重要性",
    description: "是否共同经历了重要阶段、关键事件或高情绪强度时刻。",
    low: "普通",
    high: "关键",
    defaultValue: 6,
    weight: 0.2,
    rubric: [
      "0-3：主要是普通相处，缺少能被反复想起的共同片段。",
      "4-6：有一些值得记住的经历，但对人生阶段影响有限。",
      "7-8：共同经历过重要阶段、转折或高情绪强度事件。",
      "9-10：对方几乎绑定了某段人生记忆，想起那段时期很难绕开。",
    ],
  },
  {
    key: "R",
    name: "角色稀缺性",
    description: "你承担的理解、陪伴、支持或见证功能是否难以由他人替代。",
    low: "常见",
    high: "稀缺",
    defaultValue: 5,
    weight: 0.18,
    rubric: [
      "0-3：对方能从很多人那里获得类似陪伴、理解或支持。",
      "4-6：你有一定特殊功能，但仍有其他人可以部分替代。",
      "7-8：你承担的角色较少有人能同时做到，比如理解某个隐秘部分。",
      "9-10：你几乎是唯一能承担某种关系功能的人。",
    ],
  },
  {
    key: "S",
    name: "自我叙事参与度",
    description: "对方讲述自己是谁、如何变化、为何选择时，是否难以绕开你。",
    low: "边缘",
    high: "核心",
    defaultValue: 5,
    weight: 0.2,
    rubric: [
      "0-3：对方讲述自己的人生、变化和选择时，很少会提到你。",
      "4-6：你出现在某些故事里，但不是理解对方自我的关键人物。",
      "7-8：你参与了对方某些重要选择、成长或身份变化。",
      "9-10：如果没有你，对方很难完整讲述自己如何成为现在这样。",
    ],
  },
];

const relationProfiles = {
  general: {
    label: "一般关系",
    description: "适用于同学、同事、熟人或尚未明确归类的关系，更看重整体变量的均衡程度。",
    weights: { E: 0.22, I: 0.12, M: 0.2, R: 0.18, S: 0.2 },
    bias: 0.6,
  },
  friendship: {
    label: "长期友谊",
    description: "适用于共同走过一段时间的朋友，更看重共同记忆、稳定互动和长期信任的积累。",
    weights: { E: 0.2, I: 0.16, M: 0.24, R: 0.17, S: 0.17 },
    bias: 0.58,
  },
  romantic: {
    label: "亲密关系",
    description: "适用于暧昧、恋爱、伴侣或曾经亲密的关系，更看重情感强度和自我叙事中的位置。",
    weights: { E: 0.25, I: 0.13, M: 0.18, R: 0.16, S: 0.22 },
    bias: 0.62,
  },
  mentor: {
    label: "引导关系",
    description: "适用于师生、前辈、重要引导者或被你深刻影响过的人，更看重角色稀缺性和人生叙事参与度。",
    weights: { E: 0.15, I: 0.1, M: 0.2, R: 0.25, S: 0.24 },
    bias: 0.6,
  },
};

const interactionWeights = {
  EM: 0.1,
  RS: 0.1,
  MS: 0.08,
};

const sliders = document.querySelector("#sliders");
const probability = document.querySelector("#probability");
const meterFill = document.querySelector("#meter-fill");
const levelLabel = document.querySelector("#level-label");
const resultSummary = document.querySelector("#result-summary");
const contributions = document.querySelector("#contributions");
const resetButton = document.querySelector("#reset-button");
const relationType = document.querySelector("#relation-type");
const relationDescription = document.querySelector("#relation-description");
const advancedToggle = document.querySelector("#advanced-toggle");
const modelDetails = document.querySelector("#model-details");

function createSliders() {
  sliders.innerHTML = variables
    .map(
      (item) => `
        <section class="slider-item" data-variable="${item.key}">
          <div class="slider-head">
            <label for="score-${item.key}">${item.key} · ${item.name}</label>
            <output id="output-${item.key}" for="score-${item.key}">${item.defaultValue}</output>
          </div>
          <p>${item.description}</p>
          <input
            id="score-${item.key}"
            name="${item.key}"
            type="range"
            min="0"
            max="10"
            step="1"
            value="${item.defaultValue}"
            aria-describedby="hint-${item.key}"
          >
          <div class="scale-row" id="hint-${item.key}">
            <span>${item.low}</span>
            <span>${item.high}</span>
          </div>
          <details class="rubric">
            <summary>评分参考</summary>
            <ul>
              ${item.rubric.map((line) => `<li>${line}</li>`).join("")}
            </ul>
          </details>
        </section>
      `
    )
    .join("");
}

function getScores() {
  return Object.fromEntries(
    variables.map((item) => {
      const input = document.querySelector(`#score-${item.key}`);
      return [item.key, Number(input.value) / 10];
    })
  );
}

function sigmoid(value) {
  return 1 / (1 + Math.exp(-value));
}

function calculate(scores) {
  const profile = relationProfiles[relationType.value];
  const linear = variables.reduce((sum, item) => {
    return sum + profile.weights[item.key] * scores[item.key];
  }, 0);

  const interactions =
    interactionWeights.EM * scores.E * scores.M +
    interactionWeights.RS * scores.R * scores.S +
    interactionWeights.MS * scores.M * scores.S;

  const z = 4.2 * (linear + interactions - profile.bias);
  const rawProbability = sigmoid(z);
  const percent = Math.round(rawProbability * 100);

  const contributionsData = variables
    .map((item) => ({
      key: item.key,
      name: item.name,
      score: scores[item.key],
      contribution: profile.weights[item.key] * scores[item.key],
    }))
    .sort((a, b) => b.contribution - a.contribution);

  return {
    percent,
    z,
    profile,
    contributionsData,
    strongest: contributionsData[0],
    weakest: [...contributionsData].sort((a, b) => a.score - b.score)[0],
  };
}

function getLevel(percent) {
  if (percent < 40) return { label: "较低", tone: "这组变量暂时不太支持高度不可替代性的判断。" };
  if (percent < 65) return { label: "中等", tone: "这段关系呈现出一定特殊性，但仍存在明显可替代空间。" };
  if (percent < 85) return { label: "较高", tone: "这组变量显示出较强的心理独特性和关系绑定。" };
  return { label: "很高", tone: "这组变量高度接近心理不可替代性的模型条件。" };
}

function makeSummary(result) {
  const level = getLevel(result.percent);
  const strongName = result.strongest.name;
  const weakName = result.weakest.name;
  return `在“${result.profile.label}”情境下，模型给出的判断是：${level.tone} 当前主要推动因素是${strongName}，相对限制因素是${weakName}。请把这个数字理解为一种关系变量的反思工具，而不是对任何人的最终判决。`;
}

function renderContributions(items) {
  const max = Math.max(...items.map((item) => item.contribution), 0.01);
  contributions.innerHTML = items
    .map((item) => {
      const width = Math.round((item.contribution / max) * 100);
      return `
        <div class="contribution">
          <strong>${item.key} · ${item.name}</strong>
          <div class="bar-track" aria-hidden="true"><span style="width: ${width}%"></span></div>
          <span>${Math.round(item.score * 10)}/10</span>
        </div>
      `;
    })
    .join("");
}

function update() {
  const scores = getScores();
  relationDescription.textContent = relationProfiles[relationType.value].description;
  variables.forEach((item) => {
    const output = document.querySelector(`#output-${item.key}`);
    output.value = Math.round(scores[item.key] * 10);
    output.textContent = output.value;
  });

  const result = calculate(scores);
  const level = getLevel(result.percent);

  probability.textContent = `${result.percent}%`;
  meterFill.style.width = `${result.percent}%`;
  levelLabel.textContent = `等级：${level.label}`;
  resultSummary.textContent = makeSummary(result);
  renderContributions(result.contributionsData);
}

function resetValues() {
  variables.forEach((item) => {
    document.querySelector(`#score-${item.key}`).value = item.defaultValue;
  });
  relationType.value = "general";
  update();
}

createSliders();
sliders.addEventListener("input", update);
relationType.addEventListener("change", update);
resetButton.addEventListener("click", resetValues);
advancedToggle.addEventListener("change", () => {
  modelDetails.hidden = !advancedToggle.checked;
});
update();
