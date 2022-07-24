/*****
  Helper functions
*****/

const cond = (arr) => (data) => arr.find( ([fn, _]) => fn(data))[1](data);
const pipe = (...fns) => (...init) => fns.slice(1).reduce( (val, fn) => fn(val), fns[0](...init));
const arrayFrom = (val) => Array.from(val);
const toObject = (val) => Object.fromEntries(val);
const when = (test, fn) => (val) =>  test(val) ? fn(val) : () => {};

const $ = (el) => document.querySelector(el);
const $$ = (el) => document.querySelectorAll(el);
const $on = (ev, fn, el) => document.querySelector(el).addEventListener(ev, fn);
const $onClick = (fn, el) => document.querySelector(el).addEventListener('click', fn);

const formatNumber = (num, el) => Number(num).toLocaleString(undefined,{signDisplay: el === "vitals" ? "never" : "always"});

const setImageHeight = (parent, img) => {
  const height = $(parent).clientHeight;
  $(img).style.maxHeight = `${height}px`;
}

const createElement = (el, attributes = {}, str ="") => {
  const retEl = document.createElement(el);
    Object.entries(attributes).forEach( ([key, val]) => {
      retEl.setAttribute(key,val);
    });
  retEl.textContent = str;
  return retEl;
}

/*****
  State
*****/

const adjectiveLadder = ["Mediocre", "Average", "Fair", "Good", "Great"];
const skillsList = ["Academics", "Athletics", "Burglary", "Contacts", "Crafts", "Deceive", "Drive", "Empathy", "Fight", "Investigate", "Lore", "Notice", "Physique", "Provoke", "Rapport", "Resources", "Shoot", "Stealth", "Will"];
const approachesList = ["Careful", "Clever", "Flashy", "Forceful", "Quick", "Sneaky"];

const state = {
  desc: {},
  aspects: {},
  skills: [],
  stunts: {},
  consequenes: {},
  image: "url goes here"
}


/*****
 Primary Functions
*****/

const toggleDialog = (ev) => {
  if (ev.target.dataset.edit) {
    $(`[data-popup=${ev.target.dataset.edit}]`).showModal();
  }
};

const getClosestForm = (ev) => ev.target.closest('form');
const convertToFormData = (form) => new FormData(form);
const removeSelect = (fd) => (fd.delete("skillSelect"), fd);
const formatSkills = (arr) => arr.map( ([key, val]) => [key.slice(3), val]);
const closeDialog = (el) => $(`[data-popup="${el}"]`).close();
const outputSkillsToDOM = (arr) => {
  $('.skills ul').textContent = '';
  arr.forEach( ([skill, bonus])=> {
    const el = createElement('li', [], `${skill} (${formatNumber(bonus)})`);
    $('.skills ul').append(el);
  });
  return "skills";
};

const saveCharList = pipe(
  getClosestForm,
  convertToFormData,
  removeSelect,
  arrayFrom,
  formatSkills,
  outputSkillsToDOM,
  closeDialog
);

const populateSkills = (ev) => {
  const parentEl = $('[data-list="skills"]');
  parentEl.textContent = "";
  const listToUse = ev.target.value === "skills" ? skillsList : approachesList;
  listToUse.forEach( (skill)=> {
    const wrapper = createElement("span");
    const el = createElement("label", {for: `set${skill}`}, `${skill} `);
    const outputEl = createElement("output", {for:`set${skill}`}, "(+0):")
    const inputEl = createElement('input', {
      type: "range",
      id:`set${skill}`,
      min: "0",
      max: "8",
      name: `set${skill}`,
      step: "1",
      value: "0"
    });
    wrapper.append(el,outputEl)
    parentEl.append(wrapper, inputEl);
  });
};

const isRangeSlider = (ev) => ev.target.type === "range";
const updateSkillNumber = (ev) => {
  const el = ev.target.closest('form').querySelector('[name="element"]').value;
  $(`output[for=${ev.target.id}]`).textContent = `(${formatNumber(ev.target.value, el)})`;
};
const updateSkill = when(isRangeSlider, updateSkillNumber)

const objectFrom = (val) => Object.fromEntries(val);
const outputObjToDOM = (obj) => {
  Object.entries(obj).filter(([key,_]) => key !== "element").forEach( ([key,val])=> {
    $(`[data-char="${key}"] > dd`).textContent = val;
  });
  return obj.element;
}

const saveCharObject = pipe(
  getClosestForm,
  convertToFormData,
  toObject,
  outputObjToDOM,
  closeDialog
);


/*****
  Stunts
*****/

