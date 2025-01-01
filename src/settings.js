const settingsButton = document.querySelector("#settings-button");
const settingsDialog = document.querySelector("#settings-dialog");

settingsButton.addEventListener("click", () => {
  settingsDialog.showModal();
});

const defaultSettings = {
  sampleToggle: false,
  sampleText: "hello world",
  sampleOption: 2,
};

const LOCAL_STORAGE_KEY = "nudelsalat-settings-v0";

function getSettingsFromLocalStorage() {
  const rawSettings = localStorage.getItem(LOCAL_STORAGE_KEY);

  let parsedSettings = { ...defaultSettings };
  if (rawSettings) {
    try {
      parsedSettings = { ...defaultSettings, ...JSON.parse(rawSettings) };
    } catch (e) {
      console.warn("failed to parse settings. defaulting to defaults.", e);
    }
  }

  // Re-affirm!
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsedSettings));
  return parsedSettings;
}

function saveSettingsToLocalStorage(settings) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
}

const sampleTextInput = document.querySelector("#settings-sample-text");
const sampleToggleInput = document.querySelector("#settings-sample-checkbox");
const sampleOptionInputs = document.querySelectorAll(
  'input[name="settings-sample-radio"]'
);

function inferSettingsFromDom() {
  const chosenRadio = document.querySelector(
    'input[name="settings-sample-radio"]:checked'
  );
  const inferredSettings = {
    sampleText: sampleTextInput?.value,
    sampleToggle: sampleToggleInput?.checked,
  };
  if (chosenRadio) {
    inferredSettings.sampleOption = chosenRadio.value;
  }
  const settings = { ...defaultSettings, ...inferredSettings };
  return settings;
}

function applySettingsToDom(settings) {
  if (sampleTextInput) {
    sampleTextInput.value = settings.sampleText;
  }
  if (sampleToggleInput) {
    sampleToggleInput.checked = settings.sampleToggle;
  }
  sampleOptionInputs.forEach((input) => {
    input.checked = input.value == settings.sampleOption;
  });
}

if (sampleTextInput) {
  sampleTextInput.addEventListener("input", () => {
    saveSettingsToLocalStorage(inferSettingsFromDom());
  });
}

if (sampleToggleInput) {
  sampleToggleInput.addEventListener("change", () => {
    saveSettingsToLocalStorage(inferSettingsFromDom());
  });
}

sampleOptionInputs.forEach((input) => {
  input.addEventListener("change", () => {
    saveSettingsToLocalStorage(inferSettingsFromDom());
  });
});

const loadedSettings = getSettingsFromLocalStorage();
applySettingsToDom(loadedSettings);
