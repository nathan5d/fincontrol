


//let user
// Verifica se o usuário já está logado
auth.onAuthStateChanged((user) => {
    if (user) {
        // Chama a função de atualização se o usuário estiver autenticado
        user = user

        atualizarExibicao();
    } else {
        console.error("Usuário não autenticado.");
        // Aqui você pode lidar com a situação de usuário não autenticado, como redirecionar para a página de login
    }
});

async function getAccessUid() {
    const user = firebase.auth().currentUser;
    const uid = user.uid;

    // Obter o token da URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
        // Procurar o user.uid correspondente na coleção accessTokens
        const tokenDoc = await db.collection("accessTokens").doc(token).get();

        //if (tokenDoc.exists) {
        const userUid = tokenDoc.data().uid;
        console.log(userUid);
        console.log('usuario:' + uid, 'Shared:' + userUid)
        if (uid != userUid) {
            return userUid;
        }



    } else {
        // Obter o documento do usuário
        const userDoc = await db.collection("users").doc(uid).get();
        const userData = userDoc.data();

        // Se o sharedAccessUid existir, usá-lo. Caso contrário, usar o uid do usuário.
        return (userData && userData.sharedAccessUid) ? userData.sharedAccessUid : uid;
    }
}


// Função para adicionar receita
async function adicionarReceita() {
    const nome = document.getElementById("nomeReceita").value;
    const data = document.getElementById("dataReceita").value;
    const valor = parseFloat(document.getElementById("valorReceita").value.replace('.', '').replace(',', '.'));
    const categoria = document.getElementById("categoriaReceita").value;
    const statusReceita = document.getElementById("statusReceita").value;

    // Verificar se os campos obrigatórios estão preenchidos
    if (nome && data && valor && statusReceita) {
        // Adicionar os dados ao Firestore

        const accessUid = await getAccessUid();

        // Usar o accessUid para acessar o banco de dados
        db.collection("users").doc(accessUid).collection("receitas").add({
            nome: nome,
            data: data,
            valor: valor,
            categoria: categoria,
            status: statusReceita

        })
            .then((docRef) => {
                console.log("Receita adicionada com ID: ", docRef.id);
                console.log(docRef.id)
                // Limpar os campos do formulário e fechar o modal
                document.getElementById("nomeReceita").value = "";
                document.getElementById("dataReceita").value = "";
                document.getElementById("valorReceita").value = "";
                document.getElementById("categoriaReceita").value = "";
                document.getElementById("statusReceita").value = "";
                // Atualizar a exibição
                atualizarExibicao();
                // Fechar o modal
                $('#modalReceita').modal('hide');
            })
            .catch((error) => {
                console.error("Erro ao adicionar receita: ", error);
            });
    } else {
        alert("Por favor, preencha todos os campos obrigatórios.");
    }
}

// Função para adicionar despesa
async function adicionarDespesa() {
    const nome = document.getElementById("nomeDespesa").value;
    const data = document.getElementById("dataDespesa").value;
    const valor = parseFloat(document.getElementById("valorDespesa").value.replace('.', '').replace(',', '.'));
    const categoria = document.getElementById("categoriaDespesa").value;
    const statusDespesa = document.getElementById("statusDespesa").value;

    // Verificar se os campos obrigatórios estão preenchidos
    if (nome && data && valor && categoria && statusDespesa) {
        // Adicionar os dados ao Firestore
        const accessUid = await getAccessUid();

        // Usar o accessUid para acessar o banco de dados
        db.collection("users").doc(accessUid).collection("despesas").add({
            nome: nome,
            data: data,
            valor: valor,
            categoria: categoria,
            status: statusDespesa
        })
            .then((docRef) => {
                console.log("Despesa adicionada com ID: ", docRef.id);
                // Limpar os campos do formulário e fechar o modal
                document.getElementById("nomeDespesa").value = "";
                document.getElementById("dataDespesa").value = "";
                document.getElementById("valorDespesa").value = "";
                document.getElementById("categoriaDespesa").value = "";
                document.getElementById("statusDespesa").value = "";
                // Atualizar a exibição
                atualizarExibicao();
                // Fechar o modal
                $('#modalDespesa').modal('hide');
            })
            .catch((error) => {
                console.error("Erro ao adicionar despesa: ", error);
            });
    } else {
        alert("Por favor, preencha todos os campos obrigatórios.");
    }
}

