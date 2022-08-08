/*****
  Helper functions
*****/

const cond = (arr) => (data) => arr.find( ([fn, _]) => fn(data))[1](data);
const pipe = (...fns) => (...init) => fns.slice(1).reduce( (val, fn) => fn(val), fns[0](...init));
const arrayFrom = (val) => Array.from(val);
const toObject = (iterable) => Object.fromEntries(iterable);

const when = (test, fn) => (val) => test(val) ? fn(val) : val;

const ifElse = (test, ifFn, elseFn) => (val) =>  test(val) ? ifFn(val) : elseFn(val);
const $ = (el) => document.querySelector(el);
const $$ = (el) => document.querySelectorAll(el);
const $on = (ev, fn, el) => document.querySelector(el).addEventListener(ev, fn);
const $onClick = (fn, el) => document.querySelector(el).addEventListener('click', fn);
const formatNumber = (num, el) => Number(num).toLocaleString(undefined,{signDisplay: el === "vitals" ? "never" : "always"});
const isString = (val) => typeof(val) === 'string';
const isObject = (val) => typeof(val) === 'object';
const tee = (fn) => (val) =>  (fn(val), val);

const titleCase = (str) => `${str[0].toUpperCase()}${str.slice(1)}`;

const updateState = (key) => (val) => {
  obj = Object.assign({}, state[key], val);
  return (state[key] = obj);
};

const setState = (key) => (val) => (state[key] = val);

const deleteState = (key) => (val) => {
  obj = Object.assign({}, state[key]);
  delete obj[val];
  return (state[key] = obj);
};

const updateSkillsState = updateState('skills');
const deleteSkillsState = deleteState('skills');
const setSkillsState = setState('skills');

const createElement = (el, objOrStr, str) => {
  let attributes = {};
  let content = '';
  when(isObject, () => attributes = objOrStr)(objOrStr);
  when(isString, () => content = objOrStr)(objOrStr);
  when(isString, () => content = str)(str);
  const retEl = document.createElement(el);
    Object.entries(attributes).forEach( ([key, val]) => {
      retEl.setAttribute(key,val);
    });
  retEl.textContent = content;
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
  skills: {},
  stunts: {},
  vitals: {},
}


/*****
 Primary Functions
*****/

const getClosestForm = (ev) => ev.target.closest('form');
const convertToFormData = (form) => new FormData(form);
const closeDialog = (el) => $(`[data-popup="${el}"]`).close();
const isRangeSlider = (ev) => ev.target.type === "range";

const objectFrom = (val) => Object.fromEntries(val);
const outputObjToDOM = (obj) => {
  const checkImg = (key) => key === "charImg";
  const setImgSrc = (key) => $('[data-char="charImg"]').src = obj[key];
  const outputText = (key) => $(`[data-char="${key}"] > dd`).textContent = obj[key];
  Object.keys(obj).filter((key) => key !== "element").forEach(
    ifElse(checkImg, setImgSrc, outputText)
  );
  $('[data-char="charImg"]').style.maxHeight = `${$('.desc > div').offsetHeight}px`;
  return obj.element;
}

const saveObjToState = (obj) => {
  const copy = Object.assign({}, obj);
  delete copy.element;
  state[obj.element] = copy;
  return obj;
}

const saveCharObject = pipe(
  getClosestForm,
  convertToFormData,
  toObject,
  saveObjToState,
  outputObjToDOM,
  closeDialog
);


/*****
  Desc
*****/

const fillInDesDialog = (obj) => {
  Object.keys(obj).forEach( (key) => {
    $(`[name=${key}]`).value = obj[key];
  });
}

/*****
  Aspects
*****/

const fillInAspectDialog = (obj) => {
  Object.keys(obj).forEach( (key) => {
    $(`[name=${key}]`).value = obj[key];
  });
}

/*****
  Skills
*****/

const removeSelect = (fd) => (fd.delete("skillSelect"), fd);
const removeSkillInput = (fd) => (fd.delete("add-skill"), fd);
const formatSkills = (arr) => arr.map( ([key, val]) => [key.slice(3), val]);

const updateSkillNumber = (ev) => {
  const el = ev.target.closest('form').querySelector('[name="element"]').value;
  const outputEl = $(`output[for=${ev.target.id}]`);
  const outputText = `(${formatNumber(ev.target.value, el)})`;
  outputEl.textContent = outputText;
};
const updateSkill = when(isRangeSlider, updateSkillNumber)

const createSkillObj = (ev) => {
  const listToUse = ev.target.value === "skills" ? skillsList : approachesList;
  return listToUse.reduce( (acc, cur) => ({...acc, [cur]: 0}), {});
};

const addSkillsToSkillList = (obj) => {
  const parentEl = $('[data-list="skills"]');
  parentEl.textContent = '';
  Object.keys(obj).sort().forEach( (skill) => {
    const wrapper = createElement("span");
    const label = createElement("label", {for: `${skill}`}, `${skill} `);
    const outputEl = createElement("output", {for:`${skill}`}, `(+${obj[skill]}):`);
    const wrapper2 = createElement("span", {class: 'flex-row-align'});
    const inputEl = createElement('input', {
      type: "range",
      id:`${skill}`,
      min: "0",
      max: "8",
      name: `${skill}`,
      step: "1",
      value: `${obj[skill]}`
    });
    const delBtn = createElement('button',{type:'button', 'data-delskill': `${skill}`}, 'Delete skill')
    wrapper2.append(inputEl, delBtn)
    wrapper.append(label,outputEl)
    parentEl.append(wrapper, wrapper2);
  });
};

