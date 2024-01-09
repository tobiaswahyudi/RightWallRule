export class UIManager {
  constructor() {
    this.state = null;
    this.backdrop = document.getElementById('modal-backdrop');
    this.openChestDialog = document.getElementById('open-chest');
  }

  show() {
    this.backdrop.style.display = "block";
    this[this.state].style.display = "block";
  }

  close() {
    this[this.state].style.display = "none";
    this.backdrop.style.display = "none";
    this.state = null;
  }

  showChestDialog(returnFn) {
    this.state = 'openChestDialog';

    const buttons = this.openChestDialog.children[1].children;

    buttons[0].onclick = () => {
      this.close();
      returnFn();
    }

    this.show();
  }
}