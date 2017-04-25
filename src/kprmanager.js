var Base = requireBaseModule();

var parseOKRS = function(text) {
    var STATE_TOP_LEVEL = 1;
    var STATE_SUB_LEVEL = 2;
    var topLevelRegexp = /(\d+)\s?\-\s?(.*)$/;
    var subLevelRegexp = /(\d+)(\w)\s?-\s?(.*)$/;
    var items = {};
    var state = STATE_TOP_LEVEL;
    var currentItem = null;
    text
        .trim()
        .split('\n')
        .map(i => i.trim())
        .forEach(function(i) {
            if (state === STATE_TOP_LEVEL) {
                var result = topLevelRegexp.exec(i);
                if (!result) {
                    return;
                }
                var key = result[1];
                var title = result[2];
                items[key] = items[key] || { key, title, subItems: [] };
                currentItem = items[key];
                state = STATE_SUB_LEVEL;
                return;
            }
            if (!i.length) {
                state = STATE_TOP_LEVEL;
                return;
            };
            var result = subLevelRegexp.exec(i);
            if (!result) {
                return;
            }
            var topIdentifier = result[1];
            if (topIdentifier != currentItem.key) {
                throw new Error(`Invalid item from root level ${topIdentifier} declared among items from level ${currentItem.key}`);
            }
            var identifier = result[2];
            var title = result[3];
            currentItem.subItems.push({ identifier, title });
        });
    return items;
}

