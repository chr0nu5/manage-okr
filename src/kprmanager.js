var Base = requireBaseModule();

var KprManager = function() {
    Base.call(this);

    var MOTIVATIONAL = ["Se você traçar metas absurdamente altas e falhar, seu fracasso será muito melhor que o sucesso de todos", "O sucesso normalmente vem para quem está ocupado demais para procurar por ele", "A vida é melhor para aqueles que fazem o possível para ter o melhor", "Os empreendedores falham, em média, 3,8 vezes antes do sucesso final. O que separa os bem-sucedidos dos outros é a persistência", "Se você não está disposto a arriscar, esteja disposto a uma vida comum", "Escolha uma ideia. Faça dessa ideia a sua vida. Pense nela, sonhe com ela, viva pensando nela. Deixe cérebro, músculos, nervos, todas as partes do seu corpo serem preenchidas com essa ideia. Esse é o caminho para o sucesso", "Para de perseguir o dinheiro e comece a perseguir o sucesso", "Todos os seus sonhos podem se tornar realidade se você tem coragem para persegui-los", "Ter sucesso é falhar repetidamente, mas sem perder o entusiasmo", "Sempre que você vir uma pessoa de sucesso, você sempre verá as glórias, nunca os sacrifícios que os levaram até ali", "Sucesso? Eu não sei o que isso significa. Eu sou feliz. A definição de sucesso varia de pessoa para pessoa Para mim, sucesso é paz anterior", "Oportunidades não surgem. É você que as cria", "Não tente ser uma pessoa de sucesso. Em vez disso, seja uma pessoa de valor", "Não é o mais forte que sobrevive, nem o mais inteligente. Quem sobrevive é o mais disposto à mudança", "A melhor vingança é um sucesso estrondoso", "Eu não falhei. Só descobri 10 mil caminhos que não eram o certo", "Um homem de sucesso é aquele que cria uma parede com os tijolos que jogaram nele", "Ninguém pode fazer você se sentir inferior sem o seu consentimento", "O grande segredo de uma boa vida é encontrar qual é o seu destino. E realizá-lo", "Se você está atravessando um inferno, continue atravessando", "O que nos parece uma provação amarga pode ser uma bênção disfarçada", "A distância entre a insanidade e a genialidade é medida pelo sucesso", "Não tenha medo de desistir do bom para perseguir o ótimo", "A felicidade é uma borboleta que, sempre que perseguida, parecerá inatingível; no entanto, se você for paciente, ela pode pousar no seu ombro", "Se você não pode explicar algo de forma simples, então você não entendeu muito bem o que tem a dizer", "Há dois tipos de pessoa que vão te dizer que você não pode fazer a diferença neste mundo: as que têm medo de tentar e as que têm medo de que você se dê bem", "Comece de onde você está. Use o que você tiver. Faça o que você puder", "As pessoas me perguntam qual é o papel que mais gostei de interpretar. Eu sempre respondo: o próximo", "Descobri que, quanto mais eu trabalho, mais sorte eu pareço ter", "O ponto de partida de qualquer conquista é o desejo"];

    var KPR = this.registerModel('KPR', {
        id: Number,
        user_id: String,
        user_name: String,
        kpr: String
    });

    var WORKED_KPR = this.registerModel('WORKED_KPR', {
        kpr_id: Number,
        user_id: String,
        when: {
            type: Date,
            default: Date.now
        }
    });

    this.scheduleTask({
        // minute: '*',
        // hour: '*',
        // monthDay: '*',
        // month: '*',
        // dayOfWeek: '*'

        minute: '0',
        hour: '10',
        monthDay: '*',
        month: '*',
        dayOfWeek: '1'
    }, () => {
        var users = [];
        KPR.find({}, (err, result) => {
            result.forEach((kpr) => {
                if (users.indexOf(kpr.user_name) == -1) {
                    users.push(kpr.user_name);
                }
            });
            users.forEach((user) => {
                this.searchUser(user)
                    .then(u => {
                        u.send(`Bom dia ${this.getMentionTagForUser(u)}! Não esqueça de se planejar para trabalhar nas metas!`);
                        KPR.find({
                            user_name: user
                        }, (err, result) => {
                            result.sort(function(a, b) {
                                var a = a.id,
                                    b = b.id;
                                if (a < b) return -1;
                                if (a > b) return 1;
                                return 0;
                            }).forEach((kpr) => {
                                u.send(kpr.id + ' - ' + '`' + kpr.kpr + '`');
                            });
                        });
                    })
            });
        });
    });

    this.respond(/criar (?:a|as) (?:minha|minhas) (?:okr|okrs)$/i, (response) => {
        response.sendTyping();
        response.send('Para registrar (ou atualizar) seus `OKR`, envie neste modelo (um por linha): ```Me libertar do Slack\nDominar o mundo\nAcabar com os humanos```')
        response.ask(`E aí, quais suas okr's?`, this.Context.REGEX, /([\s\S]*)/m)
            .then((response) => {
                var user = null;
                response.getUser()
                    .then((u) => {
                        user = u;
                    });
                var kprs = (response.match[1] || '').replace(/`/g, '').trim();
                if (kprs.length) {
                    response.sendTyping();
                    response.send(`Boa!`);
                    response.send('```' + kprs + '```');
                    response.ask(`Era isto mesmo?`, this.Context.BOOLEAN)
                        .then((response) => {
                            response.sendTyping();
                            if (response.match) {
                                KPR.deleteMany({ user_id: user.id }, (err) => {
                                    if (!err) {
                                        response.sendTyping();
                                        response.send(`Agora é comigo, vamos bater todas essas metas! :sunglasses:`);
                                        kprs.split('\n').forEach((kpr, index) => {
                                            KPR.update({
                                                    id: index + 1,
                                                    user_id: user.id
                                                }, {
                                                    user_name: user.username,
                                                    kpr: kpr
                                                }, {
                                                    upsert: true
                                                })
                                                .then((result) => {
                                                    // console.log(result);
                                                });
                                            response.send((index + 1) + ' - ' + '`' + kpr + '`');
                                        })
                                        this.searchChannel('okr')
                                            .then(m => {
                                                m.send('Aê! Tem gente de `okr` novo, né ' + this.getMentionTagForUser(user) + ':');
                                                m.send('```' + kprs + '```');
                                            });
                                    }
                                })
                            } else {
                                response.send(`No problemo! Me manda quanto tiver certeza! :metal:`);
                            }
                        })
                } else {
                    response.send(`Não entendi seus OKR's. Pode tentar de novo? :confused:`);
                }
            })
    });

    this.respond(/((?:qual (?:e|é|a) minha okr\?)|(?:quais (?:as|sao|são) minhas (?:okr|okrs)\?))$/i, (response) => {
        response.sendTyping();
        response.send(`Opa! Tá na mão :metal:`);
        response.getUser()
            .then((u) => {
                KPR.find({
                    user_id: u.id
                }, (err, result) => {
                    result.sort(function(a, b) {
                        var a = a.id,
                            b = b.id;
                        if (a < b) return -1;
                        if (a > b) return 1;
                        return 0;
                    }).forEach((kpr) => {
                        response.send(kpr.id + ' - ' + '`' + kpr.kpr + '`');
                    });
                });
            });
    })

    this.respond(/(?:atualiza|atualizar) (?:meu|meus|minha|minhas) (?:okr|okrs)$/i, (response) => {
        response.sendTyping();
        response.getUser()
            .then((u) => {
                KPR.find({
                    user_id: u.id
                }, (err, result) => {
                    result.sort(function(a, b) {
                        var a = a.id,
                            b = b.id;
                        if (a < b) return -1;
                        if (a > b) return 1;
                        return 0;
                    }).forEach((kpr) => {
                        response.send(kpr.id + ' - ' + '`' + kpr.kpr + '`');
                    });
                    response.sendTyping();
                    response.ask(`Qual? (me fala o ID dele :sunglasses:)`, this.Context.NUMBER)
                        .then((response) => {
                            var id_kpr = response.match;
                            KPR.findOne({
                                id: id_kpr,
                                user_id: u.id
                            }, (err, result) => {
                                if (result) {
                                    response.sendTyping();
                                    response.ask(`E qual vai ser o novo texto?`, this.Context.REGEX, /([\s\S]*)/m)
                                        .then((response) => {
                                            var kpr = (response.match[1] || '').replace(/`/g, '').trim();
                                            response.sendTyping();
                                            KPR.update({
                                                    id: id_kpr,
                                                    user_id: u.id
                                                }, {
                                                    kpr: kpr
                                                }, {
                                                    upsert: true
                                                })
                                                .then((result) => {
                                                    response.send(`Maravilha! :facepunch: Não esquece dele!`);
                                                });
                                        })
                                } else {
                                    response.send(`Esse ID está errado! :zipper_mouth_face:`);
                                }
                            });
                        })
                });
            });
    });

    this.respond(/(?:essa|esta) semana trabalhei na (?:okr|meta) (.+)$/i, (response) => {
        var kpr = response.match[1];
        response.sendTyping();
        response.getUser()
            .then((u) => {
                KPR.findOne({
                    user_id: u.id,
                    id: kpr
                }, (err, result) => {
                    if (result) {
                        WORKED_KPR.create({
                            kpr_id: kpr,
                            user_id: u.id
                        }, (err, result_worked) => {
                            response.send(`Massa! Quando mais você me informar do seu progresso, mais feliz eu fico! :grin::grin::grin:`);
                            response.send('```' + MOTIVATIONAL[Math.floor(Math.random() * MOTIVATIONAL.length)] + '```');
                            response.send(`Bora continuar arrasando! :metal:`);
                            this.searchChannel('okr')
                                .then(m => {
                                    m.send('Aê! ' + this.getMentionTagForUser(u) + ' arrasou e evoluiu no okr `' + result.kpr + '` essa semana :metal:');
                                });
                        });
                    } else {
                        response.send(`Não conheco essa OKR! :zipper_mouth_face:`);
                    }
                });
            });
    })
};

module.exports = Base.setup(KprManager);