// Função para exibir os dados e atualizar o dashboard
// Função para exibir os dados e atualizar o dashboard


async function atualizarExibicao() {
    // Exibir a tela de carregamento
    document.getElementById('loadingScreen').style.display = 'none';




    const accessUid = await getAccessUid();
    try {
        // Limpar listas
        listaReceitas.innerHTML = '';
        listaDespesas.innerHTML = '';

        // Adicionar listener para receitas
        db.collection("users").doc(accessUid).collection("receitas")
            .onSnapshot((snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    const receita = change.doc.data();
                    const id = change.doc.id;

                    if (change.type === "added") {
                        const item = criarItemLista(receita, "Receita", id);
                        listaReceitas.appendChild(item);
                    } else if (change.type === "modified") {
                        const itemExistente = listaReceitas.querySelector(`[data-id="${id}"]`);
                        if (itemExistente) {
                            itemExistente.innerHTML = criarItemLista(receita, "Receita", id).innerHTML;
                        }
                    } else if (change.type === "removed") {
                        const itemExistente = listaReceitas.querySelector(`[data-id="${id}"]`);
                        if (itemExistente) {
                            listaReceitas.removeChild(itemExistente);
                        }
                    }

                    calcularValores(); // Chamar a função calcularValores() após cada mudança nas receitas
                });
            });

        // Adicionar listener para despesas
        db.collection("users").doc(accessUid).collection("despesas")
            .onSnapshot((snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    const despesa = change.doc.data();
                    const id = change.doc.id;

                    if (change.type === "added") {
                        const item = criarItemLista(despesa, "Despesa", id);
                        listaDespesas.appendChild(item);
                    } else if (change.type === "modified") {
                        const itemExistente = listaDespesas.querySelector(`[data-id="${id}"]`);
                        if (itemExistente) {
                            itemExistente.innerHTML = criarItemLista(despesa, "Despesa", id).innerHTML;
                        }
                    } else if (change.type === "removed") {
                        const itemExistente = listaDespesas.querySelector(`[data-id="${id}"]`);
                        if (itemExistente) {
                            listaDespesas.removeChild(itemExistente);
                        }
                    }

                    calcularValores(); // Chamar a função calcularValores() após cada mudança nas despesas
                });
            });




        // Ocultar a tela de carregamento quando os dados terminarem de carregar

        //document.querySelector('.skeleton').classList.remove('loading');
        
    } catch (error) {
        console.error("Erro ao atualizar exibição:", error);
    }
}
async function calcularValores() {
    // Para exibir o esqueleto de carregamento
    // Para exibir o esqueleto de carregamento
    document.querySelectorAll('.skeleton').forEach(element => {
        element.classList.add('loading');
    });

    // Calcular e exibir os valores de receitas e despesas em seus respectivos cards
    const totalReceitasPagas = await calcularSomaValoresReceitas("Pago");
    const totalReceitasPendentes = await calcularSomaValoresReceitas("Pendente");

    const totalReceitas = (totalReceitasPagas + totalReceitasPendentes);

    const totalDespesasPagas = await calcularSomaValoresDespesas("Pago");
    const totalDespesasPendentes = await calcularSomaValoresDespesas("Pendente");

    const totalDespesas = (totalDespesasPagas + totalDespesasPendentes);

    const quantidadeDespesasPagas = await calcularQuantidadeDespesas("Pago");
    const quantidadeDespesasPendentes = await calcularQuantidadeDespesas("Pendente");

    // Atualizar os valores nos cards de receitas
    document.getElementById("totalReceitas").textContent = `R$ ${formatarValorParaExibicao(totalReceitas)}`;

    // Atualizar os valores nos cards de despesas
    document.getElementById("totalDespesas").innerText = `R$ ${formatarValorParaExibicao(totalDespesasPagas + totalDespesasPendentes)}`;

    // Calcular saldo
    const saldo = (totalReceitas) - (totalDespesasPagas + totalDespesasPendentes);
    document.getElementById("saldo").textContent = `R$ ${formatarValorParaExibicao(saldo)}`;

    // Verificar se o saldo é negativo e aplicar a classe correspondente
    if (saldo < 0) {
        document.getElementById("saldo").classList.add("saldo-negativo"); // Adiciona a classe "saldo-negativo"
    } else {
        document.getElementById("saldo").classList.remove("saldo-negativo"); // Remove a classe "saldo-negativo"
    }

    // Seleciona o primeiro span dentro do elemento com id "legendDespesas"
    document.querySelector('#legendReceitas span:nth-child(2)').textContent = totalReceitasPendentes ? `R$ ${formatarValorParaExibicao(totalReceitasPendentes)}` : `R$ ${formatarValorParaExibicao(totalReceitas)}`;
    document.querySelector('#legendReceitas span:nth-child(3)').textContent = `${totalReceitasPendentes ? 'pendente' : 'recebido'}`;

    // Atualizar a porcentagem de despesas pagas em relação ao total de despesas no card "legendDespesas"
    const percentualDespesasPagas = ((quantidadeDespesasPagas) / (quantidadeDespesasPagas + quantidadeDespesasPendentes)) * 100;
    if (totalReceitasPagas > 0) {
        document.querySelector('#legendDespesas span:nth-child(2)').textContent = `${percentualDespesasPagas.toFixed(2)}%`;
        document.querySelector('#legendDespesas span:nth-child(3)').textContent = ` das despesas já pagas`;
    } else {
        document.querySelector('#legendDespesas span:nth-child(2)').textContent = `R$ ${formatarValorParaExibicao(0)}`;
        document.querySelector('#legendDespesas span:nth-child(3)').textContent = ` receita`;
    }

    // Calcular a diferença entre o total de receitas pagas e o total de despesas pagas
    const diferencaReceitasDespesas = totalReceitasPagas - totalDespesasPagas;

    // Calcular a porcentagem da diferença em relação ao total de receitas pagas
    const percentualBalanco = (diferencaReceitasDespesas / totalReceitasPagas) * 100;

    // Atualizar a porcentagem de saldo no card "legendSaldo"
    document.querySelector('#legendSaldo span:nth-child(2)').textContent = `${percentualBalanco > 0 ? percentualBalanco.toFixed(2) : '0'}%`;
    document.querySelector('#legendSaldo span:nth-child(3)').textContent = `de saldo (R$ ${formatarValorParaExibicao(diferencaReceitasDespesas)})`;

    // Para exibir o esqueleto de carregamento
    // Para exibir o esqueleto de carregamento
    document.querySelectorAll('.skeleton').forEach(element => {
        element.classList.remove('loading');
    });
}

