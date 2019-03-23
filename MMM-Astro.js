/* Magic Mirror
 * Module: MMM-Astro
 *
 * By cowboysdude
 *
 */
Module.register('MMM-Astro', {

    // Module config defaults.
    defaults: {
        updateInterval: 60 * 60 * 1000, // every 10 minutes
        animationSpeed: 10,
        initialLoadDelay: 875, // 0 seconds delay
        retryDelay: 1500,
        sign: '',
        maxWidth: '90%',
        fadeSpeed: 7,
        iconset: '1',
        extend: true,
        debug: false,

        starsign: {
            'leo': 'Leo',
            'capricorn': 'Capricorn',
            'aquarius': 'Aquarius',
            'pisces': 'Pisces',
            'aries': 'Aries',
            'taurus': 'Taurus',
            'gemini': 'Gemini',
            'cancer': 'Cancer',
            'virgo': 'Virgo',
            'libra': 'Libra',
            'scorpio': 'Scorpio',
            'sagittarius': 'Sagittarius',
            'ophiuchus': 'Ophiuchus',
        },
    },

    // Define required scripts.
    getScripts: function() {
        return ['moment.js'];
    },

    getStyles: function() {
        return ['MMM-Astro.css'];
    },

    // Define start sequence.
    start: function() {
        Log.info('Starting module: ' + this.name);
        this.sendSocketNotification('CONFIG', this.config);
        // Set locale.
        this.today = '';
        this.scheduleUpdate();
    },

    getDom: function() {
        let debug = this.config.debug;
	    if (debug !== false)
        {
	     console.log('From Main.js ~~ Sign: '+this.config.sign+'  Icon set: '+this.config.iconset+' Show Extended: '+this.config.extend);
		 console.log('All Data: Horo: '+this.horo+' <br>Extended: '+this.fortune+' <br>Numbers: '+this.lottery.numbers);
    	}

        var today = this.astro;


        var lottery = this.lottery;


  console.log(lottery);

        console.log(lottery);
        var starSign = this.config.starsign[this.config.sign];



        var wrapper = document.createElement('div');

        if (!this.loaded) {
            wrapper.innerHTML = '<img src=modules/MMM-Astro/icons/loader.gif>';
            return wrapper;
        }


        var ssign = document.createElement('div');
        ssign.classList.add('tops');
        ssign.innerHTML = '<img class=mains src = modules/MMM-Astro/icons/' + this.config.iconset + '/' + starSign + '.svg> ' + starSign;
        wrapper.appendChild(ssign);

        var titless = document.createElement('div');
        titless.classList.add('xsmall', 'bright');
        titless.style.float = 'left';
        titless.innerHTML = '<br>Horoscope for ' + today.current_date+'<br>';
        wrapper.appendChild(titless);


        var afterWithout = this.horo.substr(0, this.horo.lastIndexOf(","));

        var scope = document.createElement('div');
        scope.classList.add('xsmall', 'bright', 'descs');
        scope.innerHTML = '<br><br>' + afterWithout+".";
        wrapper.appendChild(scope);

        if (this.config.extend != false){
            var tom = document.createElement('div');
            tom.classList.add('descs');
            tom.innerHTML = 'Extended :<br>' + this.fortune;
            wrapper.appendChild(tom);
	    }

        var des = document.createElement('div');
        des.classList.add('descs');
        des.innerHTML = 'Your Mood today is: ' + today.mood + '<br> Your Color today is: ' + today.color + '<br>Today you are compatable with: ' + today.compatibility  + '<br><br>Your lucky numbers are: <br>' + lottery;
        wrapper.appendChild(des);

        return wrapper;
    },

    processAstro: function(data) {
        this.loaded = true;
        this.today = data.Today;
        this.astro = data.today;
        this.lottery = data.lottery;
        this.horo = data.dscope.horoscope;
        this.fortune = data.fortune;
        console.log(this.lottery);
    },

    scheduleUpdate: function() {
        setInterval(() => {
            this.getAstro();
        }, this.config.updateInterval);
        this.getAstro(this.config.initialLoadDelay);
    },

    getAstro: function() {
        this.sendSocketNotification('GET_ASTRO');
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === 'ASTRO_RESULTS') {
            this.processAstro(payload);
            this.updateDom(this.config.animationSpeed);
        }
        this.updateDom(this.config.initialLoadDelay);
    },

});
