const youSureDialog = document.querySelector('#you-sure-dialog');
const yesButton = document.querySelector('#you-sure-yes-button');
const noButton = document.querySelector('#you-sure-no-button');
const actionDescriptionSpan = document.querySelector('#you-sure-action-description');

export async function nudelConfirm(message = 'Are you sure you want to do that???') {
  if (!actionDescriptionSpan) throw new Error('you-sure-action-description not found');
  if (!youSureDialog) throw new Error('you-sure-dialog not found');
  if (!yesButton) throw new Error('you-sure-yes-button not found');
  if (!noButton) throw new Error('you-sure-no-button not found');
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