function criarItemLista(item, tipo, id) {
    const listItem = document.createElement('li');
    listItem.classList.add('list-group-item');
    // Adicionando o atributo data-id
    listItem.setAttribute('data-id', id);

    const statusClass = item.status === 'Pago' ? 'text-success' : 'text-danger';

    listItem.innerHTML = `
    <div class="row">
        <div class="col">
            <div class="row">
                <div class="col-md-3 h5 font-weight-bold mb-0">
                    <div>${item.nome}</div>
                    <div class="skeleton ${tipo === 'Receita' ? 'text-success' : 'text-danger'}"> R$ ${formatarValorParaExibicao(item.valor)}</div>
                </div>

                <div class="m-auto col-md-3 mb-0" ${tipo === 'Receita' ? 'style="display:none"' : ''}>
                    <div class="text-md-center">
                        <span class="text-md-center d-md-none">Categoria:</span>
                        <button class="btn btn-sm py-0 px-2 btn-secondary" onclick="${tipo === 'Receita' ? `editarReceita('${id}')` : `editarDespesa('${id}')`}">${item.categoria ? item.categoria : 'Sem categoria'}</button>
                    </div>
                </div>


                <div class="m-auto col-md-3 mb-0">
                    <div class="text-md-center">
                        <span class="text-md-center d-md-none">Data:</span>
                        <span>${item.data ? item.data : '<i>Indefinido</i>'}</span>
                    </div>
                </div>
                <div class="m-auto col-md-3 mb-0">
                    <div class="text-md-center">
                        <span class="text-md-center d-md-none">Status:</span>
                        <button class="btn ${statusClass} bg-light" onclick="${tipo === 'Receita' ? `editarReceita('${id}')` : `editarDespesa('${id}')`}">${item.status}</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-auto d-flex d-print-none">
            <div class="mt-2 m-sm-auto ">
                <button class="btn btn-info btn-sm" onclick="${tipo === 'Receita' ? `editarReceita('${id}')` : `editarDespesa('${id}')`}"">Editar</button>
            <button class="btn btn-danger btn-sm" onclick="${tipo === 'Receita' ? `excluirReceita('${id}')` : `excluirDespesa('${id}')`}">Excluir</button>
        </div>

    </div>
</div>
    </div >


    `;

    return listItem;
}


