var Base = requireBaseModule();

var KPR_Manager = function() {
    Base.call(this);

    this.respond(/hi!$/i, (response) => {
        response.reply('Hello!');
    });
};

module.exports = Base.setup(KPR_Manager);
