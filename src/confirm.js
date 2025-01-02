const youSureDialog = document.querySelector('#you-sure-dialog');
const yesButton = document.querySelector('#you-sure-yes-button');
const noButton = document.querySelector('#you-sure-no-button');

export async function nudelConfirm() {
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