// Função para editar receita por ID
async function editarReceita(id) {

    const accessUid = await getAccessUid();
    // Usar o accessUid para acessar o banco de dados
    db.collection("users").doc(accessUid).collection("receitas").doc(id).get()
        .then((doc) => {
            if (doc.exists) {
                const receita = doc.data();
                // Preencher campos do formulário de edição com os dados da receita a ser editada
                document.getElementById("editNomeReceita").value = receita.nome;
                document.getElementById("editDataReceita").value = receita.data;
                document.getElementById("editValorReceita").value = formatarValorParaExibicao(receita.valor);
                document.getElementById("editCategoriaReceita").value = receita.categoria;
                document.getElementById("editStatusReceita").value = receita.status;

                // Armazenar temporariamente o ID da receita que será editada
                itemParaEditar = id;
                tipoItemParaEditar = 'receita';

                // Abrir modal de edição
                $('#modalEditarReceita').modal('show');
            } else {
                console.error("Documento não encontrado.");
            }
        })
        .catch((error) => {
            console.error("Erro ao buscar receita para edição:", error);
        });
}

// Função para editar despesa por ID
async function editarDespesa(id) {
    const accessUid = await getAccessUid();
    // Usar o accessUid para acessar o banco de dados
    db.collection("users").doc(accessUid).collection("despesas").doc(id).get()
        .then((doc) => {
            if (doc.exists) {
                const despesa = doc.data();
                // Preencher campos do formulário de edição com os dados da despesa a ser editada
                document.getElementById("editNomeDespesa").value = despesa.nome;
                document.getElementById("editDataDespesa").value = despesa.data;
                document.getElementById("editValorDespesa").value = formatarValorParaExibicao(despesa.valor);
                document.getElementById("editCategoriaDespesa").value = despesa.categoria;
                document.getElementById("editStatusDespesa").value = despesa.status;

                // Armazenar temporariamente o ID da despesa que será editada
                itemParaEditar = id;
                tipoItemParaEditar = 'despesa';

                // Abrir modal de edição
                $('#modalEditarDespesa').modal('show');
            } else {
                console.error("Documento não encontrado.");
            }
        })
        .catch((error) => {
            console.error("Erro ao buscar despesa para edição:", error);
        });
}
// Função para excluir receita por ID
async function excluirReceita(id) {
    const accessUid = await getAccessUid();
    // Usar o accessUid para acessar o banco de dados

    Swal.fire({
        title: "Exclusão",
        text: "Deseja exlcuir o item?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sim, remova!"
    }).then((result) => {
        if (result.isConfirmed) {
            db.collection("users").doc(accessUid).collection("receitas").doc(id).delete()
                .then(() => {
                    Swal.fire({
                        title: "Excluído!",
                        text: "A ação não pode ser desfeita.",
                        icon: "success"
                    });
                    atualizarExibicao();
                })
                .catch((error) => {
                    console.error("Erro ao excluir receita:", error);
                });

        }
    });

}

// Função para excluir despesa por ID
async function excluirDespesa(id) {
    const accessUid = await getAccessUid();
    // Usar o accessUid para acessar o banco de dados

    Swal.fire({
        title: "Exclusão",
        text: "Deseja excluir o item?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sim, exclua!"
    }).then((result) => {
        if (result.isConfirmed) {
            db.collection("users").doc(accessUid).collection("despesas").doc(id).delete()
                .then(() => {
                    Swal.fire({
                        title: "Excluído!",
                        text: "A ação não pode ser desfeita.",
                        icon: "success"
                    });
                    atualizarExibicao();
                })
                .catch((error) => {
                    console.error("Erro ao excluir despesa:", error);
                });

        }
    });

}

