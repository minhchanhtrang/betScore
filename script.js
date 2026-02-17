let allCharacters = [
    { name: "Như Ý Lý", avatar: "NYL.jpg" },
    { name: "Minh Thư", avatar: "MThu.jpg" },
    { name: "Minh Chánh", avatar: "MC.jpg" },
    { name: "Minh Trí", avatar: "MTri.jpg" },
    { name: "Kiệt Huỳnh", avatar: "KH.jpg" },
    { name: "Nguyên Lý", avatar: "VN.jpg" }
];

let selectedCharacters = [];
let players = [];
let bankerIndex = 0;
let betAmount = 10;
let debts = {};   // ma trận nợ

window.onload = function(){
    renderCharacterList();
};

function renderCharacterList(){
    let container = document.getElementById("characterList");
    container.innerHTML = "";

    allCharacters.forEach(character =>{

        let div = document.createElement("div");
        div.className = "character";

        div.innerHTML = `
            <img src="${character.avatar}" class="avatar">
            <h3>${character.name}</h3>
        `;

        div.onclick = function(){
            toggleCharacter(character, div);
        };

        container.appendChild(div);
    });
}

function toggleCharacter(character, element){

    if(selectedCharacters.includes(character)){
        selectedCharacters = selectedCharacters.filter(c => c !== character);
        element.classList.remove("selected");
    }else{

        if(selectedCharacters.length >= 6){
            alert("Tối đa 6 người");
            return;
        }

        selectedCharacters.push(character);
        element.classList.add("selected");
    }
}

function startGame(){

    if(selectedCharacters.length < 2){
        alert("Cần ít nhất 2 người chơi");
        return;
    }

    betAmount = parseInt(document.getElementById("bet").value);
    if(!betAmount){
        alert("Nhập tiền cược");
        return;
    }

    players = selectedCharacters.map(c => c.name);

    debts = {};
    players.forEach(p => debts[p] = {});

    bankerIndex = 0;

    document.getElementById("setup").classList.add("hidden");
    document.getElementById("game").classList.remove("hidden");

    renderPlayers();
}

function renderPlayers(){

    let container = document.getElementById("playersContainer");
    container.innerHTML = "";

    let banker = players[bankerIndex];

    players.forEach((player, index)=>{

        let character = allCharacters.find(c => c.name === player);

        let div = document.createElement("div");
        div.className = "player";

        if(index === bankerIndex){
            div.classList.add("banker");
        }

        div.innerHTML = `
            <img src="${character.avatar}" class="avatar">
            <h3>${player}</h3>
            ${index !== bankerIndex ? `
                <button onclick="handleResult(${index}, -1)">Thua</button>
                <button onclick="handleResult(${index}, 1)">Thắng</button>
                <button onclick="handleResult(${index}, 2)">x2</button>
                <button onclick="handleResult(${index}, 3)">x3</button>
            ` : `<b>LÀM CÁI</b>`}
        `;

        container.appendChild(div);
    });

    document.getElementById("bankerTitle").innerText =
        "Người làm cái: " + banker;
}

function handleResult(index, multiplier){

    let banker = players[bankerIndex];
    let player = players[index];

    let amount = betAmount * Math.abs(multiplier);

    if(multiplier > 0){
        updateDebt(banker, player, -amount);
    } else {
        updateDebt(banker, player, amount);
    }

    // Hiệu ứng nháy xanh
    let playerCards = document.querySelectorAll(".player");
    let card = playerCards[index];

    card.classList.add("flash");

    setTimeout(() => {
        card.classList.remove("flash");
    }, 500);
}

function updateDebt(banker, player, amount){

    debts[banker][player] = (debts[banker][player] || 0) + amount;
    debts[player][banker] = (debts[player][banker] || 0) - amount;
}

function changeBanker(){
    bankerIndex = (bankerIndex + 1) % players.length;
    renderPlayers();
}

function endGame(){

    let resultHTML = `<h2>CHỐT SỔ NÈ !</h2>`;
    resultHTML += `<div class="result-grid">`;

    let hasAnyData = false;

    players.forEach(player => {

        let thuaHTML = "";
        let thangHTML = "";

        for(let opponent in debts[player]){

            let amount = debts[player][opponent];

            if(amount < 0){
                thuaHTML += `${opponent} ${Math.abs(amount)} ngàn<br>`;
            }

            if(amount > 0){
                thangHTML += `${opponent} ${amount} ngàn<br>`;
            }
        }

        // Nếu không có thua và không có thắng → bỏ qua người này
        if(!thuaHTML && !thangHTML) return;

        hasAnyData = true;

        resultHTML += `
            <div class="result-card">
                <h3>${player}</h3>
                ${thuaHTML ? `<p><b>- Thua:</b><br>${thuaHTML}</p>` : ""}
                ${thangHTML ? `<p><b>- Thắng:</b><br>${thangHTML}</p>` : ""}
            </div>
        `;
    });

    resultHTML += `</div>`;
    resultHTML += `
    <button onclick="restartGame()" class="restart-btn">
        🔄 Chơi lại
    </button>
`;


    if(!hasAnyData){
        resultHTML += "<p>Không ai nợ ai</p>";
    }

    document.getElementById("result").innerHTML = resultHTML;
}

function restartGame(){

    // Reset dữ liệu
    selectedCharacters = [];
    players = [];
    debts = {};
    bankerIndex = 0;

    // Hiện lại màn setup
    document.getElementById("game").classList.add("hidden");
    document.getElementById("setup").classList.remove("hidden");
    document.getElementById("result").innerHTML = "";

    // Render lại danh sách nhân vật
    renderCharacterList();
}
