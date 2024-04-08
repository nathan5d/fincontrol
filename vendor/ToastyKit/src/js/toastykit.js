function mostrarToast(titulo, mensagem, icone) {
    var toastContainer = document.createElement('div');
    toastContainer.classList.add('toast-container');
    var toast = document.createElement('div');
    toast.classList.add('toast');
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');

    var toastHeader = document.createElement('div');
    toastHeader.classList.add('toast-header');
    var img = document.createElement('img');
    img.src = icone;
    img.classList.add('rounded', 'me-2');
    var strong = document.createElement('strong');
    strong.classList.add('me-auto');
    strong.textContent = titulo;
    var btnClose = document.createElement('button');
    btnClose.setAttribute('type', 'button');
    btnClose.classList.add('btn-close');
    btnClose.setAttribute('data-bs-dismiss', 'toast');
    btnClose.setAttribute('aria-label', 'Close');

    var toastBody = document.createElement('div');
    toastBody.classList.add('toast-body');
    toastBody.textContent = mensagem;

    toastHeader.appendChild(img);
    toastHeader.appendChild(strong);
    toastHeader.appendChild(btnClose);
    toast.appendChild(toastHeader);
    toast.appendChild(toastBody);
    toastContainer.appendChild(toast);

    document.body.appendChild(toastContainer);

    console.log('hi')
}