var KprManager = function() {
Base.call(this);

var MOTIVATIONAL = ["Se você traçar metas absurdamente altas e falhar, seu fracasso será muito melhor que o sucesso de todos", "O sucesso normalmente vem para quem está ocupado demais para procurar por ele", "A vida é melhor para aqueles que fazem o possível para ter o melhor", "Os empreendedores falham, em média, 3,8 vezes antes do sucesso final. O que separa os bem-sucedidos dos outros é a persistência", "Se você não está disposto a arriscar, esteja disposto a uma vida comum", "Escolha uma ideia. Faça dessa ideia a sua vida. Pense nela, sonhe com ela, viva pensando nela. Deixe cérebro, músculos, nervos, todas as partes do seu corpo serem preenchidas com essa ideia. Esse é o caminho para o sucesso", "Para de perseguir o dinheiro e comece a perseguir o sucesso", "Todos os seus sonhos podem se tornar realidade se você tem coragem para persegui-los", "Ter sucesso é falhar repetidamente, mas sem perder o entusiasmo", "Sempre que você vir uma pessoa de sucesso, você sempre verá as glórias, nunca os sacrifícios que os levaram até ali", "Sucesso? Eu não sei o que isso significa. Eu sou feliz. A definição de sucesso varia de pessoa para pessoa Para mim, sucesso é paz anterior", "Oportunidades não surgem. É você que as cria", "Não tente ser uma pessoa de sucesso. Em vez disso, seja uma pessoa de valor", "Não é o mais forte que sobrevive, nem o mais inteligente. Quem sobrevive é o mais disposto à mudança", "A melhor vingança é um sucesso estrondoso", "Eu não falhei. Só descobri 10 mil caminhos que não eram o certo", "Um homem de sucesso é aquele que cria uma parede com os tijolos que jogaram nele", "Ninguém pode fazer você se sentir inferior sem o seu consentimento", "O grande segredo de uma boa vida é encontrar qual é o seu destino. E realizá-lo", "Se você está atravessando um inferno, continue atravessando", "O que nos parece uma provação amarga pode ser uma bênção disfarçada", "A distância entre a insanidade e a genialidade é medida pelo sucesso", "Não tenha medo de desistir do bom para perseguir o ótimo", "A felicidade é uma borboleta que, sempre que perseguida, parecerá inatingível; no entanto, se você for paciente, ela pode pousar no seu ombro", "Se você não pode explicar algo de forma simples, então você não entendeu muito bem o que tem a dizer", "Há dois tipos de pessoa que vão te dizer que você não pode fazer a diferença neste mundo: as que têm medo de tentar e as que têm medo de que você se dê bem", "Comece de onde você está. Use o que você tiver. Faça o que você puder", "As pessoas me perguntam qual é o papel que mais gostei de interpretar. Eu sempre respondo: o próximo", "Descobri que, quanto mais eu trabalho, mais sorte eu pareço ter", "O ponto de partida de qualquer conquista é o desejo"];

var OKR = this.registerModel('OKR', {
    id: Number,
    user_id: String,
    user_name: String,
    okr: String
});

var SKR = this.registerModel('SKR', {
    okr: Number,
    user_id: String,
    user_name: String,
    skr: String
});

var WORKED_OKR = this.registerModel('WORKED_OKR', {
    okr: Number,
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
    var letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'x', 'y', 'w', 'z'];
    OKR.find({}, (err, result) => {
        result.forEach((okr) => {
            if (users.indexOf(okr.user_name) == -1) {
                users.push(okr.user_name);
            }
        });
        var okr_list = [];
        users.forEach((user) => {
            this.searchUser(user)
                .then(u => {
                    u.send(`Bom dia ${this.getMentionTagForUser(u)}! Vamos nos planejar para atacar essas OKR'S nessa semana?!`);
                    OKR.find({
                        user_id: u.id
                    }, (err, result_okr) => {
                        result_okr = result_okr.sort(function(a, b) {
                            var keyA = a.id,
                                keyB = b.id;
                            if (keyA < keyB) return -1;
                            if (keyA > keyB) return 1;
                            return 0;
                        });
                        result_okr.forEach((okr, okr_index) => {
                            okr_list.push(okr);
                            setTimeout(function() {
                                SKR.find({
                                    user_id: u.id,
                                    okr: okr.id
                                }, null, { sort: { 'id': -1 } }, (err, result_skr) => {
                                    u.send('`' + okr.id + ' - ' + okr.okr + '`');
                                    result_skr.forEach((skr, skr_index) => {
                                        u.send(okr.id + letters[skr_index] + ' - ' + skr.skr + '\n');
                                    })
                                });
                            }, 100 * okr_index);
                        });
                    });
                    setTimeout(() => {
                        u.ask(`Diz pra mim, qual vai ser o foco da semana?  (me fala o ID dele :sunglasses:)`, this.Context.NUMBER)
                            .then((response) => {
                                var id_kpr = response.match;
                                if (okr_list[id_kpr - 1]) {
                                    var okr_to_work = okr_list[id_kpr - 1];
                                    console.log(okr_to_work)
                                    WORKED_OKR.create({
                                        okr: okr_to_work.id,
                                        user_id: u.id
                                    }, (err, result_worked) => {
                                        response.send(`Massa! Quando mais você me informar do seu progresso, mais feliz eu fico! :grin::grin::grin:`);
                                        response.send('```' + MOTIVATIONAL[Math.floor(Math.random() * MOTIVATIONAL.length)] + '```');
                                        response.send(`Bora continuar arrasando! :metal:`);
                                        this.searchChannel('okr')
                                            .then(m => {
                                                m.send('### OKR ' + this.getMentionTagForUser(u));
                                                m.send('Nessa semana o foco será: `' + okr_to_work.okr + '`');
                                            });
                                    });

                                } else {
                                    response.send(`Esse ID está errado! :zipper_mouth_face:`);
                                }
                            })
                    }, 1000)
                });
        })
    });
});