// Função para salvar a edição da receita por ID
async function salvarEdicaoReceita() {
    if (itemParaEditar && tipoItemParaEditar === 'receita') {
        const nome = document.getElementById("editNomeReceita").value;
        const data = document.getElementById("editDataReceita").value;
        const valor = parseFloat(document.getElementById("editValorReceita").value.replace('.', '').replace(',', '.'));
        const categoria = document.getElementById("editCategoriaReceita").value;
        const statusReceita = document.getElementById("editStatusReceita").value;

        // Atualizar os dados da receita no Firestore
        const accessUid = await getAccessUid();

        // Usar o accessUid para acessar o banco de dados

        db.collection("users").doc(accessUid).collection("receitas").doc(itemParaEditar).update({ nome, data, valor, categoria, status: statusReceita })
            .then(() => {
                toast.show('Atualizar', 'Item atualizado com sucesso!')
                $('#modalEditarReceita').modal('hide');
                atualizarExibicao();
            })
            .catch((error) => {
                console.error("Erro ao atualizar despesa:", error);
            });


    }
}

// Função para salvar a edição da despesa por ID
async function salvarEdicaoDespesa() {
    if (itemParaEditar && tipoItemParaEditar === 'despesa') {
        const nome = document.getElementById("editNomeDespesa").value;
        const data = document.getElementById("editDataDespesa").value;
        const valor = parseFloat(document.getElementById("editValorDespesa").value.replace('.', '').replace(',', '.'));
        const categoria = document.getElementById("editCategoriaDespesa").value;
        const statusDespesa = document.getElementById("editStatusDespesa").value;

        // Atualizar os dados da despesa no Firestore
        const accessUid = await getAccessUid();

        // Usar o accessUid para acessar o banco de dados
        db.collection("users").doc(accessUid).collection("despesas").doc(itemParaEditar).update({ nome, data, valor, categoria, status: statusDespesa })
            .then(() => {
                toast.show('Atualizar', 'Item atualizado com sucesso!')
                // Atualizar a exibição
                atualizarExibicao();
                // Fechar modal de edição
                $('#modalEditarDespesa').modal('hide');
            })
            .catch((error) => {
                console.error("Erro ao atzualizar despesa:", error);
            });
    }
}


// Função para calcular a soma dos valores de receitas com base no status
async function calcularSomaValoresReceitas(status) {
    const accessUid = await getAccessUid();

    try {
        let total = 0;
        // Usar o accessUid para acessar o banco de dados
        const receitasSnapshot = await db.collection("users").doc(accessUid).collection("receitas").where("status", "==", status).get();
        receitasSnapshot.forEach((doc) => {
            const receita = doc.data();
            total += receita.valor;
        });
        return total;
    } catch (error) {
        console.error("Erro ao calcular a soma dos valores de receitas:", error);
        return 0;
    }
}

// Função para calcular a soma dos valores de despesas com base no status
async function calcularSomaValoresDespesas(status) {
    const accessUid = await getAccessUid();

    try {
        let total = 0;
        // Usar o accessUid para acessar o banco de dados
        const despesasSnapshot = await db.collection("users").doc(accessUid).collection("despesas").where("status", "==", status).get();
        despesasSnapshot.forEach((doc) => {
            const despesa = doc.data();
            total += despesa.valor;
        });
        return total;
    } catch (error) {
        console.error("Erro ao calcular a soma dos valores de despesas:", error);
        return 0;
    }
}

// Função para calcular a quantidade de despesas com base no status
async function calcularQuantidadeDespesas(status) {
    const accessUid = await getAccessUid();
    // Usar o accessUid para acessar o banco de dados
    try {
        let quantidade = 0;
        const despesasSnapshot = await db.collection("users").doc(accessUid).collection("despesas").where("status", "==", status).get();
        quantidade = despesasSnapshot.size;
        return quantidade;
    } catch (error) {
        console.error("Erro ao calcular a quantidade de despesas:", error);
        return 0;
    }
}