const getSkillToDelete = (ev) => ev.target.dataset.delskill;
const deleteSkill = (skill) => {
  $(`[for=${skill}]`).closest('span').remove();
  $(`input[name=${skill}]`).closest('span').remove();
  return skill;
};

const outputSkillsToDOM = (obj) => {
  $('.skills ul').textContent = '';
  Object.keys(obj).filter(k => k !== "element").forEach( (key) => {
    const el = createElement('li', `${key} (${formatNumber(obj[key])})`);
    $('.skills ul').append(el);
  });
  return obj.element;
};

const skillToObj = () => ({ [$("#add-skill").value]: 0 });

const saveCharList = pipe(
  getClosestForm,
  convertToFormData,
  removeSelect,
  removeSkillInput,
  toObject,
  saveObjToState,
  outputSkillsToDOM,
  closeDialog
);

const populateSkills = pipe(
  createSkillObj,
  addSkillsToSkillList
);

const removeSkill = pipe(
  getSkillToDelete,
  deleteSkill
);

const addNewSkill = pipe(
  skillToObj,
  updateSkillsState,
  addSkillsToSkillList
)


/*****
  Stunts
*****/


const removeStunt = (ev) => ev.target.closest('fieldset').remove();
const clearStunts = tee( () => $('[data-append="stunt"]').textContent = '');

const addStunt = (ev) => {
  const rand = Date.now().toString(16);
  const defaultText = 'Because I [describe how you are amazing or have a cool bit of gear], I get a +2 when I use [pick a skill] to [pick one: overcome, create an advantage, attack, defend] when [describe a circumstance].\n\nBecause I [describe how you are amazing or have a cool bit of gear], I can [describe your amazing feat], but only [describe a circumstance or limitation].'
  appendStunts(addStuntFromState({[rand]: defaultText}));
  $(`#name${rand}`).value = '';
}

const addStuntFromState = (obj) => {
  return Object.keys(obj).sort().map( (key) => {
    const fset = createElement('fieldset', {class: "flex-col"});
    const leg = createElement('legend', "Stunt Info");
    const nameLabel = createElement('label', {for: `name${key}`},'Stunt Name');
    const nameText = createElement('input', {type: 'text', name: `name${key}`, id: `name${key}`, value: key})
    const descLabel = createElement('label', {for: `desc${key}`},'Stunt Description');
    const descText = createElement('textarea', {rows: '8', name: `desc${key}`, id: `desc${key}`}, obj[key])
    const delButton = createElement('button', {type: 'button', 'data-remove': 'stunt'}, 'Remove Stunt')
    fset.append(leg, nameLabel, nameText, descLabel, descText, delButton);
    return fset;
    // $('[data-append="stunt"]').append(fset);
  });
}

const appendStunts = (arr) => arr.forEach ( (el) => $('[data-append="stunt"]').append(el));

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
  Object.keys(obj).sort().forEach( (key) => {
    if (key !== "element") {
      const dl = createElement('dl');
      const dt = createElement('dt', key);
      const dd = createElement('dd', obj[key]);  
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
  saveObjToState,
  outputStuntsToDOM,
  closeDialog
);

const fillInStuntsDialog = pipe(
  clearStunts,
  addStuntFromState,
  appendStunts
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
      const title = createElement('strong', titleCase(titleText));
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
      const dt = createElement('dt', titleCase(title));
      const dd = createElement('dd', obj[key]);  
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
  saveObjToState,
  populateStressBoxes,
  fillConsequences,
  closeDialog
);

const setStressNumbers = (obj) => {
  Object.keys(obj).filter( (key) => key.includes("Stress")).forEach( (key) => {
    $(`output[for="${key}"]`).textContent = `(${obj[key]})`;
  });
  return obj;
};

const setStressSliders = (obj) => {
  Object.keys(obj).filter( (key) => key.includes("Stress")).forEach( (key) => {
    $(`input[name="${key}"]`).value = `(${obj[key]})`;
  });
  return obj;
};

const setConsequences = (obj) => {
  Object.keys(obj).filter( (key) => key.includes("Consequence")).forEach( (key) => {
    $(`#${key}`).value = obj[key];
  });
  return obj;
};

const fillInVitalsDialog = pipe(
  setStressNumbers,
  setStressSliders,
  setConsequences
);


/*****
  Init
*****/

$('[data-char="charImg"]').style.maxHeight = `${$('.desc > div').offsetHeight}px`;

const toggleDialog = (ev) => {
  const target = ev.target.dataset.edit;
  if (!target) return;
  const stateData = state[target];
  when((tgt) => tgt === 'skills', () => addSkillsToSkillList(stateData))(target);
  when((tgt) => tgt === 'desc', () => fillInDesDialog(stateData))(target);
  when((tgt) => tgt === 'aspects', () => fillInAspectDialog(stateData))(target);
  when((tgt) => tgt === 'stunts', () => fillInStuntsDialog(stateData))(target);
  when((tgt) => tgt === 'vitals', () => fillInVitalsDialog(stateData))(target);
  $(`[data-popup=${target}]`).showModal();
};



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
  [(ev) => ev.target.dataset.delskill, (ev) => removeSkill(ev)],
  [(ev) => ev.target.dataset.add === 'skill', (ev) => addNewSkill(ev)],
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