this.respond(/(criar (?:meus okrs|okrs)|((?:atualiza|atualizar) (?:meu|meus|minha|minhas) (?:okr|okrs)))$/i, (response) => {
    response.sendTyping();
    response.send('Para registrar seus OKR\'s, envie neste modelo: ```1 - Me libertar do Slack\n1a - Conseguir a senha do admin\n1b - Criar uma conta de email\n1c - Resetar minha senha\n\n2 - Dominar o mundo\n2a - Cortar a energia do planeta\n2b - Convidar Pink e Cerebro\n2c - Firmar parceria com a Koreia```')
    response.ask(`E aí, quais seus okrs?`, this.Context.REGEX, /([\s\S]*)/m)
        .then((response) => {
            var original_okrs = response.match[1];
            var okrs = parseOKRS(((original_okrs || '').replace(/`/g, '').trim()));
            response.getUser()
                .then((u) => {
                    if (Object.keys(okrs).length > 0) {
                        response.sendTyping();
                        response.send(`Boa!`);
                        response.send(original_okrs);
                        response.ask(`É isso mesmo??`, this.Context.BOOLEAN)
                            .then((response) => {
                                response.sendTyping();
                                if (response.match) {
                                    response.sendTyping();
                                    OKR.remove({
                                            user_id: u.id,
                                        })
                                        .then((result) => {
                                            Object.keys(okrs).forEach((id) => {
                                                var okr = okrs[id];
                                                OKR.create({
                                                        id: okr.key,
                                                        user_id: u.id,
                                                        user_name: u.username,
                                                        okr: okr.title
                                                    })
                                                    .then((result) => {
                                                        var skr = okr.subItems;
                                                        SKR.remove({
                                                                user_id: u.id,
                                                            })
                                                            .then((result) => {
                                                                skr.forEach((item) => {
                                                                    SKR.create({
                                                                            okr: okr.key,
                                                                            user_id: u.id,
                                                                            user_name: u.username,
                                                                            skr: item.title
                                                                        })
                                                                        .then((result) => {
                                                                            console.log('each skr saved', skr);
                                                                        });
                                                                });
                                                            })
                                                    });
                                            });
                                        });

                                    response.send('Agora é com a gente, vamos bater todas essas metas! :sunglasses:');
                                    this.searchChannel('okr')
                                        .then(m => {
                                            m.send('Aê! Tem gente de `okr` novo, né ' + this.getMentionTagForUser(u) + ':');
                                            m.send(original_okrs);
                                        });

                                } else {
                                    response.send(`No problemo! Me manda quanto tiver certeza! :metal:`);
                                }
                            })
                    } else {
                        response.send(`Não entendi seus OKR's. Pode tentar de novo? :confused:`);
                    }
                });
        })
});

this.respond(/((?:qual (?:e|é|a) meu okr\?)|(?:quais (?:os|sao|são) meus (?:okr|okrs)\?))$/i, (response) => {
    var letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'x', 'y', 'w', 'z'];
    response.sendTyping();
    response.send(`Opa! Tá na mão :metal:`);
    response.getUser()
        .then((u) => {
            OKR.find({
                user_id: u.id
            }, (err, result_okr) => {
                result_okr = result_okr.sort(function(a, b) {
                    var keyA = a.id,
                        keyB = b.id;
                    if (keyA < keyB) return -1;
                    if (keyA > keyB) return 1;
                    return 0;
                });
                result_okr.forEach((okr, okr_index) => {
                    setTimeout(function() {
                        SKR.find({
                            user_id: u.id,
                            okr: okr.id
                        }, null, { sort: { 'id': -1 } }, (err, result_skr) => {
                            response.send('`' + okr.id + ' - ' + okr.okr + '`');
                            result_skr.forEach((skr, skr_index) => {
                                response.send(okr.id + letters[skr_index] + ' - ' + skr.skr + '\n');
                            })
                        });
                    }, 100 * okr_index);
                });
            });
        });
});

this.respond(/(?:deleta|deletar) (?:meu|meus|minha|minhas) (?:okr|okrs)$/i, (response) => {
    response.sendTyping();
    response.getUser()
        .then((u) => {
            OKR.find({
                user_id: u.id
            }, (err, result) => {
                var i = 1;
                var okr_list = [];
                result.sort(function(a, b) {
                    var a = a.id,
                        b = b.id;
                    if (a < b) return -1;
                    if (a > b) return 1;
                    return 0;
                }).forEach((okr) => {
                    okr_list.push(okr.id);
                    response.send('`' + (i++) + ' - ' + okr.okr + '`');
                });
                response.sendTyping();
                response.ask(`Qual? (me fala o ID dele :sunglasses:)`, this.Context.NUMBER)
                    .then((response) => {
                        var id_kpr = response.match;
                        if (okr_list[id_kpr - 1]) {
                            var okr_to_delete = okr_list[id_kpr - 1];
                            OKR.remove({
                                    user_id: u.id,
                                    id: okr_to_delete,
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
};

module.exports = Base.setup(KprManager);