const removeStunt = (ev) => ev.target.closest('fieldset').remove();
const addStunt = (ev) => {
  const rand = Date.now().toString(16);
  const fset = createElement('fieldset', {class: "flex-col"},'');
  const leg = createElement('legend', {}, "Stunt Info");
  const nameLabel = createElement('label', {for: `name${rand}`},'Stunt Name');
  const nameText = createElement('input', {type: 'text', name: `name${rand}`, id: `name${rand}`})
  const descLabel = createElement('label', {for: `desc${rand}`},'Stunt Description');
  const descText = createElement('textarea', {rows: '8', name: `desc${rand}`, id: `desc${rand}`})
  descText.value = 'Because I [describe how you are amazing or have a cool bit of gear], I get a +2 when I use [pick a skill] to [pick one: overcome, create an advantage, attack, defend] when [describe a circumstance].\n\nBecause I [describe how you are amazing or have a cool bit of gear], I can [describe your amazing feat], but only [describe a circumstance or limitation].'
  const delButton = createElement('button', {type: 'button', 'data-remove': 'stunt'}, 'Remove Stunt')
  fset.append(leg, nameLabel, nameText, descLabel, descText, delButton);
  ev.target.parentElement.before(fset);
}

const collateStunts = (obj) => {
  const newObj = {};
  Object.keys(obj).forEach( (key) => {
    if (key.startsWith("name")) {
      const num = key.slice(4);
      newObj[obj[key]] = obj[`desc${num}`];
    }
  });
  newObj.element = obj.element;
  return newObj;
}

const outputStuntsToDOM = (obj) => {
  $('.stunts > div').textContent = '';
  Object.keys(obj).forEach( (key) => {
    if (key !== "element") {
      const dl = createElement('dl');
      const dt = createElement('dt', {}, key);
      const dd = createElement('dd', {}, obj[key]);  
      dl.append(dt,dd);
      $('.stunts > div').append(dl);
    }
  });
  return obj.element;
};

const saveStuntObject = pipe(
  getClosestForm,
  convertToFormData,
  toObject,
  collateStunts,
  outputStuntsToDOM,
  closeDialog
);


/*****
  Vitals
*****/

const stressToggle = (ev) => {
  if (ev.target.type === "button") {
    ev.target.textContent = ev.target.textContent === "X" ? "1" : "X";
  }
};

const populateStressBoxes = (obj) => {
  const container = $('[data-mod="stress"]');
  container.textContent = '';
  Object.keys(obj).forEach( (key)=> {
    if (key.includes('Stress')) {
      const el = createElement('div');
      const titleText = key.replace('Stress','');
      const title = createElement('strong',{}, titleText);
      const span = createElement('span');
      span.innerHTML = '<button type="button">1</button>'.repeat(parseInt(obj[key]));
      el.append(title, span);
      container.append(el);
    }
  });
  return obj;
};

const fillConsequences = (obj) => {
  const container = $('[data-mod="consequences"]');
  container.textContent = '';
  Object.keys(obj).forEach( (key) => {
    if (key.includes("Consequence")) {
      const dl = createElement('dl');
      const title = key.replace("Consequence", key.startsWith("Mild") ? " (-2)" : key.startsWith("Moderate") ? " (-4)" : " (-6)");
      const dt = createElement('dt', {}, title);
      const dd = createElement('dd', {}, obj[key]);  
      dl.append(dt,dd);
      container.append(dl);
    }
  });
  return obj.element;
};

const saveVitalsObject = pipe(
  getClosestForm,
  convertToFormData,
  toObject,
  populateStressBoxes,
  fillConsequences,
  closeDialog
);


/*****
  Init
*****/

(() => {
  const divHeight = $('.desc > div').offsetHeight;
  console.log(divHeight);
  $('#charImg').style.maxHeight = `${divHeight}px`;
  $('#charImg').src = './img/ichigoKurosaki.jpg';
})();

/*****
  Event Listeners & Handler
*****/

const dialogHandler = cond([
  [(ev) => ev.target.dataset.save === "desc", (ev) => saveCharObject(ev)],
  [(ev) => ev.target.dataset.save === "aspects", (ev) => saveCharObject(ev)],
  [(ev) => ev.target.dataset.save === "skills", (ev) => saveCharList(ev)],
  [(ev) => ev.target.dataset.remove === "stunt", (ev) => removeStunt(ev)],
  [(ev) => ev.target.dataset.add === "stunt", (ev) => addStunt(ev)],
  [(ev) => ev.target.dataset.save === "stunts", (ev) => saveStuntObject(ev)],
  [(ev) => ev.target.dataset.save === "vitals", (ev) => saveVitalsObject(ev)],
  [(ev) => ev.target.dataset.cancel, (ev) => ev.target.closest('dialog').close()],
  [() => true, () => {}]
 ]);

$onClick(stressToggle, '.stress');
$onClick(toggleDialog, 'main');
$onClick(dialogHandler, 'main');
$on('change', populateSkills, '#skillSelect');
$on('change', updateSkill, '[data-list="skills"]');
$on('input', updateSkill, '[data-list="skills"]');
$on('input', updateSkill, '[data-list="stress"]');
$on('change', updateSkill, '[data-list="stress"]');