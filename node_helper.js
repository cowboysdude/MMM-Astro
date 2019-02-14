/* Magic Mirror
 * Module: MMM-Astro
 *
 * By Cowboysdude
 * 
 */
const NodeHelper = require('node_helper');
const aztroJs = require("aztro-js");
const powerball = require('powerball-picker');
const fs = require('fs');
const request = require('request');
const nostra = require('nostra');

module.exports = NodeHelper.create({

    start: function() {
        console.log("Starting module: " + this.name);
        this.scope = {
            timestamp: null,
            data: null
        };
        this.path = "modules/MMM-Astro/info/scope.json";
		
        if (fs.existsSync(this.path)) {
            var temp = JSON.parse(fs.readFileSync(this.path, 'utf8'));
            if (temp.timestamp === this.getDate()) {
                this.scope = temp;
            }
        }
    },

    getAstro: function(url) {
	     var self = this;
         let sign = this.config.sign;
	     
	     request({
            url: "http://horoscope-api.herokuapp.com/horoscope/today/"+ this.config.sign,
            method: 'GET'
        }, (error, response, body) => {
		if (!error && response.statusCode == 200) {
                var dscope = JSON.parse(body);
				console.log(dscope);
			}
        	var fortune = nostra.generate(); 
				
            aztroJs.getAllHoroscope(sign, function(res) {
   console.log(res);
            var today = res.today;
            var tomorrow = res.tomorrow;
            var apiKey = "c78db221-eda1-4636-85cc-b1bfa6fb545c"
            var client = new powerball(apiKey);
            client.pickPowerball(data => {
                var lottery = data;
                var result = {
				    fortune,
				    dscope,
                    lottery,
                    today,
                    tomorrow
                };
                self.sendSocketNotification('ASTRO_RESULTS', result);
                self.scope.timestamp = self.getDate();
                self.scope.data = result;
                self.fileWrite();
            });
         
        })
		 });
    },

    fileWrite: function() {
        fs.writeFile(this.path, JSON.stringify(this.scope), function(err) {
            if (err) {
                return console.log(err);
            }
            console.log("The Horoscope file was saved!");
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