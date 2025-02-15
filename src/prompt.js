const promptDialog = document.querySelector('#prompt-dialog');
const doneButton = document.querySelector('#prompt-done-button');
const cancelButton = document.querySelector('#prompt-cancel-button');
const messageSpan = document.querySelector('#prompt-message');
const input = document.querySelector('#prompt-input');

export async function nudelPrompt(message = '') {
  if (!messageSpan) throw new Error('prompt message not found');
  if (!doneButton) throw new Error('prompt done button not found');
  if (!cancelButton) throw new Error('prompt cancel button not found');
  messageSpan.textContent = message;
  promptDialog?.showModal();

  return new Promise((resolve) => {
    doneButton.onclick = () => {
      promptDialog?.close();
      resolve(input?.value);
    };
    cancelButton.onclick = () => {
      promptDialog?.close();
      resolve(null);
    };
  });
}
