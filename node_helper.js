/* Magic Mirror
 * Module: MMM-Astro
 *
 * By Cowboysdude
 *
 */
const NodeHelper = require('node_helper');
const request = require('request');
const aztroJs = require("aztro-js");
var RandomOrg = require('random-org');
const fs = require('fs');
const nostra = require('nostra');
var lottery;


module.exports = NodeHelper.create({

    start: function() {
        console.log("Starting module: " + this.name);
        this.scope = {
            timestamp: null,
            data: null
        };
        this.path = "modules/MMM-Astro/scope.json";

        if (fs.existsSync(this.path)) {
            var temp = JSON.parse(fs.readFileSync(this.path, 'utf8'));
      //console.log("Step 1 temp data: "+temp);
            if (temp.timestamp === this.getDate()) {
                this.scope = temp;
            }
        }
    },

    getAstro: function(url) {
	     var self = this;
       let sign = this.config.sign;
//console.log("Step 2 sign: "+sign);
	     request({
            url: "http://horoscope-api.herokuapp.com/horoscope/today/"+ this.config.sign,
            method: 'GET'
        }, (error, response, body) => {
		if (!error && response.statusCode == 200) {
                var dscope = JSON.parse(body);

			}
      //console.log("Step 3 dscope: "+dscope);

  var random = new RandomOrg({ apiKey: '3a5f48b7-ff7a-44f2-9697-476beb8fed1e' });
random.generateIntegers({ min: 1, max: 99, n: 6 })
  .then(function(result) {
    //console.log(result.random.data); // [55, 3]
    lottery = result.random.data.sort(function(a, b){return a-b});
//console.log("Step 6 Lottery: "+ lottery);
});
       	var fortune = nostra.generate();
//console.log("Step 4 fortune: "+fortune);
            aztroJs.getAllHoroscope(sign, function(res) {
//console.log("Step 5 astroJS: "+res);
            var today = res.today;
            var tomorrow = res.tomorrow;

				var timeStamp = self.getDate();
                var result = {
					          fortune,
				            dscope,
                    lottery,
                    today,
                    tomorrow,
                };
        //console.log("Step 7 result"+result);
                self.sendSocketNotification('ASTRO_RESULTS', result);
                self.scope.timestamp = self.getDate();
          //console.log("Step 8 time stamp: "+self.scope.timestamp+" DATA"+self.scope.data)
                self.scope.data = result;
                self.fileWrite();

});

		 });
    },

    fileWrite: function() {
        fs.writeFile(this.path, JSON.stringify(this.scope), function(err) {
            if (err) {
                return console.log(err);
            }
            console.log("The Horoscope file was written!");
        });
    },

    getDate: function() {
        return (new Date()).toLocaleDateString();
    },

    //Subclass socketNotificationReceived received.
    socketNotificationReceived: function(notification, payload) {
        if (notification === 'GET_ASTRO') {
            if (this.scope.timestamp === this.getDate() && this.scope.data !== null && this.config.sign === this.scope.data.dscope.sunsign) {
                this.sendSocketNotification('ASTRO_RESULTS', this.scope.data);
            } else {
                this.getAstro(payload);
            }
        }
        if (notification === 'CONFIG') {
            this.config = payload;
        }
		let debug = this.config.debug;
		if (debug !== false)
		{
	     console.log("From Node_Helper ~~ Sign: "+this.config.sign+"  Icon set: "+this.config.iconset+" Show Tomorrow: "+this.config.extend);
    	}
    }
});