// Função para formatar o valor para exibição
function formatarValorParaExibicao(valor) {
    // Verifica se o valor é um número
    if (typeof valor !== 'number' || isNaN(valor)) {
        return ''; // Retorna uma string vazia se o valor não for um número válido
    }

    // Converte o valor para uma string com duas casas decimais e separador de milhares
    const valorFormatado = valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // Remove o símbolo de moeda (R$) e espaços em branco do valor formatado
    return valorFormatado.replace('R$', '').trim();
}



// Exemplo de uso da biblioteca
function exportarDados() {
    const dados = {
        receitas: JSON.parse(localStorage.getItem('receitas')) || [],
        despesas: JSON.parse(localStorage.getItem('despesas')) || []
    };

    const json = JSON.stringify(dados);
    const blob = new Blob([json], { type: 'application/json' });
    const uuid = uuidv4();
    const nomeArquivo = `fincontrol_${uuid} _Export.json`;

    saveAs(blob, nomeArquivo);

    toast.show('Export', nomeArquivo + ' foi exportado')
}

// Função para importar os dados de um arquivo JSON
function importarDados(event) {
    const arquivo = event.target.files[0];
    const leitor = new FileReader();

    leitor.onload = async function (evento) {
        const dados = JSON.parse(evento.target.result);
        const dataAtualizacao = new Date();

        // Formato de data dd/mm/yyyy
        const dia = String(dataAtualizacao.getDate()).padStart(2, '0');
        const mes = String(dataAtualizacao.getMonth() + 1).padStart(2, '0'); // +1 porque os meses são indexados a partir de 0
        const ano = dataAtualizacao.getFullYear();
        const dataFormatada = `${dia} /${mes}/${ano} `;

        // Atualizar todas as datas para a data formatada de importação
        dados.receitas.forEach(receita => receita.data = dataFormatada);
        dados.despesas.forEach(despesa => despesa.data = dataFormatada);

        // Adicionar os dados ao Firestore
        const accessUid = await getAccessUid();

        // Usar o accessUid para acessar o banco de dados
        const receitasRef = db.collection("users").doc(accessUid).collection("receitas");
        const despesasRef = db.collection("users").doc(accessUid).collection("despesas");

        dados.receitas.forEach(receita => {
            receitasRef.add(receita)
                .then((docRef) => {
                    console.log("Receita importada com ID: ", docRef.id);
                })
                .catch((error) => {
                    console.error("Erro ao importar receita: ", error);
                });
        });

        dados.despesas.forEach(despesa => {
            despesasRef.add(despesa)
                .then((docRef) => {
                    console.log("Despesa importada com ID: ", docRef.id);
                })
                .catch((error) => {
                    console.error("Erro ao importar despesa: ", error);
                });
        });

        // Atualizar a exibição
        atualizarExibicao();
    };

    leitor.readAsText(arquivo);
    toast.show('import', ' Dados importados')
}

// Função para gerar um UUID (Universally Unique Identifier)
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}







$(function () {

    $('.date').mask('00/00/0000');
    // Seletor do campo de data
    $(".date").datepicker({
        dateFormat: 'dd/mm/yy' // Formato da data
    });

});

$(document).ready(function () {
    $('.money').mask("#.##0,00", { reverse: true });
});





// Verificar status da conexão e exibir mensagem offline ao carregar a página
// Função para definir a cor do tema com base no status da conexão
function setThemeColorBasedOnConnectionStatus() {
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    const statusBariOS = document.querySelector('meta[name="apple-mobile-web-app-status-bar"]');

    const isOnline = navigator.onLine;
    const offlineMessage = document.getElementById("offline-message");

    // Define a cor do tema com base no status da conexão
    if (isOnline) {
        themeColorMeta.setAttribute('content', '#FFFFFF'); // Cor do tema quando online
        statusBariOS.setAttribute('content', '#FFFFFF'); // Cor do tema quando online
        offlineMessage.style.display = "none"; // Oculta a mensagem offline
    } else {
        themeColorMeta.setAttribute('content', '#071e2c'); // Cor do tema quando offline
        statusBariOS.setAttribute('content', '#071e2c'); // Cor do tema quando offline
        offlineMessage.style.display = "block"; // Exibe a mensagem offline
    }
}

