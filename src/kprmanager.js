var Base = requireBaseModule();

var KprManager = function() {
    Base.call(this);

    var MOTIVATIONAL = ["Se você traçar metas absurdamente altas e falhar, seu fracasso será muito melhor que o sucesso de todos", "O sucesso normalmente vem para quem está ocupado demais para procurar por ele", "A vida é melhor para aqueles que fazem o possível para ter o melhor", "Os empreendedores falham, em média, 3,8 vezes antes do sucesso final. O que separa os bem-sucedidos dos outros é a persistência", "Se você não está disposto a arriscar, esteja disposto a uma vida comum", "Escolha uma ideia. Faça dessa ideia a sua vida. Pense nela, sonhe com ela, viva pensando nela. Deixe cérebro, músculos, nervos, todas as partes do seu corpo serem preenchidas com essa ideia. Esse é o caminho para o sucesso", "Para de perseguir o dinheiro e comece a perseguir o sucesso", "Todos os seus sonhos podem se tornar realidade se você tem coragem para persegui-los", "Ter sucesso é falhar repetidamente, mas sem perder o entusiasmo", "Sempre que você vir uma pessoa de sucesso, você sempre verá as glórias, nunca os sacrifícios que os levaram até ali", "Sucesso? Eu não sei o que isso significa. Eu sou feliz. A definição de sucesso varia de pessoa para pessoa Para mim, sucesso é paz anterior", "Oportunidades não surgem. É você que as cria", "Não tente ser uma pessoa de sucesso. Em vez disso, seja uma pessoa de valor", "Não é o mais forte que sobrevive, nem o mais inteligente. Quem sobrevive é o mais disposto à mudança", "A melhor vingança é um sucesso estrondoso", "Eu não falhei. Só descobri 10 mil caminhos que não eram o certo", "Um homem de sucesso é aquele que cria uma parede com os tijolos que jogaram nele", "Ninguém pode fazer você se sentir inferior sem o seu consentimento", "O grande segredo de uma boa vida é encontrar qual é o seu destino. E realizá-lo", "Se você está atravessando um inferno, continue atravessando", "O que nos parece uma provação amarga pode ser uma bênção disfarçada", "A distância entre a insanidade e a genialidade é medida pelo sucesso", "Não tenha medo de desistir do bom para perseguir o ótimo", "A felicidade é uma borboleta que, sempre que perseguida, parecerá inatingível; no entanto, se você for paciente, ela pode pousar no seu ombro", "Se você não pode explicar algo de forma simples, então você não entendeu muito bem o que tem a dizer", "Há dois tipos de pessoa que vão te dizer que você não pode fazer a diferença neste mundo: as que têm medo de tentar e as que têm medo de que você se dê bem", "Comece de onde você está. Use o que você tiver. Faça o que você puder", "As pessoas me perguntam qual é o papel que mais gostei de interpretar. Eu sempre respondo: o próximo", "Descobri que, quanto mais eu trabalho, mais sorte eu pareço ter", "O ponto de partida de qualquer conquista é o desejo"];

    var KPR = this.registerModel('KPR', {
        id: Number,
        user_id: String,
        user_name: String,
        kpr: String,
        skpr: String
    });

    var WORKED_KPR = this.registerModel('WORKED_KPR', {
        kpr: String,
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
                        u.send(`Bom dia ${this.getMentionTagForUser(u)}! Vamos nos planejar para atacar essas OKR'S nessa semana?!`);
                        KPR.find({
                            user_name: user
                        }, (err, result) => {
                            var i = 1;
                            var kpr_list = [];
                            result.sort(function(a, b) {
                                var a = a.id,
                                    b = b.id;
                                if (a < b) return -1;
                                if (a > b) return 1;
                                return 0;
                            }).forEach((kpr) => {
                                kpr_list.push(kpr.kpr);
                                u.send(i++ + ' - ' + '`' + kpr.kpr + '` ```' + kpr.skpr + '```');
                            });
                            setTimeout(() => {
                                u.ask(`Diz pra mim, qual vai ser o foco da semana?  (me fala o ID dele :sunglasses:)`, this.Context.NUMBER)
                                    .then((response) => {
                                        var id_kpr = response.match;
                                        if (kpr_list[id_kpr - 1]) {
                                            var kpr_to_work = kpr_list[id_kpr - 1];
                                            console.log(kpr_to_work)
                                            WORKED_KPR.create({
                                                kpr: kpr_to_work,
                                                user_id: u.id
                                            }, (err, result_worked) => {
                                                response.send(`Massa! Quando mais você me informar do seu progresso, mais feliz eu fico! :grin::grin::grin:`);
                                                response.send('```' + MOTIVATIONAL[Math.floor(Math.random() * MOTIVATIONAL.length)] + '```');
                                                response.send(`Bora continuar arrasando! :metal:`);
                                                this.searchChannel('okr')
                                                    .then(m => {
                                                        m.send('### OKR ' + this.getMentionTagForUser(u));
                                                        m.send('```' + kpr_list.join('\n') + '```')
                                                        m.send('Nessa semana o foco será: `' + kpr_to_work + '`');
                                                    });
                                            });

                                        } else {
                                            response.send(`Esse ID está errado! :zipper_mouth_face:`);
                                        }
                                    })
                            })
                        });
                    })
            });
        });
    });

    this.scheduleTask({
        // minute: '*',
        // hour: '*',
        // monthDay: '*',
        // month: '*',
        // dayOfWeek: '*'

        minute: '0',
        hour: '17',
        monthDay: '*',
        month: '*',
        dayOfWeek: '6'
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
                        u.send(`E ai ${this.getMentionTagForUser(u)}, como foi a semana? Em quais metas você trabalhou?`);
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

    this.respond(/criar (?:meus okrs|okrs)$/i, (response) => {
        response.sendTyping();
        response.send('Para registrar seus OKR\'s, envie neste modelo: ```Me libertar do Slack```')
        response.ask(`E aí, qual seu okr?`, this.Context.REGEX, /([\s\S]*)/m)
            .then((response) => {
                var user = null;
                response.getUser()
                    .then((u) => {
                        user = u;
                    });
                var kprs = (response.match[1] || '').replace(/`/g, '').trim();
                response.ask('E quais os key results desse okr? Mande neste modelo ```Conseguir a senha do admin\nTrocar a senha do admin\nAlterar meu código```', this.Context.REGEX, /([\s\S]*)/m)
                    .then((response) => {
                        var krs = (response.match[1] || '').replace(/`/g, '').trim();
                        if (kprs.length && krs.length) {
                            response.sendTyping();
                            response.send(`Boa!`);
                            response.send('Okr: \n `' + kprs + '` \n Key results: ```' + krs + '```');
                            response.ask(`É isso mesmo??`, this.Context.BOOLEAN)
                                .then((response) => {
                                    response.sendTyping();
                                    if (response.match) {
                                        response.sendTyping();
                                        response.send(`Agora é com a gente, vamos bater todas essas metas! :sunglasses:`);
                                        kprs.split('\n').forEach((kpr, index) => {
                                            KPR.create({
                                                    id: index + 1,
                                                    user_id: user.id,
                                                    user_name: user.username,
                                                    kpr: kpr,
                                                    skpr: krs,
                                                })
                                                .then((result) => {
                                                    // console.log(result);
                                                });
                                            response.send('`' + kpr + '` ```' + krs + '```');
                                        })
                                        this.searchChannel('okr')
                                            .then(m => {
                                                m.send('Aê! Tem gente de `okr` novo, né ' + this.getMentionTagForUser(user) + ':');
                                                m.send('```' + kprs + '```');
                                            });
                                    } else {
                                        response.send(`No problemo! Me manda quanto tiver certeza! :metal:`);
                                    }
                                })
                        } else {
                            response.send(`Não entendi seus OKR's. Pode tentar de novo? :confused:`);
                        }
                    })
            })
    });

    this.respond(/((?:qual (?:e|é|a) meu okr\?)|(?:quais (?:os|sao|são) meus (?:okr|okrs)\?))$/i, (response) => {
        response.sendTyping();
        response.send(`Opa! Tá na mão :metal:`);
        response.getUser()
            .then((u) => {
                KPR.find({
                    user_id: u.id
                }, (err, result) => {
                    var i = 1;
                    result.forEach((kpr) => {
                        response.send('`' + kpr.kpr + '` ```' + kpr.skpr + '```');
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
                    var i = 1;
                    var kpr_list = [];
                    result.sort(function(a, b) {
                        var a = a.id,
                            b = b.id;
                        if (a < b) return -1;
                        if (a > b) return 1;
                        return 0;
                    }).forEach((kpr) => {
                        kpr_list.push(kpr.kpr);
                        response.send(i++ + ' - ' + '`' + kpr.kpr + '`');
                    });
                    response.sendTyping();
                    response.ask(`Qual? (me fala o ID dele :sunglasses:)`, this.Context.NUMBER)
                        .then((response) => {
                            var id_kpr = response.match;
                            if (kpr_list[id_kpr - 1]) {
                                var kpr_to_update = kpr_list[id_kpr - 1];
                                response.sendTyping();
                                response.ask('E qual vai ser o novo kpr? Envie neste modelo: ```Me libertar do Slack```', this.Context.REGEX, /([\s\S]*)/m)
                                    .then((response) => {
                                        var krs = (response.match[1] || '').replace(/`/g, '').trim();
                                        response.sendTyping();
                                        response.ask('E quais os key results desse okr? Mande neste modelo ```Conseguir a senha do admin\nTrocar a senha do admin\nAlterar meu código```', this.Context.REGEX, /([\s\S]*)/m)
                                            .then((response) => {
                                                if (krs.length) {
                                                    KPR.update({
                                                            user_id: u.id,
                                                            kpr: kpr_to_update
                                                        }, {
                                                            skpr: krs
                                                        }, {
                                                            upsert: true
                                                        })
                                                        .then((result) => {
                                                            response.send(`Maravilha! :facepunch: Não esquece dele!`);
                                                        });
                                                } else {
                                                    response.send(`Preciso saber os key results! :zipper_mouth_face:`);
                                                }

                                            });
                                    })
                            } else {
                                response.send(`Esse ID está errado! :zipper_mouth_face:`);
                            }
                        })
                });
            });
    });

    this.respond(/(?:deleta|deletar) (?:meu|meus|minha|minhas) (?:okr|okrs)$/i, (response) => {
        response.sendTyping();
        response.getUser()
            .then((u) => {
                KPR.find({
                    user_id: u.id
                }, (err, result) => {
                    var i = 1;
                    var kpr_list = [];
                    result.sort(function(a, b) {
                        var a = a.id,
                            b = b.id;
                        if (a < b) return -1;
                        if (a > b) return 1;
                        return 0;
                    }).forEach((kpr) => {
                        kpr_list.push(kpr.kpr);
                        response.send(i++ + ' - ' + '`' + kpr.kpr + '`');
                    });
                    response.sendTyping();
                    response.ask(`Qual? (me fala o ID dele :sunglasses:)`, this.Context.NUMBER)
                        .then((response) => {
                            var id_kpr = response.match;
                            if (kpr_list[id_kpr - 1]) {
                                var kpr_to_delete = kpr_list[id_kpr - 1];
                                KPR.remove({
                                        user_id: u.id,
                                        kpr: kpr_to_delete,
                                    })
                                    .then((result) => {
                                        response.send(`Removido :eyes:`);
                                    });
                            } else {
                                response.send(`Esse ID está errado! :zipper_mouth_face:`);
                            }
                        })
                });
            });
    });

    // this.respond(/(?:essa|esta) semana trabalhei na (?:okr|meta) (.+)$/i, (response) => {
    //     var kpr = response.match[1];
    //     response.sendTyping();
    //     response.getUser()
    //         .then((u) => {
    //             KPR.findOne({
    //                 user_id: u.id,
    //                 kpr: kpr
    //             }, (err, result) => {
    //                 if (result) {
    //                     WORKED_KPR.create({
    //                         kpr: kpr,
    //                         user_id: u.id
    //                     }, (err, result_worked) => {
    //                         response.send(`Massa! Quando mais você me informar do seu progresso, mais feliz eu fico! :grin::grin::grin:`);
    //                         response.send('```' + MOTIVATIONAL[Math.floor(Math.random() * MOTIVATIONAL.length)] + '```');
    //                         response.send(`Bora continuar arrasando! :metal:`);
    //                         this.searchChannel('okr')
    //                             .then(m => {
    //                                 m.send('Aê! ' + this.getMentionTagForUser(u) + ' arrasou e evoluiu no okr `' + result.kpr + '` essa semana :metal:');
    //                             });
    //                     });
    //                 } else {
    //                     response.send(`Não conheco essa OKR! :zipper_mouth_face:`);
    //                 }
    //             });
    //         });
    // })
};

module.exports = Base.setup(KprManager);
