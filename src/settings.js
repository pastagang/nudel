const settingsButton = document.querySelector("#settings-button");
const settingsDialog = document.querySelector("#settings-dialog");

settingsButton.addEventListener("click", () => {
  settingsDialog.showModal();
});
