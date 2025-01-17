const youSureDialog = document.querySelector('#you-sure-dialog');
const yesButton = document.querySelector('#you-sure-yes-button');
const noButton = document.querySelector('#you-sure-no-button');
const actionDescriptionSpan = document.querySelector('#you-sure-action-description');

export async function nudelConfirm(message = 'Are you sure you want to do that???') {
  actionDescriptionSpan.textContent = message;
  youSureDialog.showModal();

  return new Promise((resolve) => {
    yesButton.onclick = () => {
      youSureDialog.close();
      resolve(true);
    };
    noButton.onclick = () => {
      youSureDialog.close();
      resolve(false);
    };
  });
}
