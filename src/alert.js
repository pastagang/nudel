const alertDialog = document.querySelector('#alert-dialog');
const alertMessageSpan = document.querySelector('#alert-message');

export async function nudelAlert(alertMessage = 'alert!') {
  alertMessageSpan.textContent = alertMessage;
  alertDialog.showModal();
}
