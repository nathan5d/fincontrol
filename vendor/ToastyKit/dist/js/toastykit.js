
var toast = {

    nextToastPosition: 10,
    show: function (titulo, mensagem) {
        var self = this; // Armazena a referência ao this
        var toast = document.createElement('div');
        toast.classList.add('toast');
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');

        // Ajusta a posição vertical do novo toast com base na posição do último toast
        toast.style.top = this.nextToastPosition + 'px';

        var toastHeader = document.createElement('div');
        toastHeader.classList.add('toast-header');

        var strong = document.createElement('strong');
        strong.classList.add('me-auto');
        strong.textContent = titulo;

        var btnClose = document.createElement('button');
        btnClose.setAttribute('type', 'button');
        btnClose.classList.add('btn-close', 'ms-auto');
        btnClose.setAttribute('aria-label', 'Fechar');
        btnClose.innerHTML = '<span>&times;</span>';

        toastHeader.appendChild(strong);
        toastHeader.appendChild(btnClose);

        var toastBody = document.createElement('div');
        toastBody.classList.add('toast-body');
        toastBody.textContent = mensagem;

        toast.appendChild(toastHeader);
        toast.appendChild(toastBody);

        document.body.appendChild(toast);

        // Adiciona a classe para mostrar o Toast
        toast.classList.add('show');

        // Ajusta a posição vertical do próximo toast
        this.nextToastPosition += toast.offsetHeight + 10;

         // Remove o Toast após 3 segundos
        setTimeout(function () {
            toast.classList.remove('show');
            setTimeout(function () {
                toast.remove();
                // Verifica se não há mais toasts visíveis e redefine a posição inicial
                if (document.querySelectorAll('.toast.show').length === 0) {
                    self.nextToastPosition = 10; // Usa self em vez de this
                }
            }, 750); // Aguarda a transição terminar antes de remover o Toast
        }, 3000);

        // Evento de clique no botão Fechar
        btnClose.addEventListener('click', function () {
            toast.classList.remove('show');
            setTimeout(function () {
                toast.remove();
                // Verifica se não há mais toasts visíveis e redefine a posição inicial
                if (document.querySelectorAll('.toast.show').length === 0) {
                    self.nextToastPosition = 10; // Usa self em vez de this
                }
            }, 750); // Aguarda a transição terminar antes de remover o Toast
        });
    }

}