// Verifica o status da conexão ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
    // Define a cor do tema com base no status da conexão ao carregar a página
    setThemeColorBasedOnConnectionStatus();
});

// Monitora alterações no status da conexão
window.addEventListener('online', setThemeColorBasedOnConnectionStatus);
window.addEventListener('offline', setThemeColorBasedOnConnectionStatus);


if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js')
            .then(registration => {
                //console.log('Service Worker registrado com sucesso:', registration);
            })
            .catch(error => {
                console.error('Falha ao registrar o Service Worker:', error);
            });
    });
}



feather.replace();






document.querySelector('.fab-button').addEventListener('click', function () {
    var button = document.querySelector('.fab-button');
    var options = document.querySelector('.fab-options');

    button.classList.toggle('active');
    options.classList.toggle('active');
    // Exemplo de uso

});






// Verifica se está autenticado e Exibe o nome do usuario
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {

        // O usuário está autenticado, exiba o nome
        document.getElementById("userInfo").textContent = user.displayName ? user.displayName : 'Usuário';

    } else {
        // O usuário não está autenticado, redirecione-o para a tela de login
        // Obter o token da URL
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        const redrectLogin = token ? `login.html ? token = ${token} ` : `login.html ? token = ${token} `
        window.location.href = redrectLogin;
    }
});

// Função para fazer logout
function logout() {
    firebase.auth().signOut().then(function () {
        // Logout bem-sucedido, redirecione para a tela de login
        window.location.href = "login.html";
    }).catch(function (error) {
        // Trate erros de logout, se necessário
        console.error("Erro ao fazer logout:", error);
    });
}

// Função para gerar o link de compartilhamento com o token
async function generateShareLink() {
    try {

        const user = firebase.auth().currentUser;


        // Cria um novo token de convidado no Firestore
        const tokenRef = await db.collection("accessTokens").add({
            uid: user.uid
        });

        // URL base da sua aplicação (index.html)
        const baseUrl = window.location.href.split('?')[0]; // Remove parâmetros de consulta, se houver

        // Link de compartilhamento com o token como parâmetro de consulta
        const shareLink = `${baseUrl}?token = ${tokenRef.id} `;

        return shareLink;
    } catch (error) {
        console.error("Erro ao gerar link de compartilhamento:", error);
        alert("Erro ao gerar link de compartilhamento.");
        return null;
    }
}


// Função para copiar o link de compartilhamento
async function copyShareLink() {
    const shareLink = await generateShareLink();
    const shareLinkInput = document.getElementById("shareLink");
    shareLinkInput.value = shareLink;

    //const shareLinkInput = document.getElementById("shareLink");
    shareLinkInput.select();
    document.execCommand("copy");

    toast.show('Compartilhar', "Link copiado para a área de transferência!");
}

// Executar a função de geração do link de compartilhamento ao carregar a página
window.onload = async function () {
    //const shareLink = await generateShareLink();
    //const shareLinkInput = document.getElementById("shareLink");
    //shareLinkInput.value = shareLink;
};


async function popularSelectMesesAnos() {
    const select = document.getElementById('filtroData');

    // Obter todas as datas distintas das receitas e despesas
    const datas = []; // Array para armazenar todas as datas

    // Adicionar datas das receitas
    receitasSnapshot.forEach(doc => {
        const data = doc.data().data.toDate(); // Converter Timestamp para Date

        console.log(data)
        const mesAno = `${data.toLocaleString('en', { month: 'short' })}/${data.getFullYear()}`;
        if (!datas.includes(mesAno)) {
            datas.push(mesAno);
        }
    });

    // Adicionar datas das despesas
    despesasSnapshot.forEach(doc => {
        const data = doc.data().data.toDate(); // Converter Timestamp para Date
        const mesAno = `${data.toLocaleString('en', { month: 'short' })}/${data.getFullYear()}`;
        if (!datas.includes(mesAno)) {
            datas.push(mesAno);
        }
    });

    // Ordenar as datas
    datas.sort((a, b) => {
        return new Date(b) - new Date(a);
    });

    // Adicionar as datas ao select
    datas.forEach(data => {
        const option = document.createElement('option');
        option.value = data;
        option.textContent = data;
        select.appendChild(option);
    });
}
