// Função para gerar o calendarior
function generateCalendar() {
    const calendar = document.getElementById('calendar');

    const currentDate = new Date();
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const firstDayOfWeek = firstDayOfMonth.getDay();
    const totalDays = lastDayOfMonth.getDate();

    for (let i = 0; i < firstDayOfWeek; i++) {
        let blankDay = document.createElement('div');
        calendar.appendChild(blankDay);
    }

    for (let day = 1; day <= totalDays; day++) {
        let daySquare = document.createElement("div");
        daySquare.className = "calendar-day";
        daySquare.textContent = day;
        daySquare.id = `day-${day}`;

        // Recuperar tarefas para o dia atual
        db.collection("tarefas")
            .where("date", "==", new Date(year, month, day))
            .get()
            .then(querySnapshot => {
                querySnapshot.forEach(doc => {
                    const task = doc.data();
                    const taskElement = document.createElement("div");
                    taskElement.className = "task";
                    taskElement.textContent = task.description;
                    daySquare.appendChild(taskElement);
                });
            })
            .catch(error => {
                console.error("Error getting tasks: ", error);
            });

        calendar.appendChild(daySquare);
    }
}

// Função para mostrar o modal de adição de tarefa
function showAddTaskModal() {
    const taskDateInput = document.getElementById('task-date');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const currentDay = currentDate.getDate();
    taskDateInput.value = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${currentDay.toString().padStart(2, '0')}`;

    document.getElementById('addTaskModal').style.display = 'block';
}

function closeAddTaskModal() {
    document.getElementById('addTaskModal').style.display = 'none';
}



// função para editar a task
function editTask(taskElement) {
    // Solicitar que o usuário edite a descrição da tarefa, com a descrição atual como padrão
    const newTaskDesc = prompt("Edit your task:", taskElement.textContent);
    // Verifique se o usuário inseriu uma nova descrição de tarefa e ela não está vazia
    if (newTaskDesc !== null & newTaskDesc.trim() !== "") {
        //         Atualizar o conteúdo de texto do elemento de tarefa com a nova descrição
        taskElement.textContent = newTaskDesc;

        // Obter a ID da tarefa do atributo data-task-id do elemento de tarefa
        const taskId = taskElement.getAttribute("data-task-id");

        // Atualizar a descrição da tarefa no Firebase
        db.collection("tarefas").doc(taskId).update({
            description: newTaskDesc
        }).then(function() {
            console.log("Task description updated successfully");
        }).catch(function(error) {
            console.error("Error updating task description: ", error);
        });
    }
}


// firebase configuração
const firebaseConfig = {
    apiKey: "AIzaSyAOKMaUyd3fAOtgZKXasEEAq18AvD8fYIg",
    authDomain: "calendario-diabetico-16301.firebaseapp.com",
    databaseURL: "https://calendario-diabetico-16301-default-rtdb.firebaseio.com",
    projectId: "calendario-diabetico-16301",
    storageBucket: "calendario-diabetico-16301.appspot.com",
    messagingSenderId: "658636242534",
    appId: "1:658636242534:web:16f4806650b6633f4a37a7",
    measurementId: "G-5HC5LBR8XD"
};

// Inicializar o Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

db.collection("tarefas").onSnapshot(function(snapshot) {

    snapshot.docChanges().forEach(function(changes) {
        if (changes.type === "added") {
            const documento = changes.doc;
            const dados = documento.data();
            const id = documento.id;
            
            criarItensTabela(dados);
        } else if (changes.type === "modified") {
            // Implementar se necessário
        } else if (changes.type === "removed") {
            // Implementar se necessário
        }
    });
});

db.collection("tarefas").onSnapshot(function(snapshot) {
    snapshot.docChanges().forEach(function(changes) {
        if (changes.type === "added") {
            const documento = changes.doc;
            const dados = documento.data();
            const id = documento.id;

            criarItensTabela(dados);
        } else if (changes.type === "modified") {
            // Implementar se necessário
        } else if (changes.type === "removed") {
            // Implementar se necessário
        }
    });
});

// Função para adicionar uma tarefa
function addTask() {
    // Obter a data da tarefa e a descrição dos campos de entrada
    const taskDateInput = document.getElementById('task-date').value;
    const taskDesc = document.getElementById('task-desc').value.trim();

    // Verificar se a descrição da tarefa não está vazia
    if (taskDesc === "") {
        alert("Por favor, insira uma descrição para a tarefa.");
        return;
    }

    // Dividir a entrada em ano, mês e dia
    const [year, month, day] = taskDateInput.split('-');

    // Criar um novo objeto Date usando a data UTC
    const taskDate = new Date(Date.UTC(year, month - 1, day, 12));

    // Adicionar a tarefa ao Firebase
    db.collection("tarefas").add({
        date: taskDate,
        description: taskDesc
    }).then(function(docRef) {
        console.log("Tarefa adicionada com ID: ", docRef.id);

        // Adicionar a tarefa ao calendário
        criarItensTabela({ date: taskDate, description: taskDesc });
    }).catch(function(error) {
        console.error("Erro ao adicionar tarefa: ", error);
    });

    // Limpar o campo de descrição da tarefa
    document.getElementById('task-desc').value = '';

    // Fechar o modal de adição de tarefa
    closeAddTaskModal();
}
// função para cria tabela
function criarItensTabela(dados) {
    // Obter o dia da tarefa do objeto de dados
    const taskDay = dados.date.getUTCDate();

    // Criar um novo elemento para a tarefa
    const taskElement = document.createElement("div");
    taskElement.className = "task";
    taskElement.textContent = dados.description;
    taskElement.setAttribute("data-task-id", dados.id); // Add data-task-id attribute

    // Adicionar o event listener para o contextmenu
    taskElement.addEventListener("contextmenu", function(event) {
        //Impedir que o menu de contexto padrão apareça
        event.preventDefault();

        // remove tarefa do  Firebase
        const taskId = taskElement.getAttribute("data-task-id");
        db.collection("tarefas").doc(taskId).delete().then(function() {
            console.log("Task deleted successfully");

            // Remove elemento da tarefa do calendario
            taskElement.remove();
        }).catch(function(error) {
            console.error("Error deleting task: ", error);
        });
    });

    // Adicionar o event listener para o clique
    taskElement.addEventListener("click", function() {
        editTask(taskElement);
    });

    // Adicionar o elemento da tarefa ao dia correspondente no calendário
    const dayElement = document.getElementById(`day-${taskDay}`);
    if (dayElement) {
        dayElement.appendChild(taskElement);
    } else {
        console.error("Erro: o elemento do dia não foi encontrado.");
    }
}


window.onload = function () {
    generateCalendar();

    // Adiciona o evento de clique ao botão após a geração do calendário
    document.querySelector(".add-task-btn").addEventListener("click", addTask);
};

