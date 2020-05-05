const axios = require("axios");
const TotalVoice = require("totalvoice-node");
const client = new TotalVoice("2550b3b78ad8e7946fcbcf4531a03c06");

const boss = {
    name: "Alison",
    telephone: "+5511951366628"
};

const servers = [
    {
        name: "Servidor 1",
        url: "http://localhost:4001",
        developer:{
            name: "Lucas Bercê",
            telephone: "+5511952941306"
        }
    },
    {
        name: "Servidor 2",
        url: "http://localhost:4002",
        developer:{
            name: "Lucas Bercê",
            telephone: "+5511952941306"
        }
    }
];

const notifications = [];

(async function(){
    console.log("Iniciando monitoramento dos servidores");
    for(const server of servers){
        await axios({
            url: server.url,
            method: "get"
        }).then((response)=>{
            console.log(`${server.name} está no ar`);
        }).catch(()=>{
            console.log(`${server.name} está fora do ar!`);
            const message = `${server.developer.name} o ${server.name} está fora do ar, por favor faça alguma coisa o mais rapido possível. Digite um se você vai conseguir fazer algo para resolver esse problema agora, ou digite dois se você não consegue fazer nada no momento que irei encaminhar o chamado para outro desenvolvedor da equipe!`;
            const options = {
                velocidade: 2,
                tipo_voz: "br-Ricardo",
                resposta_usuario: true
            };
            client.tts.enviar(server.developer.telephone, message, options).then((response)=>{
                console.log(`o desenvolvedor ${server.developer.name} já foi avisado`);
                console.log(response);
                notifications.push({
                    id: response.dados.id,
                    server,
                    status: "pending"
                });
            });
        });
    }
    console.log("Finalizando monitoramento dos servidores");
})();

setInterval(function(){
    for(const notification of notifications){
        if(notification.status === "pending"){
            client.tts.buscar(notification.id).then(function(response){
                if(response.dados.resposta === "1"){
                    console.log(`O desenvolvedor ${notification.server.developer.name} já foi avisado e vai fazer alguma coisa`);
                    const message = `O ${notification.server.name} está fora do ar. O desenvolvedor ${notification.server.developer.name} já foi avisado e vai fazer alguma coisa para solucionar o problema!`;
                    const options = {
                        velocidade: 2,
                        tipo_voz: "br-Ricardo"
                    };
                    client.tts.enviar(boss.telephone, message, options)
                    notification.status = "success";
                }
                if(response.dados.resposta === "2"){
                    console.log(`O desenvolvedor ${notification.server.developer.name} já foi avisado e não consegue fazer nada no momento`);
                    const message = `O ${notification.server.name} está fora do ar. O desenvolvedor ${notification.server.developer.name} já foi avisado porém não pode fazer nada no momento e encaminhou o chamado para você!`;
                    const options = {
                        velocidade: 2,
                        tipo_voz: "br-Vitoria"
                    };
                    client.tts.enviar(boss.telephone, message, options)
                    notification.status = "success";
                }
                if(!response.dados.resposta){

                }
            });
        }
    }
}, 5000);