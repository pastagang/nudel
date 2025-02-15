const alertDialog = document.querySelector('#alert-dialog');
const alertMessageSpan = document.querySelector('#alert-message');

export async function nudelAlert(alertMessage = 'alert!') {
  if (!alertDialog) throw new Error('alert-dialog not found');
  if (!alertMessageSpan) throw new Error('alert-message not found');
  alertMessageSpan.innerHTML = alertMessage;
  alertDialog.showModal();
}
